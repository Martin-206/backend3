import ProductModel from '../models/product.model.js';

const PRODUCT_PUBLIC_FIELDS =
  'title description code price stock category status createdAt updatedAt';

class ProductRepository {
  static buildFilters(filters = {}) {
    const query = { active: true };

    if (filters.category) query.category = filters.category;
    if (filters.status) query.status = filters.status;
    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
        { code: { $regex: filters.search, $options: 'i' } },
      ];
    }

    return query;
  }



  static async getAll(filters = {}) {
    const query = this.buildFilters(filters);
    return ProductModel.find(query)
      .select(PRODUCT_PUBLIC_FIELDS)
      .sort({ createdAt: -1 })
      .lean();
  }

  static async getById(id) {
    return ProductModel.findOne({ _id: id, active: true })
      .select(PRODUCT_PUBLIC_FIELDS)
      .lean();
  }


  
  static async getByCode(code) {
    return ProductModel.findOne({ code, active: true }).select('_id code').lean();
  }

  static async create(productData) {
    const product = await ProductModel.create(productData);
    return ProductModel.findById(product._id).select(PRODUCT_PUBLIC_FIELDS).lean();
  }



  static async updateById(id, productData) {
    return ProductModel.findOneAndUpdate(
      { _id: id, active: true },
      productData,
      { new: true, runValidators: true },
    )
      .select(PRODUCT_PUBLIC_FIELDS)
      .lean();
  }



  static async softDeleteById(id) {
    return ProductModel.findOneAndUpdate(
      { _id: id, active: true },
      { active: false },
      { new: true },
    )
      .select('_id active')
      .lean();
  }
}

export default ProductRepository;
