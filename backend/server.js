import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler.js';

// Import Routes
import programRoutes from './routes/programRoutes.js';
import trainerRoutes from './routes/trainerRoutes.js';
import planRoutes from './routes/planRoutes.js';
import timetableRoutes from './routes/timetableRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import memberRoutes from './routes/memberRoutes.js';
import customerRoutes from './routes/admin/customerRoutes.js';

dotenv.config();

const app = express();

// Middleware
const envOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean)
  : [];

const allowedOrigins = new Set([
  process.env.FRONTEND_URL || 'http://localhost:5173',
  process.env.ADMIN_URL || 'http://localhost:5174',
  ...envOrigins,
]);

app.use(cors({
  origin(origin, callback) {
    // Allow requests with no origin (like curl, Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.has(origin) || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
import connectDB from './config/db.js';
connectDB();

// Routes
app.use('/api/programs', programRoutes);
app.use('/api/trainers', trainerRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/membership', memberRoutes);
app.use('/api/admin/customers', customerRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 9000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

