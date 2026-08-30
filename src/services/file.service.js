import fs from 'fs/promises';
import path from 'path';

class FileService {
  static buildMetadata(file, documentType) {
    return {
      original_name: file.originalname,
      stored_name: file.filename,
      path: path.relative(process.cwd(), file.path).split(path.sep).join('/'),
      mime_type: file.mimetype,
      size: file.size,
      document_type: documentType,
      uploaded_at: new Date(),
    };
  }

  static async remove(file) {
    if (!file?.path) return;
    try { await fs.unlink(file.path); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
}

export default FileService;
