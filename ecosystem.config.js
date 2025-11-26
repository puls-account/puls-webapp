module.exports = {
  apps: [{
    name: 'puls-survey',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/puls-survey.com',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}