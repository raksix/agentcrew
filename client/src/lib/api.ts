import { Session, Message } from './types';

function getApiBase(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin + '/api';
  }
  return 'http://localhost:4005/api';
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const apiBase = getApiBase();
  const fullUrl = url.startsWith('http') ? url : apiBase + url;
  
  const res = await fetch(fullUrl, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || `HTTP ${res.status}`);
  }
  
  return res.json();
}

// Sessions API
export async function getSessions(): Promise<Session[]> {
  return request<Session[]>('/sessions');
}

export async function getSession(id: string): Promise<Session> {
  return request<Session>(`/sessions/${id}`);
}

export async function createSession(data: { name: string; projectTag?: string }): Promise<Session> {
  return request<Session>('/sessions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteSession(id: string): Promise<void> {
  await request(`/sessions/${id}`, { method: 'DELETE' });
}

export async function sendMessage(sessionId: string, content: string): Promise<{ message: Message; session: Session }> {
  return request(`/sessions/${sessionId}/message`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

export async function stopSession(sessionId: string): Promise<void> {
  await request(`/sessions/${sessionId}/stop`, { method: 'POST' });
}

export function createSessionWebSocket(sessionId: string): WebSocket {
  const apiBase = getApiBase();
  const wsUrl = apiBase.replace(/^http/, 'ws') + `/sessions/${sessionId}/ws`;
  return new WebSocket(wsUrl);
}

// File upload API
export interface UploadedFile {
  id: string;
  originalName: string;
  filename: string;
  mimetype: string;
  size: number;
  url: string;
}

export async function uploadFiles(files: File[]): Promise<UploadedFile[]> {
  const apiBase = getApiBase();
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));
  
  const res = await fetch(apiBase + '/upload', {
    method: 'POST',
    body: formData,
  });
  
  if (!res.ok) {
    throw new Error('Upload failed');
  }
  
  const data = await res.json();
  return data.files;
}