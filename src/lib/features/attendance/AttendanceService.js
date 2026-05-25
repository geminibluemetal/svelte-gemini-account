import { handleServiceError, schemaError } from '$lib/core/server/error';
import { connectDB } from '$lib/core/server/mongodb';
import AttendanceRepository from './AttendanceRepository';
import { attendanceSchema } from './AttendanceSchema';

const db = await connectDB();
export default class AttendanceService {
  constructor() {
    this.repository = new AttendanceRepository(db);
  }

  async getAttendanceData(startDate, endDate) {
    return await this.repository.findAll({ date: { $gte: startDate, $lte: endDate } });
  }

  async saveAttendance(data) {
    try {
      const parsed = await attendanceSchema.safeParse(data);
      if (!parsed.success) schemaError(parsed);
      if (data?.id) {
        return this.repository.updateById(data.id, parsed.data);
      }
      return this.repository.create(parsed.data);
    } catch (error) {
      return handleServiceError(error);
    }
  }
}
