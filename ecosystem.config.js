// PM2 Ecosystem File for Production Deployment
// Usage: pm2 start ecosystem.config.js

module.exports = {
  apps: [
    {
      name: 'estatebank',
      script: 'npm',
      args: 'start',
      cwd: '/home/cloudpanel/htdocs/estatebank.in', // Update with your actual domain path
      instances: 1, // Use 'max' for cluster mode
      exec_mode: 'fork', // Use 'cluster' for multiple instances
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
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

