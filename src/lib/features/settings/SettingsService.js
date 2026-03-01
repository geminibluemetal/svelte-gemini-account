import { schemaError } from '$lib/core/server/error';
import { connectDB } from '$lib/core/server/mongodb';
import SettingsRepository from './SettingsRepository';
import { settingsSchema } from './SettingsSchema';

const db = await connectDB()
export default class SettingsService {
  constructor() {
    this.repository = new SettingsRepository(db)
  }

  async getSettings() {
    return await this.repository.findOne();
  }

  async updateSetting(data = {}) {
    const parsed = await settingsSchema.safeParseAsync(data);
    if (!parsed.success) {
      schemaError(parsed);
    }
    return await this.repository.updateFields(parsed.data);
  }
}
