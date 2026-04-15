import { handleServiceError } from '$lib/core/server/error';
import { connectDB } from '$lib/core/server/mongodb';
import CashReportRepository from './CashReportRepository';
// import { cashReportSchema } from './CashReportSchema';

const db = await connectDB();
export default class CashReportService {
  constructor() {
    this.repository = new CashReportRepository(db);
  }

  async cashReportList(date) {
    const dateFilter = this.repository.getDateFilter(date, 'createdAt');
    return await this.repository.findAll(dateFilter);
  }

  async createCashReport() {
    try {
      const cashReport = await this.repository.create();
      return cashReport;
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async deleteCashReport(id) {
    try {
      return await this.repository.deleteById(id);
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async clearCashReportByDate(date) {
    try {
      const dateFilter = this.repository.getDateFilter(date, 'createdAt');
      return await this.repository.deleteByFilter(dateFilter);
    } catch (error) {
      return handleServiceError(error);
    }
  }
}
