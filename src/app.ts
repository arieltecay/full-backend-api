import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth/index.js';
import clientRoutes from './routes/clients/index.js';
import homeRoutes from './routes/home-config/index.js';
import reportRoutes from './routes/report/index.js';
import payrollRouter from './routes/payroll/index.js';
import dashboardRouter from './routes/dashboard/index.js';
import { errorHandler } from './middleware/error-handler.js';

dotenv.config();

const app = express();

// Configuración de CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:5173', 'http://localhost:5174']; // Puertos por defecto para frontend y admin

app.use(cors({
  origin: function (origin, callback) {
    // !origin permite herramientas como Postman o curl que no envían header de origen
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/home', homeRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/payroll', payrollRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/dashboards', dashboardRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global error handler — debe ser el ÚLTIMO middleware
app.use(errorHandler);

export default app;
