import { Request, Response, NextFunction } from 'express';
import { User } from '../../models/user/index.js';
import { generateToken } from '../../config/jwt/index.js';
import { LoginBody, RegisterBody } from './types.js';
import { AppError } from '../../utils/app-error.js';

export const login = async (req: Request<{}, {}, LoginBody>, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password!))) {
      throw new AppError(401, 'Credenciales inválidas');
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id.toString(), user.role),
    });
  } catch (error) {
    next(error);
  }
};

export const register = async (req: Request<{}, {}, RegisterBody>, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      throw new AppError(400, 'El usuario ya existe');
    }

    const user = await User.create({ name, email, password, role });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id.toString(), user.role),
    });
  } catch (error) {
    next(error);
  }
};

export const getClients = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clients = await User.find({ role: 'client' }).select('-password').sort('-createdAt');
    res.json(clients);
  } catch (error) {
    next(error);
  }
};

export const updateClient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { isActive, status, accessExpiresAt, customNote } = req.body;

    const user = await User.findById(id);
    if (!user || user.role !== 'client') {
      throw new AppError(404, 'Cliente no encontrado');
    }

    if (isActive !== undefined) user.isActive = isActive;
    if (status) user.status = status;
    if (accessExpiresAt !== undefined) user.accessExpiresAt = accessExpiresAt;
    if (customNote !== undefined) user.customNote = customNote;

    await user.save();

    res.json({
      message: 'Cliente actualizado correctamente',
      user: {
        _id: user._id,
        isActive: user.isActive,
        status: user.status,
        accessExpiresAt: user.accessExpiresAt,
        customNote: user.customNote
      }
    });
  } catch (error) {
    next(error);
  }
};
