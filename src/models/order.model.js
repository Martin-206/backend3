import mongoose from 'mongoose';
import { ORDER_PRIORITY, ORDER_STATUS } from '../constants/index.js';

const orderSchema = new mongoose.Schema(
  {
    tracking_code: { type: String, required: true, unique: true, trim: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    description: { type: String, required: true, trim: true },
    delivery_address: { type: String, required: true, trim: true },
    weight_kg: { type: Number, required: true, min: 0.1 },
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING,
    },
    priority: {
      type: String,
      enum: Object.values(ORDER_PRIORITY),
      default: ORDER_PRIORITY.NORMAL,
    },
    active: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false },
);

const OrderModel = mongoose.model('Order', orderSchema);
export default OrderModel;
