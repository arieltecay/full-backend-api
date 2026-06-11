import { Request, Response } from 'express';
import { HomeConfig } from '../../models/home-config/index.js';
import { UpdateHomeConfigBody } from './types.js';

/**
 * Obtiene la configuración de la Home (Público)
 */
export const getHomeConfig = async (req: Request, res: Response) => {
  try {
    let config = await HomeConfig.findOne();
    
    // Si no existe, creamos una por defecto para que el front no rompa
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
    res.status(500).json({ message: 'Error al obtener la configuración' });
  }
};

/**
 * Actualiza la configuración de la Home (Solo Admin)
 */
export const updateHomeConfig = async (req: Request<{}, {}, UpdateHomeConfigBody>, res: Response) => {
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
    res.status(500).json({ message: 'Error al actualizar la configuración' });
  }
};
