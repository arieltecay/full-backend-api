import { Schema, model, Document } from 'mongoose';

export interface PayrollDoc extends Document {
  clientId: string;
  period: string; // format MM-YYYY
  originalFileUrl: string;
  metadata?: Record<string, any>;
  data: Record<string, any>[]; // rows of CSV as JSON objects
  uploadedAt: Date;
}

const PayrollSchema = new Schema<PayrollDoc>({
  clientId: { type: String, required: true, index: true },
  period: { type: String, required: true, index: true },
  originalFileUrl: { type: String, required: true },
  metadata: { type: Schema.Types.Mixed },
  data: [Schema.Types.Mixed],
  uploadedAt: { type: Date, default: Date.now },
});

// Compound index for fast lookup by client and period
PayrollSchema.index({ clientId: 1, period: 1 }, { unique: true });

export const Payroll = model<PayrollDoc>('Payroll', PayrollSchema);
