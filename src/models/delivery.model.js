import mongoose from 'mongoose';
import { DELIVERY_STATUS } from '../constants/index.js';

const deliverySchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      unique: true,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(DELIVERY_STATUS),
      default: DELIVERY_STATUS.PENDING,
    },
    estimated_at: { type: Date, required: true },
    delivered_at: { type: Date, default: null },
    notes: { type: String, default: '', trim: true },
  },
  { timestamps: true, versionKey: false },
);

const DeliveryModel = mongoose.model('Delivery', deliverySchema);
export default DeliveryModel;
