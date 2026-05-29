import { handleServiceError, schemaError } from '$lib/core/server/error';
import { connectDB } from '$lib/core/server/mongodb';
import AttendanceCategoryRepository from './AttendanceCategoryRepository';
import { attendanceCategorySchema } from './AttendanceCategorySchema';

const db = await connectDB();
export default class AttendanceCategoryService {
  constructor() {
    this.repository = new AttendanceCategoryRepository(db);
  }

  async getAllCategories() {
    return await this.repository.getAllCategories();
  }

  async getCategoryById(id) {
    return await this.repository.findById(id);
  }

  async editCategory(data) {
    try {
      const parsed = await attendanceCategorySchema.safeParse(data);
      if (!parsed.success) schemaError(parsed);
      const result = await this.repository.updateById(data.categoryId, parsed.data);
      return result;
    } catch (error) {
      return handleServiceError(error);
    }
  }
}
