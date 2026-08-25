import { Router } from 'express';
import DeliveryController from '../controllers/delivery.controller.js';
import { asyncHandler } from '../utils/async-handler.js';

const router = Router();

router.get('/', asyncHandler(DeliveryController.getAll));
router.get('/:id', asyncHandler(DeliveryController.getById));
router.post('/', asyncHandler(DeliveryController.create));
router.patch('/:id', asyncHandler(DeliveryController.update));
router.delete('/:id', asyncHandler(DeliveryController.remove));

export default router;
