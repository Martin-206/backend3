import UserService from '../services/user.service.js';
import UploadService from '../services/upload.service.js';

class UserController {
  static async getAll(req, res) {
    const users = await UserService.getAll(req.query);
    return res.status(200).json({ status: 'success', payload: users });
  }

  static async getById(req, res) {
    const user = await UserService.getById(req.params.id);
    return res.status(200).json({ status: 'success', payload: user });
  }

  static async create(req, res) {
    const user = await UserService.create(req.body);
    return res.status(201).json({ status: 'success', payload: user });
  }

  static async update(req, res) {
    const user = await UserService.update(req.params.id, req.body);
    return res.status(200).json({ status: 'success', payload: user });
  }

  static async addDocument(req, res) {
    const user = await UploadService.addUserDocument(req.params.id, req.file, req.body.document_type);
    return res.status(201).json({ status: 'success', message: 'Documento cargado correctamente.', payload: user });
  }

  static async remove(req, res) {
    await UserService.remove(req.params.id);
    return res.status(204).send();
  }
}

export default UserController;
