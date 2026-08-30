import app from './app.js';
import { config } from './config/index.js';
import { connectDB } from './config/db.js';
import { logger } from './config/logger.js';

async function startServer() {
  try {
    await connectDB();
    app.listen(config.PORT, () => {
      logger.info(`Servidor ShipNow escuchando en el puerto ${config.PORT}`);
    });
  } catch (error) {
    logger.fatal('No se pudo iniciar ShipNow', { error: error.message });
    process.exit(1);
  }
}

startServer();
