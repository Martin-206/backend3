import { Router } from 'express';
import LoggerController from '../controllers/logger.controller.js';

const router = Router();

router.get('/test', LoggerController.test);

export default router;
