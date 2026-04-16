import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import { SessionEvent, Session } from '../types/index.js';
import * as sessionManager from './sessionManager.js';

interface RunningProcess {
  process: ChildProcess;
  sessionId: string;
}

class ClaudeRunner extends EventEmitter {
  private runningProcesses: Map<string, RunningProcess> = new Map();
  private eventStreams: Map<string, ((event: SessionEvent) => void)[]> = new Map();

  sendEvent(sessionId: string, event: SessionEvent) {
    const listeners = this.eventStreams.get(sessionId) || [];
    listeners.forEach(fn => fn(event));
  }

  onSessionEvent(sessionId: string, fn: (event: SessionEvent) => void) {
    if (!this.eventStreams.has(sessionId)) {
      this.eventStreams.set(sessionId, []);
    }
    this.eventStreams.get(sessionId)!.push(fn);
  }

  removeSessionListeners(sessionId: string) {
    this.eventStreams.delete(sessionId);
  }

  async run(sessionId: string, task: string, workdir?: string): Promise<void> {
    // Stop any existing process for this session
    this.stop(sessionId);

    sessionManager.updateSessionStatus(sessionId, 'running');

    const cwd = workdir || process.cwd();

    this.sendEvent(sessionId, {
      type: 'status',
      data: 'Claude Code is working...',
      timestamp: Date.now()
    });

    // Build conversation context from message history
    const session = sessionManager.getSession(sessionId);
    const messages = session?.messages || [];

    // Include conversation history in prompt
    let fullTask = task;
    if (messages.length > 0) {
      const history = messages.map(m => {
        if (m.role === 'user') return `User: ${m.content}`;
        if (m.role === 'assistant') return `Assistant: ${m.content}`;
        return '';
      }).filter(Boolean).join('\n');

      fullTask = `Previous conversation:\n${history}\n\nCurrent request: ${task}`;
    }

    // Use --print mode for non-interactive execution
    // Detect if running as root - bypass permission check for root
    const env = { ...process.env };
    if (process.getuid && process.getuid() === 0) {
      env.CLAUDE_NO_CHECK = '1';
    }

    const claudeProcess = spawn('claude', [
      '--output-format', 'stream-json',
      '--settings', JSON.stringify({
        permissions: {
          allow: ['Read', 'Write', 'Bash', 'Edit', 'Notebook', 'WebFetch', 'Grep', 'Glob', 'LS', 'Shell'],
          mode: 'bypassPermissions'
        }
      }),
      '--',
      fullTask
    ], {
      cwd,
      env,
      shell: false,
      stdio: ['ignore', 'pipe', 'pipe']
    });


    this.runningProcesses.set(sessionId, {
      process: claudeProcess,
      sessionId
    });

    sessionManager.setSessionProcess(sessionId, claudeProcess.pid!);

    let outputBuffer = '';
    // Create initial assistant message
    sessionManager.addAssistantMessage(sessionId, '');

    // Track ongoing output for subagent display
    let currentSubagent: string | null = null;
    let currentTool: string | null = null;

    claudeProcess.stdout?.on('data', (data: Buffer) => {
      const text = data.toString();
      outputBuffer += text;
      
      // Set status to writing when receiving output
      sessionManager.updateSessionStatus(sessionId, 'writing');
      
      // Parse stream-json format (each line is a JSON object)
      const lines = text.split('\n').filter(line => line.trim());
      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          
          // Extract displayable content based on message type
          let displayText = '';
          
          if (parsed.type === 'assistant' && parsed.message?.content) {
            // Parse assistant message content blocks
            const content = parsed.message.content;
            if (Array.isArray(content)) {
              for (const block of content) {
                if (block.type === 'text') {
                  displayText += block.text || '';
                } else if (block.type === 'thinking') {
                  displayText += `[Thinking: ${block.thinking?.substring(0, 100)}...]
`;
                }
              }
            }
          } else if (parsed.type === 'result') {
            displayText = parsed.result || '';
          } else if (parsed.type === 'tools' && parsed.tools) {
            // Tools being used
            for (const tool of parsed.tools) {
              if (tool.name) {
                displayText += `[Using tool: ${tool.name}]
`;
                currentTool = tool.name;
              }
            }
          } else if (parsed.type === 'tool-result' && parsed.toolResult) {
            const result = parsed.toolResult;
            if (result.name) displayText += `[${result.name}] `;
            if (result.output) displayText += result.output.substring(0, 200);
            if (result.output?.length > 200) displayText += '...';
            displayText += '\n';
          } else if (parsed.type === 'subagent' && parsed.subagent) {
            displayText += `[Subagent: ${parsed.subagent.name || 'running'}]
`;
            currentSubagent = parsed.subagent.name || 'running';
          } else if (parsed.type === 'error') {
            displayText = `[Error: ${parsed.error}]\n`;
          } else if (parsed.type === 'finish') {
            continue; // Don't append, finish event handles final state
          }
          
          if (displayText) {
            sessionManager.appendToLastAssistantMessage(sessionId, displayText);
            this.sendEvent(sessionId, {
              type: 'output',
              data: displayText,
              timestamp: Date.now()
            });
          }
        } catch (e) {
          // Not JSON, send as raw output
          if (line.trim()) {
            sessionManager.appendToLastAssistantMessage(sessionId, line + '\n');
            this.sendEvent(sessionId, {
              type: 'output',
              data: line + '\n',
              timestamp: Date.now()
            });
          }
        }
      }
    });

    claudeProcess.stderr?.on('data', (data: Buffer) => {
      const text = data.toString();
      // Only send as error if it's actually an error
      if (text.trim()) {
        this.sendEvent(sessionId, {
          type: 'error',
          data: text,
          timestamp: Date.now()
        });
      }
    });

    claudeProcess.on('close', (code) => {
      this.runningProcesses.delete(sessionId);
      sessionManager.clearSessionProcess(sessionId);

      // Parse final output for result summary
      let finalOutput = '';
      const lines = outputBuffer.split('\n').filter(line => line.trim());
      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          if (parsed.type === 'result' && parsed.result) {
            finalOutput = parsed.result;
          } else if (parsed.type === 'error' && parsed.error) {
            finalOutput = `[Error: ${parsed.error}]`;
          }
        } catch (e) {
          // Not JSON
        }
      }

      // Check if we received any output - if not and code is 1, might be permission issue
      if (code !== 0 && !finalOutput && !outputBuffer.trim()) {
        sessionManager.updateSessionStatus(sessionId, 'error', `Exited with code ${code} (no output)`);
        this.sendEvent(sessionId, {
          type: 'error',
          data: `Process exited with code ${code} (no output)`,
          timestamp: Date.now()
        });
      } else if (code === 0) {
        sessionManager.updateSessionStatus(sessionId, 'done');
        this.sendEvent(sessionId, {
          type: 'done',
          data: finalOutput || 'Completed',
          timestamp: Date.now()
        });
      } else {
        sessionManager.updateSessionStatus(sessionId, 'error', `Exited with code ${code}`);
        this.sendEvent(sessionId, {
          type: 'error',
          data: finalOutput || outputBuffer || `Process exited with code ${code}`,
          timestamp: Date.now()
        });
      }

      // Remove listeners AFTER sending done/error events
      this.removeSessionListeners(sessionId);
    });

    claudeProcess.on('error', (err) => {
      sessionManager.updateSessionStatus(sessionId, 'error', err.message);
      this.sendEvent(sessionId, {
        type: 'error',
        data: err.message,
        timestamp: Date.now()
      });
      this.removeSessionListeners(sessionId);
    });
  }

  stop(sessionId: string) {
    const running = this.runningProcesses.get(sessionId);
    if (running) {
      running.process.kill('SIGTERM');
      this.runningProcesses.delete(sessionId);
      sessionManager.clearSessionProcess(sessionId);

      this.sendEvent(sessionId, {
        type: 'status',
        data: 'Stopped by user',
        timestamp: Date.now()
      });
    }
  }

  isRunning(sessionId: string): boolean {
    return this.runningProcesses.has(sessionId);
  }
}

export const claudeRunner = new ClaudeRunner();