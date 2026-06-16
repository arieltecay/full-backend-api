export interface UpdateClientPayload {
  isActive?: boolean;
  status?: 'active' | 'inactive' | 'suspended';
  accessExpiresAt?: string | null;
  customNote?: string;
  managerPassword?: string;
}
