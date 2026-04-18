module.exports = {
  apps: [
    {
      name: 'agentcrew-client',
      script: 'npm',
      args: 'start',
      cwd: '/root/.openclaw/workspace/agentcrew/client',
      env: {
        NODE_ENV: 'production',
        PORT: '3006'
      },
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    }
  ]
};
