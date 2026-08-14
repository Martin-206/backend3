import express from 'express';
import { config } from './config/index.js';
import { connectDB } from './config/db.js';
import productsRoutes from './routes/products.routes.js';
import usersRoutes from './routes/users.routes.js';
import mocksRoutes from './routes/mocks.routes.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';


const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'ShipNow API funcionando',
    environment: config.NODE_ENV,
  });
});

app.use('/api/products', productsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/mocks', mocksRoutes);

app.use(notFoundHandler);

app.use(errorHandler);

async function startServer() {
  try {
    await connectDB();
    app.listen(config.PORT, () => {
      console.log(`Servidor ejecutándose en el puerto ${config.PORT}`);
    });
  } catch (error) {
    console.error(`No se pudo iniciar ShipNow: ${error.message}`);
    process.exit(1);
  }
}

startServer();
