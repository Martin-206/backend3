import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    license_number: { type: String, required: true, unique: true, trim: true },
    vehicle: {
      type: { type: String, required: true, trim: true },
      plate: { type: String, required: true, unique: true, uppercase: true, trim: true },
    },
    available: { type: Boolean, default: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false },
);

const DriverModel = mongoose.model('Driver', driverSchema);
export default DriverModel;
