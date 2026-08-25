import { Router } from 'express';
import OrderController from '../controllers/order.controller.js';
import { asyncHandler } from '../utils/async-handler.js';

const router = Router();

router.get('/', asyncHandler(OrderController.getAll));
router.get('/:id', asyncHandler(OrderController.getById));
router.post('/', asyncHandler(OrderController.create));
router.patch('/:id', asyncHandler(OrderController.update));
router.delete('/:id', asyncHandler(OrderController.remove));

export default router;
