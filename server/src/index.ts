import Elysia from 'elysia';
import { sessionsRoutes, setupSSE, removeSSE } from './routes/sessions.js';
import { SessionEvent } from './types/index.js';
import './services/sessionManager.js'; // Initialize singleton

const app = new Elysia()
  .use(sessionsRoutes)
  .get('/api/health', () => ({ status: 'ok', time: Date.now() }))
  .listen(4005);

console.log('AgentCrew Server running on http://localhost:4005');

// Handle SSE connections manually since Elysia doesn't have native SSE support
// We'll use a simple HTTP approach for the events endpoint

const sseClients = new Map<string, (event: SessionEvent) => void>();

// Export function to register SSE handlers
export function handleSSE(sessionId: string, sendFn: (event: SessionEvent) => void) {
  sseClients.set(sessionId, sendFn);
  
  // Register with claudeRunner
  const { claudeRunner } = require('./services/claudeRunner.js');
  claudeRunner.onSessionEvent(sessionId, (event: SessionEvent) => {
    const send = sseClients.get(sessionId);
    if (send) send(event);
  });
}

export function removeSSEClient(sessionId: string) {
  sseClients.delete(sessionId);
  const { claudeRunner } = require('./services/claudeRunner.js');
  claudeRunner.removeSessionListeners(sessionId);
}

// Custom SSE endpoint handler
const originalListen = app.listen;
app.listen = function(port: number) {
  // Add raw HTTP handler for SSE
  const server = (app as any).server;
  if (server) {
    server.on('request', (req: any, res: any) => {
      if (req.url?.startsWith('/api/sessions/') && req.url?.endsWith('/events')) {
        const match = req.url.match(/\/api\/sessions\/([^/]+)\/events/);
        if (match) {
          const sessionId = match[1];
          
          res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
          });

          const sendEvent = (event: SessionEvent) => {
            res.write(`data: ${JSON.stringify(event)}\n\n`);
          };

          handleSSE(sessionId, sendEvent);

          req.on('close', () => {
            removeSSEClient(sessionId);
          });
        }
      }
    });
  }
  
  return originalListen.call(app, port);
};

export { app };