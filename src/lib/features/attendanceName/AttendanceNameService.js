import { handleServiceError, schemaError } from '$lib/core/server/error';
import { connectDB } from '$lib/core/server/mongodb';
import AttendanceNameRepository from './AttendanceNameRepository';
import { attendanceNameSchema } from './AttendanceNameSchema';

const db = await connectDB();
export default class AttendanceNameService {
  constructor() {
    this.repository = new AttendanceNameRepository(db);
  }

  async getAllNames() {
    return await this.repository.findAll();
  }

  async updateName(data) {
    try {
      const parsed = await attendanceNameSchema.safeParse(data);
      if (!parsed.success) schemaError(parsed);
      if (data.nameId) {
        if (data.isDelete) {
          return await this.repository.deleteById(data.nameId);
        }
        return await this.repository.updateById(data.nameId, parsed.data);
      }
      return await this.repository.create(parsed.data);
    } catch (error) {
      return handleServiceError(error);
    }
  }
}
