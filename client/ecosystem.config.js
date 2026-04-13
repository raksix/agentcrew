module.exports = {
  apps: [{
    name: 'sooliva-hero-client',
    cwd: '/root/.openclaw/workspace/sooliva-hero/client',
    script: 'npm',
    args: 'run start',
    instances: 1,
    autorestart: true,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3099
    }
  }],
  deploy: {
    production: {
      'pre-deploy-local': 'cd /root/.openclaw/workspace/sooliva-hero/client && npm run build'
    }
  }
};