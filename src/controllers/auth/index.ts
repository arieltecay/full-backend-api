import { Request, Response } from 'express';
import { User } from '../../models/user/index.js';
import { generateToken } from '../../config/jwt/index.js';
import { LoginBody, RegisterBody } from './types.js';

export const login = async (req: Request<{}, {}, LoginBody>, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password!))) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id.toString(), user.role),
    });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

export const register = async (req: Request<{}, {}, RegisterBody>, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'El usuario ya existe' });
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
    res.status(500).json({ message: 'Error al crear usuario' });
  }
};

/**
 * Obtiene todos los usuarios con rol de cliente
 */
export const getClients = async (req: Request, res: Response) => {
  try {
    const clients = await User.find({ role: 'client' }).select('-password').sort('-createdAt');
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener clientes' });
  }
};

/**
 * Actualiza la información de un cliente (Solo Admin)
 */
export const updateClient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isActive, status, accessExpiresAt, customNote } = req.body;

    const user = await User.findById(id);

    if (!user || user.role !== 'client') {
      return res.status(404).json({ message: 'Cliente no encontrado' });
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
    res.status(500).json({ message: 'Error al actualizar el cliente' });
  }
};
