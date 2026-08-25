import DriverModel from '../models/driver.model.js';

class DriverRepository {
  static async getById(id) {
    return DriverModel.findOne({ _id: id, active: true })
      .select('_id user available active')
      .lean();
  }
}

export default DriverRepository;
