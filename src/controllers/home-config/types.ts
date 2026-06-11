import { Request, Response } from 'express';

export interface UpdateHomeConfigBody {
  companyName?: string;
  mission?: string;
  tasks?: string[];
  heroImageUrl?: string;
}
