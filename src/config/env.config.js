import dotenv from 'dotenv';

dotenv.config();

const REQUIRED_ENV_VARS = ['PORT', 'MONGODB_URI', 'NODE_ENV'];

const missingVariables = REQUIRED_ENV_VARS.filter(
  (variableName) => !process.env[variableName]?.trim(),
);

if (missingVariables.length > 0) {
  throw new Error(
    `Faltan variables de entorno obligatorias: ${missingVariables.join(', ')}. Revisá el archivo .env.`,
  );
}

const port = Number(process.env.PORT);
if (!Number.isInteger(port) || port <= 0) {
  throw new Error('La variable de entorno PORT debe ser un número entero mayor que 0.');
}

const validEnvironments = ['development', 'test', 'production'];
if (!validEnvironments.includes(process.env.NODE_ENV)) {
  throw new Error(
    `NODE_ENV debe ser uno de estos valores: ${validEnvironments.join(', ')}.`,
  );
}

export const config = Object.freeze({
  PORT: port,
  MONGODB_URI: process.env.MONGODB_URI,
  NODE_ENV: process.env.NODE_ENV,
});
