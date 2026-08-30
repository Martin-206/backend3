import express from 'express';
import swaggerUi from 'swagger-ui-express';

import { config } from './config/index.js';
import swaggerSpecs from './config/swagger.js';
import productsRoutes from './routes/products.routes.js';
import usersRoutes from './routes/users.routes.js';
import mocksRoutes from './routes/mocks.routes.js';
import loggerRoutes from './routes/logger.routes.js';
import ordersRoutes from './routes/orders.routes.js';
import deliveriesRoutes from './routes/deliveries.routes.js';
import { requestLogger } from './middlewares/request-logger.middleware.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';

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

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

app.use('/api/products', productsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/mocks', mocksRoutes);
app.use('/api/logger', loggerRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/deliveries', deliveriesRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
