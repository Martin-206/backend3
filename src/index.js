import express from 'express';
import { config } from './config/index.js';
import { connectDB } from './config/db.js';
import { logger } from './config/logger.js';
import productsRoutes from './routes/products.routes.js';
import usersRoutes from './routes/users.routes.js';
import mocksRoutes from './routes/mocks.routes.js';
import loggerRoutes from './routes/logger.routes.js';
import { requestLogger } from './middlewares/request-logger.middleware.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpecs from './config/swagger.js';

const app = express();

app.use(express.json());
app.use(requestLogger);

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'ShipNow API funcionando',
    environment: config.NODE_ENV,
  });
});

app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpecs)
);

app.use('/api/products', productsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/mocks', mocksRoutes);
app.use('/api/logger', loggerRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

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
