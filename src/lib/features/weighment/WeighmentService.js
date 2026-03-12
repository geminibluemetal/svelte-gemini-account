import { handleServiceError, schemaError } from '$lib/core/server/error';
import { connectDB } from '$lib/core/server/mongodb';
import { getReadingStatus, startReading, stopReading, reloadPort } from '$lib/core/server/weighment';
import SettingsService from '../settings/SettingsService';
import WeighmentRepository from './WeighmentRepository';
import { weighmentFirstSchema, weighmentSecondSchema } from './WeighmentSchema';

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

  async updateSettings(data) {
    const weighment = {
      path: data.path,
      baudRate: Number(data.baudRate),
      dataBits: Number(data.dataBits),
      stopBits: Number(data.stopBits),
      parity: data.parity,
    }
    const settingsService = new SettingsService();
    const result = await settingsService.updateSetting({ weighment });
    if (result.ok) {
      reloadPort()
    }
    return result
  }

  async weighmentList() {
    return await this.repository.findAll();
  }

  async saveFirstWeight(data) {
    try {
      data.firstWeightAt = new Date()
      const parsed = weighmentFirstSchema.safeParse(data);
      if (!parsed.success) {
        schemaError(parsed);
      }
      return await this.repository.create(parsed.data);
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async completeSecondWeight(id, data) {
    try {
      const parsed = weighmentSecondSchema.safeParse({ ...data, id });
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
