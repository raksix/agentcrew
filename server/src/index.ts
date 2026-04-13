import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import * as sessionManager from './services/sessionManager.js';
import { claudeRunner } from './services/claudeRunner.js';
import { CreateSessionRequest, SendMessageRequest, SessionEvent } from './types/index.js';

const app = express();
const server = createServer(app);

app.use(cors());
app.use(express.json());

// SSE clients
const sseClients = new Map<string, (event: SessionEvent) => void>();

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: Date.now() });
});

// Get all sessions
app.get('/api/sessions', (req, res) => {
  const sessions = sessionManager.getAllSessions();
  res.json(sessions);
});

// Create new session
app.post('/api/sessions', (req, res) => {
  const data = req.body as CreateSessionRequest;
  const session = sessionManager.createSession(data);
  res.json(session);
});

// Get single session
app.get('/api/sessions/:id', (req, res) => {
  const session = sessionManager.getSession(req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  res.json(session);
});

// Update session
app.patch('/api/sessions/:id', (req, res) => {
  const session = sessionManager.updateSession(req.params.id, req.body);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  res.json(session);
});

// Delete session
app.delete('/api/sessions/:id', (req, res) => {
  claudeRunner.stop(req.params.id);
  const success = sessionManager.deleteSession(req.params.id);
  res.json({ success });
});

// Send message and run Claude Code
app.post('/api/sessions/:id/message', async (req, res) => {
  const data = req.body as SendMessageRequest;
  const session = sessionManager.getSession(req.params.id);
  
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  // Add user message
  const message = sessionManager.addMessage(req.params.id, {
    role: 'user',
    content: data.content
  });

  if (!message) {
    return res.status(500).json({ error: 'Failed to add message' });
  }

  // Setup SSE for this session
  const sendEvent = (event: SessionEvent) => {
    const client = sseClients.get(req.params.id);
    if (client) {
      client(event);
    }
  };

  claudeRunner.onSessionEvent(req.params.id, sendEvent);

  // Run Claude Code in background
  const workdir = data.workdir || session.workdir;
  
  claudeRunner.run(req.params.id, data.content, workdir).catch(err => {
    console.error('Claude runner error:', err);
  });

  res.json({ 
    message,
    session: sessionManager.getSession(req.params.id)
  });
});

// Stop Claude Code
app.post('/api/sessions/:id/stop', (req, res) => {
  claudeRunner.stop(req.params.id);
  res.json({ success: true });
});

// SSE events stream
app.get('/api/sessions/:id/events', (req, res) => {
  const sessionId = req.params.id;
  
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  sseClients.set(sessionId, (event: SessionEvent) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  });

  req.on('close', () => {
    sseClients.delete(sessionId);
    claudeRunner.removeSessionListeners(sessionId);
  });
});

const PORT = 4005;

server.listen(PORT, () => {
  console.log(`AgentCrew Server running on http://localhost:${PORT}`);
});