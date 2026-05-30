import { handleServiceError, schemaError } from '$lib/core/server/error';
import { connectDB } from '$lib/core/server/mongodb';
import { printOut } from '$lib/core/server/print';
import { sseEmit } from '$lib/core/server/sseBus';
import { getFormattedDate, getFormattedTimestamp } from '$lib/utils/dateTime';
import { runCalculateRule } from '../../../routes/attendance/calculationRule';
import AttendanceCategoryService from '../attendanceCategory/AttendanceCategoryService';
import AttendanceNameService from '../attendanceName/AttendanceNameService';
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

  async getAttendanceDataById(startDate, endDate, nameId) {
    return await this.repository.findAll({ date: { $gte: startDate, $lte: endDate }, nameId });
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
        return this.repository.updateById(exist.id, { "fields.AT": AT });
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
        return this.repository.updateById(exist.id, {
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

  async syncAttendanceAdvance(oldCash, newCash) {
    const attendanceCategoryService = new AttendanceCategoryService();
    const attendanceNameService = new AttendanceNameService();
    const categoryList = await attendanceCategoryService.getAllCategories();
    const categoryNameList = categoryList.map(c => c.name)

    async function getNameIdandDate(cashData) {
      const cashMatches = categoryNameList.find(cn => cashData.description.endsWith(cn))
      const category = categoryList.find(c => c.name == cashMatches)
      const name = cashData.description.replace(cashMatches, "").trim();
      const nameData = await attendanceNameService.getNameByNameAndCategory(name, category._id.toString())
      let startDate = new Date(cashData.createdAt)
      startDate.setHours(0, 0, 0, 0);
      let endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + 1)
      return { startDate, endDate, nameId: nameData.id }
    }

    if (oldCash) {
      const { startDate, endDate, nameId } = await getNameIdandDate(oldCash);
      const attendance = (await this.getAttendanceDataById(startDate, endDate, nameId))?.[0];
      if (attendance) {
        await this.repository.updateFieldsById(attendance.id, { "fields.Adv": 0 });
      }
    }

    if (newCash) {
      const { startDate, endDate, nameId } = await getNameIdandDate(newCash);
      const attendance = (await this.getAttendanceDataById(startDate, endDate, nameId))?.[0];

      if (attendance) {
        await this.repository.updateFieldsById(attendance.id, { "fields.Adv": newCash.amount });
      } else {
        await this.repository.create({
          nameId,
          date: startDate,
          fields: { Adv: newCash.amount }
        });
      }
    }
    sseEmit({ type: 'ATTENDANCE.LIST' });
  }

  async printReceipt(data) {
    const attendanceNameService = new AttendanceNameService();
    const attendanceCategoryService = new AttendanceCategoryService();
    const name = await attendanceNameService.getNameById(data.nameId)
    const category = await attendanceCategoryService.getCategoryById(name.categoryId)
    const startDate = new Date(data.startDate)
    const endDate = new Date(data.endDate)
    const attendnace = await this.getAttendanceDataById(startDate, endDate, name.id)
    const calculatedData = runCalculateRule(name, category, attendnace)

    function camelToTitle(str) {
      if (!str) return '';
      const spacedStr = str.replace(/([A-Z])/g, ' $1');
      return spacedStr.charAt(0).toUpperCase() + spacedStr.slice(1).trim();
    }

    return await printOut((p) => {
      p.reset()
        .beepOn(1, 5)
        .align('center')
        .setTextSize(1, 0)
        .bold(true)
        .line('Payment Recipt')
        .line(name.name)
        .setTextSize(0, 0)
        .line(category.name)
        .line(`${getFormattedDate(startDate)} to ${getFormattedDate(endDate)}`)
        .setTextSize(1, 0)
        .bold(false)
        .dashedLine(17)
        .align('left')

      Object.entries(calculatedData).map(([key, value]) => {
        p.pairsOptional(camelToTitle(key), value)
      })

      p.flushPairs()
        .feed(1)
        .cut();
    });
  }
}
