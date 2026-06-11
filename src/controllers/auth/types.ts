import { Request, Response } from 'express';

export interface LoginBody {
  email?: string;
  password?: string;
}

export interface RegisterBody {
  name?: string;
  email?: string;
  password?: string;
  role?: 'admin' | 'client';
}
