import { handleServiceError, schemaError } from '$lib/core/server/error';
import { connectDB } from '$lib/core/server/mongodb';
import SettingsService from '../settings/SettingsService';
import PartyStatementRepository from './PartyStatementRepository';
import { partyStatementSchema } from './PartyStatementSchema';

const db = await connectDB();
export default class PartyStatementService {
  constructor() {
    this.settingsService = new SettingsService();
    this.repository = new PartyStatementRepository(db);
  }

  async partyStatementList() {
    return await this.repository.findAll();
  }

  async getAllOldBalance(date) {
    return await this.repository.findAllOldBalance(date);
  }

  async createPartyStatement(data) {
    try {
      const parsed = await partyStatementSchema.safeParseAsync(data);
      if (!parsed.success) schemaError(parsed);
      const oldBalanceResult = await this.repository.create(parsed.data);
      return oldBalanceResult;
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async updatePartyStatement(id, data) {
    try {
      const parsed = await partyStatementSchema.safeParseAsync(data);
      if (!parsed.success) schemaError(parsed);
      const oldBalanceResult = await this.repository.updateById(id, parsed.data);
      return oldBalanceResult;
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async signPartyStatement(id) {
    try {
      await this.repository.toggleSignById(id);
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async deletePartyStatement(id) {
    try {
      await this.repository.deleteById(id);
    } catch (error) {
      return handleServiceError(error);
    }
  }
}
