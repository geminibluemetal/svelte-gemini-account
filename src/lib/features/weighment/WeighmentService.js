import { handleServiceError, schemaError } from '$lib/core/server/error';
import { connectDB } from '$lib/core/server/mongodb';
import { getReadingStatus, startReading, stopReading } from '$lib/core/server/weighment';
import WeighmentRepository from './WeighmentRepository';
import { weighmentCreateSchema, weighmentUpdateSchema } from './WeighmentSchema';

const db = await connectDB();
export default class WeighmentService {
  constructor() {
    this.repository = new WeighmentRepository(db);
  }

  async weighmentSwitch() {
    try {
      const status = getReadingStatus();
      if (!status.isReading && !status.isOpen) {
        return await startReading();
      } else {
        return await stopReading();
      }
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async weighmentList() {
    return await this.repository.findAll();
  }

  async createWeighment(data) {
    try {
      const parsed = await weighmentCreateSchema.safeParseAsync(data);
      if (!parsed.success) {
        schemaError(parsed);
      }
      return await this.repository.create(parsed.data);
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async updateWeighment(id, data) {
    try {
      const parsed = await weighmentUpdateSchema.safeParseAsync({ ...data, id });
      if (!parsed.success) {
        schemaError(parsed);
      }
      return await this.repository.updateById(id, parsed.data);
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async deleteWeighment(id) {
    try {
      return await this.repository.deleteById(id);
    } catch (error) {
      return handleServiceError(error);
    }
  }
}
