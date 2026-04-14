module.exports = {
  apps: [
    {
      name: 'agentcrew-backend',
      script: 'npx',
      args: 'tsx src/index.ts',
      cwd: '/root/.openclaw/workspace/agentcrew/server',
      env: {
        NODE_ENV: 'production',
        PORT: '4005'
      },
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      error_file: '/root/.openclaw/workspace/agentcrew/logs/backend-error.log',
      out_file: '/root/.openclaw/workspace/agentcrew/logs/backend-out.log',
      time: true
    },
    {
      name: 'agentcrew-client',
      script: 'npm',
      args: 'start',
      cwd: '/root/.openclaw/workspace/agentcrew/client',
      env: {
        NODE_ENV: 'production',
        PORT: '3005'
      },
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      error_file: '/root/.openclaw/workspace/agentcrew/logs/client-error.log',
      out_file: '/root/.openclaw/workspace/agentcrew/logs/client-out.log',
      time: true
    }
  ]
};
