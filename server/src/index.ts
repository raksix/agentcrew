import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import * as sessionManager from './services/sessionManager.js';
import { claudeRunner } from './services/claudeRunner.js';
import { CreateSessionRequest, SendMessageRequest, SessionEvent } from './types/index.js';
import mcpRouter from './routes/mcp.js';

// Create uploads directory
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Allow images and PDFs
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only images and PDFs are allowed'));
    }
  }
});

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(UPLOADS_DIR));

// File upload endpoint
app.post('/api/upload', upload.array('files', 5), (req, res) => {
  try {
    const files = (req.files as Express.Multer.File[] || []).map(file => ({
      id: uuidv4(),
      originalName: file.originalname,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      url: `/uploads/${file.filename}`
    }));
    res.json({ files });
  } catch (error) {
    res.status(500).json({ error: 'Upload failed' });
  }
});

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

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong' }));
      }
    } catch (err) {
      // Ignore non-JSON messages
    }
  });
  
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

// MCP server management
app.use('/api/mcp', mcpRouter);

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

  // Check if session is busy - if so, add to queue
  if (session.status === 'running' || session.status === 'writing') {
    const updatedSession = sessionManager.addToQueue(req.params.id, data.content);
    return res.json({ 
      queued: true,
      queueSize: updatedSession ? updatedSession.queue.length : 1,
      session: updatedSession
    });
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
    queued: false,
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

// On startup, reset any "running" sessions to "idle" (backend was likely restarted)
const sessions = sessionManager.getAllSessions();
sessions.forEach(session => {
  if (session.status === 'running') {
    sessionManager.updateSessionStatus(session.id, 'idle');
    console.log(`Reset session ${session.id} from running to idle (backend restarted)`);
  }
});

server.listen(PORT, () => {
  console.log(`AgentCrew Server running on http://localhost:${PORT}`);
});
