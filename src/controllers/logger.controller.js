import LoggerService from '../services/logger.service.js';

class LoggerController {
  static test(req, res) {
    const levels = LoggerService.testAllLevels();

    return res.status(200).json({
      status: 'success',
      message: 'Prueba de logger ejecutada correctamente.',
      payload: { levels },
    });
  }
}

export default LoggerController;
