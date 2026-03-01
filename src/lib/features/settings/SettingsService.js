import { schemaError } from '$lib/core/server/error';
import BaseService from '../base/BaseService';
import SettingsRepository from './SettingsRepository';
import { settingsSchema } from './SettingsSchema';

export default class SettingsService extends BaseService {
  constructor() {
    super(SettingsRepository);
  }

  async getSettings() {
    const repo = await this.getRepository();
    return await repo.findOne();
  }

  async updateSetting(data = {}) {
    const repo = await this.getRepository();
    const parsed = await settingsSchema.safeParseAsync(data);
    if (!parsed.success) {
      schemaError(parsed);
    }
    return await repo.updateFields(parsed.data);
  }
}
