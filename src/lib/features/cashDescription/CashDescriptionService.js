import { handleServiceError, schemaError } from '$lib/core/server/error';
import { connectDB } from '$lib/core/server/mongodb';
import CashDescriptionRepository from './CashDescriptionRepository';
import { cashDescriptionSchema } from './CashDescriptionSchema';

const db = await connectDB();
export default class CashDescriptionService {
  constructor() {
    this.repository = new CashDescriptionRepository(db);
  }

  async cashDescriptionList() {
    return await this.repository.findAll();
  }

  async createIfNotExists(description) {
    try {
      const existing = await this.repository.findOne({ description });
      if (existing) return existing;
      const parsed = await cashDescriptionSchema.safeParseAsync({ description });
      if (!parsed.success) schemaError(parsed);
      const cashDescription = await this.repository.create(parsed.data);
      return cashDescription;
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async createCashDescription(data) {
    try {
      const parsed = await cashDescriptionSchema.safeParseAsync(data);
      if (!parsed.success) schemaError(parsed);
      const cashDescription = await this.repository.create(parsed.data);
      return cashDescription;
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async updateCashDescription(id, data) {
    try {
      const parsed = await cashDescriptionSchema.safeParseAsync(data);
      if (!parsed.success) schemaError(parsed);
      const cashDescription = await this.repository.updateById(id, parsed.data);
      return cashDescription;
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async deleteCashDescription(id) {
    try {
      return await this.repository.deleteById(id);
    } catch (error) {
      return handleServiceError(error);
    }
  }
}
