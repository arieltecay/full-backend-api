import { Request, Response, NextFunction } from 'express';
import { HomeConfig } from '../../models/home-config/index.js';
import { UpdateHomeConfigBody } from './types.js';

export const getHomeConfig = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let config = await HomeConfig.findOne();

    if (!config) {
      config = await HomeConfig.create({
        companyName: 'Nueva Empresa',
        mission: 'Nuestra misión es ayudar a nuestros clientes...',
        tasks: ['Tarea 1', 'Tarea 2'],
        updatedBy: (req as any).user?._id || null
      });
    }

    res.json(config);
  } catch (error) {
    next(error);
  }
};

export const updateHomeConfig = async (req: Request<{}, {}, UpdateHomeConfigBody>, res: Response, next: NextFunction) => {
  try {
    const updateData = req.body;
    const userId = (req as any).user._id;

    let config = await HomeConfig.findOne();

    if (config) {
      config = await HomeConfig.findOneAndUpdate(
        {},
        { ...updateData, updatedBy: userId },
        { new: true, runValidators: true }
      );
    } else {
      config = await HomeConfig.create({ ...updateData, updatedBy: userId });
    }

    res.json(config);
  } catch (error) {
    next(error);
  }
};
