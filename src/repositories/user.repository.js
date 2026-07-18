import UserModel from '../models/user.model.js';

const USER_PUBLIC_FIELDS =
  'first_name last_name email role active createdAt updatedAt';

class UserRepository {
  static buildFilters(filters = {}) {
    const query = { active: true };

    if (filters.role) query.role = filters.role;
    if (filters.search) {
      query.$or = [
        { first_name: { $regex: filters.search, $options: 'i' } },
        { last_name: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } },
      ];
    }

    return query;
  }

  static async getAll(filters = {}) {
    return UserModel.find(this.buildFilters(filters))
      .select(USER_PUBLIC_FIELDS)
      .sort({ createdAt: -1 })
      .lean();
  }

  static async getById(id) {
    return UserModel.findOne({ _id: id, active: true })
      .select(USER_PUBLIC_FIELDS)
      .lean();
  }

  static async getByEmail(email) {
    return UserModel.findOne({ email: email.toLowerCase(), active: true })
      .select(USER_PUBLIC_FIELDS)
      .lean();
  }



  static async create(userData) {
    const user = await UserModel.create(userData);
    return UserModel.findById(user._id).select(USER_PUBLIC_FIELDS).lean();
  }

  static async updateById(id, userData) {
    return UserModel.findOneAndUpdate(
      { _id: id, active: true },
      userData,
      { new: true, runValidators: true },
    )
      .select(USER_PUBLIC_FIELDS)
      .lean();
  }

  

  static async softDeleteById(id) {
    return UserModel.findOneAndUpdate(
      { _id: id, active: true },
      { active: false },
      { new: true },
    )
      .select('_id active')
      .lean();
  }
}

export default UserRepository;
