import UserRepository from '../repositories/user.repository.js';
import { USER_ROLES } from '../constants/index.js';
import { CustomError } from '../errors/custom-error.js';
import { ERROR_CODES } from '../errors/error-codes.js';

class UserService {
  static validateRequiredFields(userData = {}, partial = false) {
    const requiredFields = ['first_name', 'last_name', 'email', 'password'];
    const missingFields = requiredFields.filter(
      (field) => !partial && !String(userData[field] ?? '').trim(),
    );

    if (missingFields.length > 0) {
      throw CustomError.create(ERROR_CODES.INVALID_INPUT, {
        missingFields,
      });
    }
  }

  static async getAll(filters) {
    if (filters.role && !Object.values(USER_ROLES).includes(filters.role)) {
      throw CustomError.create(ERROR_CODES.INVALID_ROLE, {
        allowedValues: Object.values(USER_ROLES),
      });
    }
    return UserRepository.getAll(filters);
  }

  static async getById(id) {
    const user = await UserRepository.getById(id);
    if (!user) throw CustomError.create(ERROR_CODES.USER_NOT_FOUND);
    return user;
  }

  static async create(userData) {
    this.validateRequiredFields(userData);

    const existingUser = await UserRepository.getByEmail(userData.email);
    if (existingUser) throw CustomError.create(ERROR_CODES.EMAIL_ALREADY_EXISTS);

    const role = userData.role ?? USER_ROLES.USER;
    if (!Object.values(USER_ROLES).includes(role)) {
      throw CustomError.create(ERROR_CODES.INVALID_ROLE, {
        allowedValues: Object.values(USER_ROLES),
      });
    }

    return UserRepository.create({ ...userData, role });
  }

  static async update(id, userData) {
    if (!userData || Object.keys(userData).length === 0) {
      throw CustomError.create(ERROR_CODES.INVALID_INPUT, {
        reason: 'Debe enviar al menos un campo para actualizar.',
      });
    }

    if (userData.role && !Object.values(USER_ROLES).includes(userData.role)) {
      throw CustomError.create(ERROR_CODES.INVALID_ROLE, {
        allowedValues: Object.values(USER_ROLES),
      });
    }

    if (userData.email) {
      const userWithEmail = await UserRepository.getByEmail(userData.email);
      if (userWithEmail && userWithEmail._id.toString() !== id) {
        throw CustomError.create(ERROR_CODES.EMAIL_ALREADY_EXISTS);
      }
    }

    const user = await UserRepository.updateById(id, userData);
    if (!user) throw CustomError.create(ERROR_CODES.USER_NOT_FOUND);
    return user;
  }

  static async remove(id) {
    const user = await UserRepository.softDeleteById(id);
    if (!user) throw CustomError.create(ERROR_CODES.USER_NOT_FOUND);
  }
}

export default UserService;
