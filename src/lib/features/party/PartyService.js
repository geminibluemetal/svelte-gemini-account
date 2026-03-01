import { handleServiceError, schemaError } from '$lib/core/server/error';
import BaseService from '../base/BaseService';
import PartyRepository from './PartyRepository';
import { partyCreateSchema, partyUpdateSchema } from './PartySchema';

export default class PartyService extends BaseService {
  constructor() {
    super(PartyRepository);
  }

  async partyList() {
    const repo = await this.getRepository();
    return await repo.findAll({}, { name: 1, phone: 1, openingBalance: 1, _id: 1 });
  }

  async createParty(data) {
    try {
      const repo = await this.getRepository();
      const parsed = await partyCreateSchema.safeParseAsync(data);
      if (!parsed.success) {
        schemaError(parsed);
      }
      return await repo.create(parsed.data);
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async updateParty(id, data) {
    try {
      const repo = await this.getRepository();
      const parsed = await partyUpdateSchema.safeParseAsync({ ...data, id });
      if (!parsed.success) {
        schemaError(parsed);
      }
      return await repo.updateById(id, parsed.data);
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async deleteParty(id) {
    try {
      const repo = await this.getRepository();
      return await repo.deleteById(id);
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async findAndUpdatePhone(partyName, phone) {
    try {
      if (phone) {
        const repo = await this.getRepository();
        const party = await repo.findOne({
          name: partyName,
          $or: [{ phone: null }, { phone: '' }, { phone: { $exists: false } }],
        });
        if (party) {
          // console.log(`Found party "${party.name}" without phone, updating to ${phone}`);
          return await repo.updateFieldsById(party.id, { phone });
        }
      }
    } catch (error) {
      return handleServiceError(error);
    }
  }
}
