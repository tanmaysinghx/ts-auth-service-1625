import express from 'express';
import authRoutes from './routes/authRoutes';
import roleRoutes from './routes/roleRoutes';
import logRoutes from './routes/logRoutes';
import healthCheckRoutes from './routes/healthCheckRoutes'
import { transactionIdMiddleware } from './middleware/transactionIdMiddleware';
import otpRoutes from './routes/otpRoutes';
import cors from 'cors';
import { loggerConsole } from './middleware/loggerConsole';

const app = express();

app.use(transactionIdMiddleware);

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json());
app.use(loggerConsole);

app.use('/v2/api/auth', authRoutes);
app.use('/v2/api/roles', roleRoutes);
app.use('/v2/api/logs', logRoutes);
app.use('/v2/api/otp', otpRoutes);
app.use('/v2/api/health', healthCheckRoutes);

export default app;
