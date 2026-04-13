import Elysia from 'elysia';
import * as sessionManager from '../services/sessionManager.js';
import { claudeRunner } from '../services/claudeRunner.js';
import { CreateSessionRequest, SendMessageRequest, CreateSubagentRequest, UpdateSessionRequest, SessionEvent } from '../types/index.js';

export const sessionsRoutes = new Elysia({ prefix: '/api/sessions' })

  // Get all sessions
  .get('/', async () => {
    return sessionManager.getAllSessions();
  })

  // Create new session
  .post('/', async ({ body }) => {
    const data = body as CreateSessionRequest;
    const session = sessionManager.createSession(data);
    return session;
  })

  // Get single session
  .get('/:id', async ({ params: { id } }) => {
    const session = sessionManager.getSession(id);
    if (!session) {
      return { error: 'Session not found' };
    }
    return session;
  })

  // Update session
  .patch('/:id', async ({ params: { id }, body }) => {
    const data = body as UpdateSessionRequest;
    const session = sessionManager.updateSession(id, data);
    if (!session) {
      return { error: 'Session not found' };
    }
    return session;
  })

  // Delete session
  .delete('/:id', async ({ params: { id } }) => {
    // Stop any running process first
    claudeRunner.stop(id);
    
    const success = sessionManager.deleteSession(id);
    return { success };
  })

  // Send message and run Claude Code
  .post('/:id/message', async ({ params: { id }, body }) => {
    const data = body as SendMessageRequest;
    const session = sessionManager.getSession(id);
    
    if (!session) {
      return { error: 'Session not found' };
    }

    // Add user message
    const message = sessionManager.addMessage(id, {
      role: 'user',
      content: data.content
    });

    if (!message) {
      return { error: 'Failed to add message' };
    }

    // Run Claude Code in background
    const workdir = data.workdir || session.workdir;
    
    claudeRunner.run(id, data.content, workdir).catch(err => {
      console.error('Claude runner error:', err);
    });

    return { 
      message,
      session: sessionManager.getSession(id)
    };
  })

  // Stop Claude Code
  .post('/:id/stop', async ({ params: { id } }) => {
    claudeRunner.stop(id);
    return { success: true };
  })

  // SSE events stream
  .get('/:id/events', async ({ params: { id } }) => {
    const session = sessionManager.getSession(id);
    if (!session) {
      return { error: 'Session not found' };
    }

    // Set headers for SSE
    const headers = {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    };

    // Return a response that will be handled by the SSE handler
    return new Response(null, { status: 200, headers });
  });

export function setupSSE(id: string, onEvent: (event: SessionEvent) => void) {
  claudeRunner.onSessionEvent(id, onEvent);
}

export function removeSSE(id: string) {
  claudeRunner.removeSessionListeners(id);
}