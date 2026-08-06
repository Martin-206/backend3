import MockService from '../services/mock.service.js';

class MockController {
  static async preview(req, res) {
    const mocks = MockService.getPreview(req.query);
    return res.status(200).json({ status: 'success', payload: mocks });
  }

  static async generateData(req, res) {
    const inserted = await MockService.insertTestData(req.body);
    return res.status(201).json({
      status: 'success',
      message: 'Datos de prueba insertados correctamente.',
      payload: inserted,
    });
  }
}

export default MockController;
