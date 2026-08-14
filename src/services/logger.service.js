import { logger } from '../config/logger.js';

class LoggerService {
  static testAllLevels() {
    logger.debug('Prueba de logger: nivel debug');
    logger.http('Prueba de logger: nivel http');
    logger.info('Prueba de logger: nivel info');
    logger.warning('Prueba de logger: nivel warning');
    logger.error('Prueba de logger: nivel error');
    logger.fatal('Prueba de logger: nivel fatal');

    return ['debug', 'http', 'info', 'warning', 'error', 'fatal'];
  }
}

export default LoggerService;
