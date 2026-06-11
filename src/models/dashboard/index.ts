import { Schema, model } from 'mongoose';
import { IDashboard } from './types.js';

const dashboardSchema = new Schema<IDashboard>(
  {
    title: { type: String, required: true, trim: true },
    clientId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    period: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
    theme: {
      primaryColor: { type: String, default: '#6366f1' },
      secondaryColor: { type: String, default: '#4f46e5' },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Compuesto único para evitar duplicar tableros del mismo periodo para un cliente
dashboardSchema.index({ clientId: 1, period: 1 }, { unique: true });

export const Dashboard = model<IDashboard>('Dashboard', dashboardSchema);
