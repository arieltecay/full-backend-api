import { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'client';
  isActive: boolean;
  status: 'active' | 'inactive' | 'suspended';
  accessExpiresAt?: Date | null;
  customNote?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
}
