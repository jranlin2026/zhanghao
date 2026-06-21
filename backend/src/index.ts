import app from './app';
import { env } from './config/env';

app.listen(env.PORT, () => {
  console.log(`[Server] 账号资产管理系统后端已启动`);
  console.log(`[Server] 地址: http://localhost:${env.PORT}`);
  console.log(`[Server] 环境: ${env.isDev ? 'development' : 'production'}`);
});
