import { Router } from 'express';
import UserController from '../controllers/user.controller.js';
import { asyncHandler } from '../utils/async-handler.js';

const router = Router();

router.get('/', asyncHandler(UserController.getAll));
router.get('/:id', asyncHandler(UserController.getById));
router.post('/', asyncHandler(UserController.create));
router.patch('/:id', asyncHandler(UserController.update));
router.delete('/:id', asyncHandler(UserController.remove));

export default router;
