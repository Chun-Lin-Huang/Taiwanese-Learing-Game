module.exports = {
  apps: [
    {
      name: 'backend',
      cwd: '/home/b310ai/Taiwanese-Learing-Game/BackEnd',
      script: 'npm',
      args: 'run dev',
      env: {
        NODE_ENV: 'production',
        PORT: 2083
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    },
    {
      name: 'frontend',
      cwd: '/home/b310ai/Taiwanese-Learing-Game/FrontEnd',
      script: 'npm',
      args: 'run dev -- --host 0.0.0.0',
      env: {
        NODE_ENV: 'production'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    },
    {
      name: 'voice-service',
      cwd: '/home/b310ai/Taiwanese-Learing-Game',
      script: 'app_local.py',
      interpreter: '/home/b310ai/Taiwanese-Learing-Game/venv/bin/python',
      env: {
        NODE_ENV: 'production'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    }
  ]
};

