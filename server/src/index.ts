import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import * as sessionManager from './services/sessionManager.js';
import { claudeRunner } from './services/claudeRunner.js';
import { CreateSessionRequest, SendMessageRequest, SessionEvent } from './types/index.js';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());

// WebSocket clients
const wsClients = new Map<string, Set<WebSocket>>();

function broadcastToSession(sessionId: string, event: SessionEvent) {
  const clients = wsClients.get(sessionId);
  if (clients) {
    const message = JSON.stringify(event);
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
}

// WebSocket handling
wss.on('connection', (ws, req) => {
  const reqUrl = req.url || '/';
  const url = new URL(reqUrl, 'http://localhost');
  const pathParts = url.pathname.split('/');
  // pathParts: ['', 'api', 'sessions', '<sessionId>', 'ws']
  // Get second-to-last element (session ID, before 'ws')
  const sessionId = pathParts.length >= 2 ? pathParts[pathParts.length - 2] : null;
  
  if (!sessionId) {
    ws.close();
    return;
  }


  console.log('WebSocket connected for session:', sessionId);

  if (!wsClients.has(sessionId)) {
    wsClients.set(sessionId, new Set());
  }
  wsClients.get(sessionId)!.add(ws);

  ws.on('close', () => {
    const clients = wsClients.get(sessionId);
    if (clients) {
      clients.delete(ws);
      if (clients.size === 0) {
        wsClients.delete(sessionId);
      }
    }
  });

  ws.on('error', (err) => {
    console.error('WebSocket error:', err);
  });
});

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

  // Setup WebSocket broadcast for this session
  const sendEvent = (event: SessionEvent) => {
    broadcastToSession(req.params.id, event);
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

const PORT = 4005;

server.listen(PORT, () => {
  console.log(`AgentCrew Server running on http://localhost:${PORT}`);
});
