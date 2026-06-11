import { Schema, model } from 'mongoose';
import { IReport } from './types.js';
import crypto from 'crypto';

const reportSchema = new Schema<IReport>(
  {
    title: { type: String, required: true, trim: true },
    client: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
    data: [Schema.Types.Mixed],
    excelUrl: { type: String, required: true },
    excelPublicId: { type: String, required: true },
    accessToken: { 
      type: String, 
      unique: true, 
      default: () => crypto.randomBytes(16).toString('hex') 
    },
    expiresAt: { 
      type: Date, 
      required: true,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días por defecto
    },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Report = model<IReport>('Report', reportSchema);
