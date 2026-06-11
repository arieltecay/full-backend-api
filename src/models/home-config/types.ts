import { Document, Schema } from 'mongoose';

export interface IHomeConfig extends Document {
  companyName: string;
  mission: string;
  tasks: string[];
  heroImageUrl?: string;
  updatedBy: Schema.Types.ObjectId;
  updatedAt: Date;
}
