import express from 'express';
import authRoutes from './routes/authRoutes';
import roleRoutes from './routes/roleRoutes';
import logRoutes from './routes/logRoutes';
import { transactionIdMiddleware } from './middleware/transactionIdMiddleware';
import otpRoutes from './routes/otpRoutes';

const app = express();

app.use(transactionIdMiddleware);
app.use(express.json());

app.use('/v2/api/auth', authRoutes);
app.use('/v2/api/roles', roleRoutes);
app.use('/v2/api/logs', logRoutes);
app.use('/v2/api/otp', otpRoutes);

export default app;
