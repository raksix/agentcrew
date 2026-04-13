import { Session, CreateSessionRequest, SendMessageRequest, Message } from './types';

const API_BASE = 'http://localhost:4005/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
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
  return request<Session[]>(`${API_BASE}/sessions`);
}

export async function getSession(id: string): Promise<Session> {
  return request<Session>(`${API_BASE}/sessions/${id}`);
}

export async function createSession(data: CreateSessionRequest): Promise<Session> {
  return request<Session>(`${API_BASE}/sessions`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateSession(id: string, data: Partial<Session>): Promise<Session> {
  return request<Session>(`${API_BASE}/sessions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteSession(id: string): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`${API_BASE}/sessions/${id}`, {
    method: 'DELETE',
  });
}

export async function sendMessage(sessionId: string, data: SendMessageRequest): Promise<{ message: Message; session: Session }> {
  return request<{ message: Message; session: Session }>(`${API_BASE}/sessions/${sessionId}/message`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function stopSession(sessionId: string): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`${API_BASE}/sessions/${sessionId}/stop`, {
    method: 'POST',
  });
}

// SSE for real-time events
export function createSessionEventSource(sessionId: string): EventSource {
  return new EventSource(`${API_BASE}/sessions/${sessionId}/events`);
}

// Health check
export async function healthCheck(): Promise<{ status: string; time: number }> {
  return request(`${API_BASE}/health`);
}