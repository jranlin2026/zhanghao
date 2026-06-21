import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import routes from './routes';

/**
 * Express 应用配置
 * 注册全局中间件：CORS、JSON body parser、Helmet、rate limit
 */
const app = express();

// ── 安全头 ──
app.use(helmet({ contentSecurityPolicy: false }));

// ── CORS ──
app.use(
  cors({
    origin: (origin, callback) => {
      const isLocalDevOrigin = origin ? /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin) : true;
      if (origin === env.FRONTEND_URL || (env.isDev && isLocalDevOrigin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

// ── Body 解析 ──
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── 限流 ──
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 500, // 最多500次请求
  message: { code: 429, message: '请求过于频繁，请稍后重试' },
});
app.use('/api', limiter);

// ── 健康检查 ──
app.get('/api/health', (_req, res) => {
  res.json({ code: 200, data: { status: 'ok', timestamp: new Date().toISOString() }, message: 'success' });
});

// ── 路由 ──
app.use('/api', routes);

// ── 全局错误处理（需在路由之后注册） ──
app.use(errorHandler);

export default app;
