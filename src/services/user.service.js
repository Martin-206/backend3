import UserRepository from '../repositories/user.repository.js';
import { USER_ROLES } from '../constants/index.js';
import { AppError } from '../utils/app-error.js';

class UserService {
  static async getAll(filters) {
    if (filters.role && !Object.values(USER_ROLES).includes(filters.role)) {
      throw new AppError('El rol indicado no es válido.', 400);
    }
    return UserRepository.getAll(filters);
  }




  static async getById(id) {
    const user = await UserRepository.getById(id);
    if (!user) throw new AppError('Usuario no encontrado.', 404);
    return user;
  }



  static async create(userData) {
    const existingUser = await UserRepository.getByEmail(userData.email);
    if (existingUser) throw new AppError('El email ya está registrado.', 409);

    const role = userData.role ?? USER_ROLES.USER;
    if (!Object.values(USER_ROLES).includes(role)) {
      throw new AppError('El rol indicado no es válido.', 400);
    }

    return UserRepository.create({ ...userData, role });
  }

  static async update(id, userData) {
    if (userData.role && !Object.values(USER_ROLES).includes(userData.role)) {
      throw new AppError('El rol indicado no es válido.', 400);
    }


    if (userData.email) {
      const userWithEmail = await UserRepository.getByEmail(userData.email);
      if (userWithEmail && userWithEmail._id.toString() !== id) {
        throw new AppError('El email ya está registrado por otro usuario.', 409);
      }
    }

    const user = await UserRepository.updateById(id, userData);
    if (!user) throw new AppError('Usuario no encontrado.', 404);
    return user;
  }

  

  static async remove(id) {
    const user = await UserRepository.softDeleteById(id);
    if (!user) throw new AppError('Usuario no encontrado.', 404);
  }
}

export default UserService;
