import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { isAllowedCorsOrigin } from './config/cors';
import { prisma } from './config/db';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import routes from './routes';

const app = express();

app.set('trust proxy', 1);

app.use(helmet({ contentSecurityPolicy: false }));

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedCorsOrigin(origin, env.FRONTEND_URL, env.isDev)) {
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

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    message: { code: 429, data: null, message: '请求过于频繁，请稍后再试' },
  }),
);

app.get('/api/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ code: 200, data: { status: 'ok', database: 'connected', uptime_seconds: Math.round(process.uptime()), timestamp: new Date().toISOString() }, message: 'success' });
  } catch {
    res.status(503).json({ code: 503, data: { status: 'degraded', database: 'disconnected', uptime_seconds: Math.round(process.uptime()), timestamp: new Date().toISOString() }, message: 'database unavailable' });
  }
});

app.use('/api', routes);
app.use('/api', (_req, res) => {
  res.status(404).json({ code: 404, data: null, message: '接口不存在' });
});
app.use(errorHandler);

export default app;
