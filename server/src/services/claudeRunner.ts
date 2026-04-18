import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import { SessionEvent, Session } from '../types/index.js';
import * as sessionManager from './sessionManager.js';
import * as fs from 'fs';
import * as path from 'path';

interface RunningProcess {
  process: ChildProcess;
  sessionId: string;
}

// Base directory for session working directories
const SESSIONS_BASE_DIR = path.join(process.cwd(), 'sessions');

// Maximum command line argument size (1MB to be safe on Linux)
const MAX_ARG_SIZE = 1000 * 1024;

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

    // Use session-specific working directory for resume support
    // Claude Code stores conversation history in .claude/ directory
    let sessionWorkDir = workdir;
    if (!sessionWorkDir) {
      sessionWorkDir = path.join(SESSIONS_BASE_DIR, sessionId);
      // Create session directory if it doesn't exist
      if (!fs.existsSync(sessionWorkDir)) {
        fs.mkdirSync(sessionWorkDir, { recursive: true });
      }
    }

    const cwd = sessionWorkDir;

    this.sendEvent(sessionId, {
      type: 'status',
      data: 'Claude Code is working...',
      timestamp: Date.now()
    });

    // Just send the current task - Claude Code handles conversation context internally via .claude/
    // This avoids E2BIG errors with long conversation histories
    const fullTask = task;

    // Detect if running as root - bypass permission check for root
    const env = { ...process.env };
    if (process.getuid && process.getuid() === 0) {
      env.CLAUDE_NO_CHECK = '1';
    }

    const claudeProcess = spawn('claude', [
      '--verbose',
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
    let toolOutputBuffer = '';
    let toolOutputType: 'text' | 'image' | 'resource' | undefined;

    claudeProcess.stdout?.on('data', (data: Buffer) => {
      const text = data.toString();
      outputBuffer += text;

      // Parse complete JSON objects from buffer
      const lines = outputBuffer.split('\n');
      outputBuffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;

        try {
          const parsed = JSON.parse(line);

          // Process based on type
          switch (parsed.type) {
            case 'assistant':
            case 'result':
              // Send actual text content to frontend (not raw JSON)
              if (parsed.message?.content) {
                const content = parsed.message.content.map((c: any) => c.text || '').join('');
                if (content) {
                  this.sendEvent(sessionId, {
                    type: 'output',
                    data: content,
                    timestamp: Date.now()
                  });
                }
                sessionManager.appendToLastAssistantMessage(sessionId, content);
              } else if (parsed.result) {
                // For result type, send the result text
                this.sendEvent(sessionId, {
                  type: 'output',
                  data: parsed.result,
                  timestamp: Date.now()
                });
              }
              
              // Check if this is the final result (subtype: success with end_turn)
              if (parsed.type === 'result' && parsed.subtype === 'success' && parsed.stop_reason === 'end_turn') {
                sessionManager.updateSessionStatus(sessionId, 'done');
                this.sendEvent(sessionId, {
                  type: 'done',
                  data: 'completed',
                  timestamp: Date.now()
                });
              }
              break;

            case 'tools':
              // Tools being used
              if (parsed.tools) {
                currentTool = parsed.tools.map((t: any) => t.name).join(', ');
                toolOutputBuffer = '';
              }
              break;

            case 'tool-result':
              if (parsed.results) {
                for (const result of parsed.results) {
                  if (result.output) {
                    toolOutputBuffer += result.output;
                    toolOutputType = result.type || 'text';
                  } else if (result.error) {
                    toolOutputBuffer += `Error: ${result.error}`;
                    toolOutputType = 'text';
                  }
                }

                if (currentTool && toolOutputBuffer) {
                  const toolContent = `[Tool: ${currentTool}]\n${toolOutputBuffer}`;
                  sessionManager.addMessage(sessionId, {
                    role: 'assistant',
                    content: toolContent
                  });
                  currentTool = null;
                  toolOutputBuffer = '';
                  toolOutputType = undefined;
                }
              }
              break;

            case 'subagent':
              if (parsed.name) {
                currentSubagent = parsed.name;
                this.sendEvent(sessionId, {
                  type: 'status',
                  data: `Subagent working: ${parsed.name}`,
                  timestamp: Date.now()
                });
              }
              break;

            case 'error':
              console.error('Claude error:', parsed.error);
              this.sendEvent(sessionId, {
                type: 'error',
                data: parsed.error || 'Unknown error',
                timestamp: Date.now()
              });
              break;

            case 'finish':
              sessionManager.updateSessionStatus(sessionId, 'done');
              this.sendEvent(sessionId, {
                type: 'status',
                data: 'completed',
                timestamp: Date.now()
              });
              break;

            case 'system':
              // System events - log if verbose, but don't send to frontend
              if (parsed.msg) {
                console.log('Claude system:', parsed.msg);
              }
              break;
          }
        } catch (err) {
          // Not JSON, might be partial - ignore
        }
      }
    });

    claudeProcess.stderr?.on('data', (data: Buffer) => {
      const text = data.toString().trim();
      if (text) {
        console.error('Claude stderr:', text);
        // Also send errors to frontend
        this.sendEvent(sessionId, {
          type: 'error',
          data: text,
          timestamp: Date.now()
        });
      }
    });

    claudeProcess.on('close', (code) => {
      console.log(`Claude process exited with code ${code}`);
      
      // Handle abnormal exits
      if (code !== 0) {
        console.error(`Claude exited with code ${code}`);
        sessionManager.updateSessionStatus(sessionId, 'error');
        this.sendEvent(sessionId, {
          type: 'error',
          data: `Process exited with code ${code}`,
          timestamp: Date.now()
        });
      }

      this.runningProcesses.delete(sessionId);
      sessionManager.clearSessionProcess(sessionId);
    });

    claudeProcess.on('error', (err) => {
      console.error('Claude runner error:', err);
      sessionManager.updateSessionStatus(sessionId, 'error');
      this.sendEvent(sessionId, {
        type: 'error',
        data: err.message || 'Failed to start Claude',
        timestamp: Date.now()
      });
      this.runningProcesses.delete(sessionId);
      sessionManager.clearSessionProcess(sessionId);
    });
  }

  stop(sessionId: string): void {
    const running = this.runningProcesses.get(sessionId);
    if (running) {
      console.log(`Stopping process for session ${sessionId}`);
      running.process.kill('SIGTERM');
      this.runningProcesses.delete(sessionId);
      sessionManager.clearSessionProcess(sessionId);
    }
  }
}

export const claudeRunner = new ClaudeRunner();
