// PM2 配置：不开 Docker 的路线（旧笔记本 / VPS 直接跑 Node）
// 用法：pm2 start deploy/ecosystem.config.js && pm2 save && pm2 startup
module.exports = {
  apps: [
    {
      name: 'cyberlog',
      cwd: '/opt/myblog/app',
      script: 'npm',
      args: 'start',
      instances: 1,           // 文件系统当数据库 → 只能单实例
      exec_mode: 'fork',      // 不要用 cluster
      max_memory_restart: '600M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      out_file: '/var/log/cyberlog/out.log',
      error_file: '/var/log/cyberlog/err.log',
      time: true,
    },
  ],
}
