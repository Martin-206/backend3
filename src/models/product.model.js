import mongoose from 'mongoose';
import { PRODUCT_STATUS } from '../constants/index.js';

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    code: { type: String, required: true, unique: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    category: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: Object.values(PRODUCT_STATUS),
      default: PRODUCT_STATUS.AVAILABLE,
    },
    active: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false },
);

const ProductModel = mongoose.model('Product', productSchema);
export default ProductModel;
