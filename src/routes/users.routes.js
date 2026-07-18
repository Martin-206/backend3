import { Router } from 'express';
import UserController from '../controllers/user.controller.js';

const router = Router();

router.get('/', UserController.getAll);
router.get('/:id', UserController.getById);
router.post('/', UserController.create);
router.patch('/:id', UserController.update);
router.delete('/:id', UserController.remove);

export default router;
