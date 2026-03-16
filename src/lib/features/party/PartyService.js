import { handleServiceError, schemaError } from '$lib/core/server/error';
import { connectDB } from '$lib/core/server/mongodb';
import PartyStatementService from '../partyStatement/PartyStatementService';
import PartyRepository from './PartyRepository';
import { partyCreateSchema, partyUpdateSchema } from './PartySchema';

const db = await connectDB()
export default class PartyService {
  constructor() {
    this.repository = new PartyRepository(db);
  }

  async partyList() {
    return await this.repository.findAll({}, { name: 1, phone: 1, openingBalance: 1, _id: 1 }, { sort: { name: 1 } });
  }

  async findPartyByPartyName(partyName) {
    return await this.repository.findOne({ name: partyName });
  }

  async getPartyById(id) {
    return await this.repository.findById(id);
  }

  async createParty(data) {
    try {
      const parsed = await partyCreateSchema.safeParseAsync(data);
      if (!parsed.success) {
        schemaError(parsed);
      }
      return await this.repository.create(parsed.data);
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async updateParty(id, data) {
    try {
      const parsed = await partyUpdateSchema.safeParseAsync({ ...data, id });
      if (!parsed.success) {
        schemaError(parsed);
      }
      return await this.repository.updateById(id, parsed.data);
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async updateOpeningBalance(id, balance) {
    try {
      const openingBalance = Number(balance) || 0
      return await this.repository.updateById(id, { openingBalance });
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async deleteParty(id) {
    try {
      return await this.repository.deleteById(id);
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async findAndUpdatePhone(partyName, phone) {
    try {
      if (phone) {
        const party = await this.repository.findOne({
          name: partyName,
          $or: [{ phone: null }, { phone: '' }, { phone: { $exists: false } }],
        });
        if (party) {
          // console.log(`Found party "${party.name}" without phone, updating to ${phone}`);
          return await this.repository.updateFieldsById(party.id, { phone });
        }
      }
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async resetBalance(id) {
    try {
      const partyStatementService = new PartyStatementService();
      const balance = await partyStatementService.getBalanceByParty(id);
      const deleteResult = await partyStatementService.deletePartyStatementByParty(id);
      let updateResult = {}
      if (deleteResult?.ok) {
        updateResult = await this.updateOpeningBalance(id, balance.currentBalance)
      }
      return updateResult
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async nilBalance(id) {
    try {
      const partyStatementService = new PartyStatementService();
      const deleteResult = await partyStatementService.deletePartyStatementByParty(id);
      let updateResult = {}
      if (deleteResult?.ok) {
        updateResult = await this.updateOpeningBalance(id, 0)
      }
      return updateResult
    } catch (error) {
      return handleServiceError(error);
    }
  }
}
