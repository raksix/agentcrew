// API types - matches server types

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

export type SessionStatus = 'idle' | 'running' | 'done' | 'error';

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

export interface SessionEvent {
  type: 'output' | 'error' | 'done' | 'status';
  data: string;
  timestamp: number;
}