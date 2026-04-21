import fs from 'fs';
import path from 'path';
import { Session, CreateSessionRequest, Message } from '../types/index.js';
import { v4 as uuidv4 } from 'uuid';

const DATA_FILE = path.join(process.cwd(), 'sessions.json');

function loadSessions(): Session[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to load sessions:', e);
  }
  return [];
}

function saveSessions(sessions: Session[]): void {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(sessions, null, 2));
  } catch (e) {
    console.error('Failed to save sessions:', e);
  }
}

export function getAllSessions(): Session[] {
  return loadSessions();
}

export function getSession(id: string): Session | undefined {
  const sessions = loadSessions();
  return sessions.find(s => s.id === id);
}

export function createSession(data: CreateSessionRequest): Session {
  const sessions = loadSessions();
  
  const sessionId = uuidv4();
  const newSession: Session = {
    id: sessionId,
    name: data.name || `Session ${sessions.length + 1}`,
    projectTag: data.projectTag,
    status: 'idle',
    workdir: data.workdir && typeof data.workdir === 'string' 
      ? data.workdir 
      : '/root/.openclaw/workspace/agentcrew/server/sessions/' + sessionId,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: [],
    subagents: [],
    queue: []
  };
  
  // Create session working directory for resume support
  const sessionsBaseDir = '/root/.openclaw/workspace/agentcrew/server/sessions';
  if (!fs.existsSync(sessionsBaseDir)) {
    fs.mkdirSync(sessionsBaseDir, { recursive: true });
  }
  if (newSession.workdir) {
    if (!fs.existsSync(newSession.workdir)) {
      fs.mkdirSync(newSession.workdir, { recursive: true });
    }
  }

  sessions.push(newSession);
  saveSessions(sessions);
  
  return newSession;
}

export function updateSession(id: string, data: Partial<Session>): Session | null {
  const sessions = loadSessions();
  const index = sessions.findIndex(s => s.id === id);
  
  if (index === -1) return null;
  
  sessions[index] = {
    ...sessions[index],
    ...data,
    updatedAt: Date.now()
  };
  
  saveSessions(sessions);
  return sessions[index];
}

export function deleteSession(id: string): boolean {
  const sessions = loadSessions();
  const index = sessions.findIndex(s => s.id === id);
  
  if (index === -1) return false;
  
  sessions.splice(index, 1);
  saveSessions(sessions);
  return true;
}

export function addMessage(sessionId: string, message: Omit<Message, 'id' | 'timestamp'>): Message | null {
  const sessions = loadSessions();
  const session = sessions.find(s => s.id === sessionId);
  
  if (!session) return null;
  
  const newMessage: Message = {
    id: uuidv4(),
    ...message,
    timestamp: Date.now()
  };
  
  session.messages.push(newMessage);
  session.updatedAt = Date.now();
  
  saveSessions(sessions);
  return newMessage;
}

export function addAssistantMessage(sessionId: string, content: string): Message | null {
  const sessions = loadSessions();
  const session = sessions.find(s => s.id === sessionId);
  
  if (!session) return null;
  
  const newMessage: Message = {
    id: uuidv4(),
    role: 'assistant',
    content,
    timestamp: Date.now()
  };
  
  session.messages.push(newMessage);
  session.updatedAt = Date.now();
  
  saveSessions(sessions);
  return newMessage;
}

export function appendToLastAssistantMessage(sessionId: string, content: string): boolean {
  const sessions = loadSessions();
  const session = sessions.find(s => s.id === sessionId);
  
  if (!session) return false;
  
  const lastAssistant = [...session.messages].reverse().find(m => m.role === 'assistant');
  if (!lastAssistant) return false;
  
  lastAssistant.content += content;
  session.updatedAt = Date.now();
  
  saveSessions(sessions);
  return true;
}

export function updateSessionStatus(id: string, status: Session['status'], error?: string): Session | null {
  const sessions = loadSessions();
  const session = sessions.find(s => s.id === id);
  
  if (!session) return null;
  
  session.status = status;
  session.lastError = error;
  session.updatedAt = Date.now();
  
  saveSessions(sessions);
  return session;
}

export function setSessionProcess(id: string, processId: number): Session | null {
  const sessions = loadSessions();
  const session = sessions.find(s => s.id === id);
  
  if (!session) return null;
  
  session.processId = processId;
  session.updatedAt = Date.now();
  
  saveSessions(sessions);
  return session;
}

export function clearSessionProcess(id: string, status?: 'idle' | 'done' | 'error'): Session | null {
  const sessions = loadSessions();
  const session = sessions.find(s => s.id === id);
  
  if (!session) return null;
  
  session.processId = undefined;
  // Only set status if explicitly provided, otherwise leave current status
  if (status) {
    session.status = status;
  }
  session.updatedAt = Date.now();
  
  saveSessions(sessions);
  return session;
}

// Subagent management
export function addSubagent(sessionId: string, name: string, task: string): Session['subagents'][0] | null {
  const sessions = loadSessions();
  const session = sessions.find(s => s.id === sessionId);
  
  if (!session) return null;
  
  const subagent: Session['subagents'][0] = {
    id: uuidv4(),
    name,
    task,
    status: 'idle',
    output: ''
  };
  
  session.subagents.push(subagent);
  session.updatedAt = Date.now();
  
  saveSessions(sessions);
  return subagent;
}

export function updateSubagent(sessionId: string, subagentId: string, data: Partial<Session['subagents'][0]>): boolean {
  const sessions = loadSessions();
  const session = sessions.find(s => s.id === sessionId);
  
  if (!session) return false;
  
  const subagent = session.subagents.find(sa => sa.id === subagentId);
  if (!subagent) return false;
  
  Object.assign(subagent, data);
  session.updatedAt = Date.now();
  
  saveSessions(sessions);
  return true;
}

export function addToQueue(sessionId: string, message: string): Session | null {
  const sessions = loadSessions();
  const session = sessions.find(s => s.id === sessionId);
  
  if (!session) return null;
  
  if (!session.queue) session.queue = [];
  session.queue.push(message);
  session.updatedAt = Date.now();
  
  saveSessions(sessions);
  return session;
}

export function popFromQueue(sessionId: string): string | null {
  const sessions = loadSessions();
  const session = sessions.find(s => s.id === sessionId);
  
  if (!session || !session.queue || session.queue.length === 0) return null;
  
  const message = session.queue.shift()!;
  session.updatedAt = Date.now();
  
  saveSessions(sessions);
  return message;
}

export function getQueueSize(sessionId: string): number {
  const sessions = loadSessions();
  const session = sessions.find(s => s.id === sessionId);
  
  if (!session || !session.queue) return 0;
  return session.queue.length;
}