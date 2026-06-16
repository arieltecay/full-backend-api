import { Request, Response, NextFunction } from 'express';
import { ClientsService } from '../../services/clients/index.js';
import { UpdateClientBody } from './types.js';

export const getClients = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const clients = await ClientsService.findAllClients();
    res.json(clients);
  } catch (error) {
    next(error);
  }
};

export const updateClient = async (
  req: Request<{ id: string }, {}, UpdateClientBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { isActive, status, accessExpiresAt, customNote, managerPassword } = req.body;

    const user = await ClientsService.updateClientById(id, {
      isActive,
      status,
      accessExpiresAt,
      customNote,
      managerPassword,
    });

    res.json({
      message: 'Cliente actualizado correctamente',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
        status: user.status,
        accessExpiresAt: user.accessExpiresAt,
        customNote: user.customNote,
        managerPassword: user.managerPassword,
      },
    });
  } catch (error) {
    next(error);
  }
};
