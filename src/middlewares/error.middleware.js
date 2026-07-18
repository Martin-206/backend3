export function errorHandler(error, req, res, next) {
  if (error.name === 'CastError') {
    return res.status(400).json({ status: 'error', message: 'El identificador no es válido.' });
  }

  if (error.name === 'ValidationError') {
    return res.status(400).json({ status: 'error', message: error.message });
  }

  if (error.code === 11000) {
    return res.status(409).json({ status: 'error', message: 'El registro ya existe.' });
  }

  const statusCode = error.statusCode ?? 500;
  const message = statusCode === 500 ? 'Error interno del servidor.' : error.message;
  console.error(error);
  return res.status(statusCode).json({ status: 'error', message });
}
