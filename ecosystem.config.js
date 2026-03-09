// PM2 Ecosystem File for Production Deployment
// Usage: pm2 start ecosystem.config.js

module.exports = {
  apps: [
    {
      name: 'estatebank',
      script: 'npm',
      args: 'start',
      cwd: '/home/estatebanknew/htdocs/estatebank.in',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      watch: false, // Set to true for development
      max_memory_restart: '1G',
    },
  ],
};

