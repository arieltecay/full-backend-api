import multer from 'multer';
import path from 'path';

// Configuración de almacenamiento temporal local
const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// Filtros de archivos (opcional, se puede personalizar por ruta)
const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf', '.xlsx', '.xls', '.csv'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Formato de archivo no permitido'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // Límite de 50MB
  },
});
