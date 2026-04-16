// Session types
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface Subagent {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'done' | 'error';
  task: string;
  output: string;
}

export type SessionStatus = 'idle' | 'running' | 'writing' | 'done' | 'error';

export interface Session {
  id: string;
  name: string;
  projectTag?: string;
  status: SessionStatus;
  workdir?: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
  subagents: Subagent[];
  processId?: number;
  lastError?: string;
}

// API types
export interface CreateSessionRequest {
  name: string;
  projectTag?: string;
  workdir?: string;
}

export interface SendMessageRequest {
  content: string;
  workdir?: string;
}

export interface CreateSubagentRequest {
  name: string;
  task: string;
}

export interface UpdateSessionRequest {
  name?: string;
  projectTag?: string;
}

// SSE Event types
export type SessionEventType = 
  | 'output'
  | 'error'
  | 'done'
  | 'status'
  | 'thinking';

export interface SessionEvent {
  type: SessionEventType;
  data: string;
  timestamp: number;
}