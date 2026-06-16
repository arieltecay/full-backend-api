export interface UpdateClientBody {
  isActive?: boolean;
  status?: 'active' | 'inactive' | 'suspended';
  accessExpiresAt?: string | null;
  customNote?: string;
  managerPassword?: string;
}
