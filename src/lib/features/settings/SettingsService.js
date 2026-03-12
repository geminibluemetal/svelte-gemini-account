import { connectDB } from '$lib/core/server/mongodb';
import SettingsRepository from './SettingsRepository';

const db = await connectDB()
export default class SettingsService {
  constructor() {
    this.repository = new SettingsRepository(db)
  }

  async getSettings() {
    return await this.repository.findOne();
  }

  async updateSetting(data = {}) {
    return await this.repository.updateFields(data);
  }
}
