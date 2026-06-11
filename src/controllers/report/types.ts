import { Request } from 'express';

export interface CreateReportBody {
  title: string;
  clientId: string;
  expiresAt?: string;
}

export interface ReportParams {
  id: string;
}

export interface TokenParams {
  token: string;
}
