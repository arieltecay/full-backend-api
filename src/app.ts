import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth/index.js';
import homeRoutes from './routes/home-config/index.js';
import reportRoutes from './routes/report/index.js';
import payrollRouter from './routes/payroll/index.js';
import dashboardRouter from './routes/dashboard/index.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/home', homeRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/payroll', payrollRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/dashboards', dashboardRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;
