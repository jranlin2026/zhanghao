import app from './app';
import { env } from './config/env';

/**
 * 服务器入口
 * 启动 Express 服务，监听配置的端口
 */
const startServer = async (): Promise<void> => {
  try {
    app.listen(env.PORT, () => {
      console.log(`[Server] 账号资产管理系统后端服务已启动`);
      console.log(`[Server] 地址: http://localhost:${env.PORT}`);
      console.log(`[Server] 环境: ${env.isDev ? 'development' : 'production'}`);
    });
  } catch (error) {
    console.error('[Server] 启动失败:', error);
    process.exit(1);
  }
};

startServer();
