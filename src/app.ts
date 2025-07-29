import express from 'express';
import authRoutes from './routes/authRoutes';
import roleRoutes from './routes/roleRoutes';
import healthCheckRoutes from './routes/healthCheckRoutes'
import { transactionIdMiddleware } from './middleware/transactionIdMiddleware';
import cors from 'cors';
import { loggerConsole } from './middleware/loggerConsole';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(transactionIdMiddleware);
app.use(express.json());
app.use(loggerConsole);
app.use(cookieParser());

const version = process.env.API_VERSION || 'v2';

app.use(`/${version}/api/auth`, authRoutes);
app.use(`/${version}/api/roles`, roleRoutes);
app.use(`/${version}/api/health`, healthCheckRoutes);

export default app;
