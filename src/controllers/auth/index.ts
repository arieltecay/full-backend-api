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
    const { name, email, password, role, managerPassword } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      throw new AppError(400, 'El usuario ya existe');
    }

    const user = await User.create({ name, email, password, role, managerPassword: managerPassword || password });

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
