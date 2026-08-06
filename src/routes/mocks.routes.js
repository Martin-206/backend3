import { Router } from 'express';
import MockController from '../controllers/mock.controller.js';
import { asyncHandler } from '../utils/async-handler.js';

const router = Router();

router.get('/', asyncHandler(MockController.preview));
router.post('/generate-data', asyncHandler(MockController.generateData));

export default router;
