import { User } from '../../models/user/index.js';
import { AppError } from '../../utils/app-error.js';
import { UpdateClientPayload } from './types.js';

export class ClientsService {
  static async findAllClients() {
    return User.find({ role: 'client' }).select('-password').sort('-createdAt');
  }

  static async updateClientById(id: string, payload: UpdateClientPayload) {
    const user = await User.findById(id);

    if (!user || user.role !== 'client') {
      throw new AppError(404, 'Cliente no encontrado');
    }

    if (payload.isActive !== undefined) user.isActive = payload.isActive;
    if (payload.status) user.status = payload.status;
    if (payload.accessExpiresAt !== undefined) {
      user.accessExpiresAt = payload.accessExpiresAt ? new Date(payload.accessExpiresAt) : null;
    }
    if (payload.customNote !== undefined) user.customNote = payload.customNote;
    if (payload.managerPassword !== undefined) user.managerPassword = payload.managerPassword;

    await user.save();
    return user;
  }
}
