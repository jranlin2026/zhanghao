import app from './app';
import { prisma } from './config/db';
import { env } from './config/env';

const server = app.listen(env.PORT, () => {
  console.log(`[Server] 账号资产管理系统后端已启动`);
  console.log(`[Server] 地址: http://localhost:${env.PORT}`);
  console.log(`[Server] 环境: ${env.isDev ? 'development' : 'production'}`);
});

async function shutdown(signal: string) {
  console.log(`[Server] 收到 ${signal}，正在关闭服务`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
