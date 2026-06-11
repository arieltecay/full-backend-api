import { Document, Schema } from 'mongoose';

export interface IDashboardTheme {
  primaryColor?: string;
  secondaryColor?: string;
}

export interface IDashboard extends Document {
  title: string;
  clientId: Schema.Types.ObjectId | string;
  period: string;
  isActive: boolean;
  theme?: IDashboardTheme;
  createdAt: Date;
  updatedAt: Date;
}
