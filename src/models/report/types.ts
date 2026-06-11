import { Document, Types } from 'mongoose';

export interface IReport extends Document {
  title: string;
  client: Types.ObjectId;
  metadata: any;
  data: any[]; // Datos estructurados del Excel
  excelUrl: string;
  excelPublicId: string;
  accessToken: string;
  expiresAt: Date;
  isActive: boolean;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
