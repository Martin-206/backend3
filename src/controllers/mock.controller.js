import MockService from '../services/mock.service.js';

class MockController {
  static async preview(req, res, next) {
    try {
      const mocks = MockService.getPreview(req.query);
      res.status(200).json({ status: 'success', payload: mocks });
    } catch (error) {
      next(error);
    }
  }

  static async generateData(req, res, next) {
    try {
      const inserted = await MockService.insertTestData(req.body);
      res.status(201).json({
        status: 'success',
        message: 'Datos de prueba insertados correctamente.',
        payload: inserted,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default MockController;
