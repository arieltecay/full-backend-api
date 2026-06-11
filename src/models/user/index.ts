import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser } from './types.js';

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['admin', 'client'], default: 'client' },
    isActive: { type: Boolean, default: true },
    status: { 
      type: String, 
      enum: ['active', 'inactive', 'suspended'], 
      default: 'active' 
    },
    accessExpiresAt: { type: Date, default: null },
    customNote: { type: String, default: '' },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password!, salt);
});

userSchema.methods.comparePassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

export const User = model<IUser>('User', userSchema);
