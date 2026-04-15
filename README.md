# AgentCrew 🤖

Multi-agent chat UI with Claude Code orchestration.

## Features

- **Multi-Session Management** - Create, switch between, and manage multiple agent sessions
- **Claude Code Integration** - Run Claude Code agents with real-time streaming output
- **Subagent System** - Spawn multiple subagents within a session for parallel work
- **Project Tagging** - Tag sessions with project names (e.g., "sooliva", "finder")
- **Real-time Streaming** - Live output from Claude Code as it's generated
- **Dark Mode** - Full dark mode support

## Architecture

```
agentcrew/
├── client/          # Next.js + HeroUI frontend
│   └── src/
│       ├── app/                 # Next.js app router
│       ├── components/
│       │   ├── Sidebar/         # Session list sidebar
│       │   ├── Chat/            # Chat area components
│       │   └── Subagent/        # Subagent panel
│       └── lib/
│           ├── api.ts           # API client
│           └── types.ts         # TypeScript types
│
└── server/          # Node.js + Elysia backend
    └── src/
        ├── routes/             # API endpoints
        ├── services/           # Business logic
        │   ├── sessionManager.ts  # Session CRUD
        │   └── claudeRunner.ts   # Claude Code process management
        └── types/              # Shared types
```

## Getting Started

### Prerequisites

- Node.js 20+
- Claude Code CLI (`npm install -g @anthropic-ai/claude-code`)

### Installation

```bash
# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### Running

```bash
# Terminal 1 - Start server
cd server && npm run dev

# Terminal 2 - Start client
cd client && npm run dev
```

- Client: http://localhost:3005
- Server API: http://localhost:4005

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sessions` | List all sessions |
| POST | `/api/sessions` | Create new session |
| GET | `/api/sessions/:id` | Get session details |
| PATCH | `/api/sessions/:id` | Update session |
| DELETE | `/api/sessions/:id` | Delete session |
| POST | `/api/sessions/:id/message` | Send message (runs Claude Code) |
| POST | `/api/sessions/:id/stop` | Stop running Claude Code |
| GET | `/api/sessions/:id/events` | SSE stream for real-time updates |

## License

MIT