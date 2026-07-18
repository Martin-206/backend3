import UserService from '../services/user.service.js';

class UserController {
  static async getAll(req, res, next) {
    try {
      const users = await UserService.getAll(req.query);
      res.status(200).json({ status: 'success', payload: users });
    } catch (error) { next(error); }
  }

  static async getById(req, res, next) {
    try {
      const user = await UserService.getById(req.params.id);
      res.status(200).json({ status: 'success', payload: user });
    } catch (error) { next(error); }
  }

  static async create(req, res, next) {
    try {
      const user = await UserService.create(req.body);
      res.status(201).json({ status: 'success', payload: user });
    } catch (error) { next(error); }
  }

  static async update(req, res, next) {
    try {
      const user = await UserService.update(req.params.id, req.body);
      res.status(200).json({ status: 'success', payload: user });
    } catch (error) { next(error); }
  }

  static async remove(req, res, next) {
    try {
      await UserService.remove(req.params.id);
      res.status(204).send();
    } catch (error) { next(error); }
  }
}

export default UserController;
