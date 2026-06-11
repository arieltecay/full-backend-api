import app from './app.js';
import { connectDB } from './config/database.js';

const PORT = process.env.PORT || 4000;

// Conectar a la base de datos
connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Maestro del Back corriendo en http://localhost:${PORT}`);
  });

  // Aumentar el timeout a 10 minutos para procesar archivos grandes
  server.timeout = 600000; 
});
