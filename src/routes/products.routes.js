import { Router } from 'express';
import ProductController from '../controllers/product.controller.js';
import { asyncHandler } from '../utils/async-handler.js';

const router = Router();

router.get('/', asyncHandler(ProductController.getAll));
router.get('/:id', asyncHandler(ProductController.getById));
router.post('/', asyncHandler(ProductController.create));
router.patch('/:id', asyncHandler(ProductController.update));
router.delete('/:id', asyncHandler(ProductController.remove));

export default router;
