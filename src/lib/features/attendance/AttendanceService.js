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
      const exist = await this.repository.findOne({ nameId: data.nameId, date: new Date(data.date) })
      const parsed = await attendanceSchema.safeParse(data);
      if (!parsed.success) schemaError(parsed);
      if (exist?.id) {
        return this.repository.updateById(data.id, parsed.data);
      }
      return this.repository.create(parsed.data);
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async setAttendance(data) {
    try {
      const exist = await this.repository.findOne({ nameId: data.nameId, date: new Date(data.date) })
      const AT = Number(data.fields.AT)
      const date = new Date(data.date)
      if (exist?.id) {
        return this.repository.updateById(data.id, { "fields.AT": AT });
      }
      return this.repository.create({ ...data, date, fields: { AT } });
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async setTip(data) {
    try {
      const date = new Date(data.date);

      // 1. Get the dynamic key name (like "T" or "AT") from the fields object
      const dynamicKey = Object.keys(data.fields)[0];
      const fieldValue = Number(data.fields[dynamicKey]);
      const exist = await this.repository.findOne({ nameId: data.nameId, date: new Date(data.date) })

      // --- UPDATE ---
      if (exist?.id) {
        return this.repository.updateById(data.id, {
          [`fields.${dynamicKey}`]: fieldValue // Becomes {"fields.T": value}
        });
      }

      // --- CREATE ---
      return this.repository.create({
        nameId: data.nameId,
        date,
        fields: {
          [dynamicKey]: fieldValue // Becomes { T: value }
        }
      });

    } catch (error) {
      return handleServiceError(error);
    }
  }
}
