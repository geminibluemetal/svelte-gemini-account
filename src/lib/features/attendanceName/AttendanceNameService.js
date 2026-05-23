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
      console.log('Updating attendance name with data:', data);
      const parsed = await attendanceNameSchema.safeParse(data);
      if (!parsed.success) schemaError(parsed);
      console.log('Parsed data:', parsed.data);
      const result = await this.repository.updateById(data.nameId, parsed.data);
      return result;
    } catch (error) {
      return handleServiceError(error);
    }
  }
}
