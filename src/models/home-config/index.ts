import { Schema, model } from 'mongoose';
import { IHomeConfig } from './types.js';

const homeConfigSchema = new Schema<IHomeConfig>(
  {
    companyName: { type: String, required: true, default: 'Mi Empresa' },
    mission: { type: String, required: true, default: 'Nuestra misión es...' },
    tasks: [{ type: String }],
    heroImageUrl: { type: String },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const HomeConfig = model<IHomeConfig>('HomeConfig', homeConfigSchema);
