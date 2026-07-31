import { Router } from 'express';
import MockController from '../controllers/mock.controller.js';

const router = Router();

router.get('/', MockController.preview);
router.post('/generate-data', MockController.generateData);

export default router;
