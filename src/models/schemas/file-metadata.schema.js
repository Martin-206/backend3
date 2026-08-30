import mongoose from 'mongoose';

export const fileMetadataSchema = new mongoose.Schema(
  {
    original_name: { type: String, required: true },
    stored_name: { type: String, required: true },
    path: { type: String, required: true },
    mime_type: { type: String, required: true },
    size: { type: Number, required: true },
    document_type: { type: String, required: true },
    uploaded_at: { type: Date, default: Date.now },
  },
  { _id: true, versionKey: false },
);
