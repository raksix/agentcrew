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
      data: 'Starting Claude Code...',
      timestamp: Date.now()
    });

    // Use --print mode for non-interactive execution
    // Detect if running as root - bypass permission check for root
    const env = { ...process.env };
    if (process.getuid && process.getuid() === 0) {
      env.CLAUDE_NO_CHECK = '1';
    }

    const claudeProcess = spawn('claude', [
      '--print',
      task
    ], {
      cwd,
      env,
      shell: true
    });

    this.runningProcesses.set(sessionId, {
      process: claudeProcess,
      sessionId
    });

    sessionManager.setSessionProcess(sessionId, claudeProcess.pid!);

    let outputBuffer = '';

    claudeProcess.stdout?.on('data', (data: Buffer) => {
      const text = data.toString();
      outputBuffer += text;
      
      this.sendEvent(sessionId, {
        type: 'output',
        data: text,
        timestamp: Date.now()
      });
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
      this.removeSessionListeners(sessionId);

      if (code === 0) {
        sessionManager.updateSessionStatus(sessionId, 'done');
        this.sendEvent(sessionId, {
          type: 'done',
          data: outputBuffer,
          timestamp: Date.now()
        });
      } else {
        sessionManager.updateSessionStatus(sessionId, 'error', `Exited with code ${code}`);
        this.sendEvent(sessionId, {
          type: 'error',
          data: `Process exited with code ${code}`,
          timestamp: Date.now()
        });
      }
    });

    claudeProcess.on('error', (err) => {
      this.runningProcesses.delete(sessionId);
      sessionManager.updateSessionStatus(sessionId, 'error', err.message);
      this.sendEvent(sessionId, {
        type: 'error',
        data: err.message,
        timestamp: Date.now()
      });
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