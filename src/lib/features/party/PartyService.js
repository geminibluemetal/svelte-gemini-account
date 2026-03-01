import { handleServiceError, schemaError } from '$lib/core/server/error';
import { connectDB } from '$lib/core/server/mongodb';
import PartyRepository from './PartyRepository';
import { partyCreateSchema, partyUpdateSchema } from './PartySchema';

const db = await connectDB()
export default class PartyService {
  constructor() {
    this.repository = new PartyRepository(db);
  }

  async partyList() {
    return await this.repository.findAll({}, { name: 1, phone: 1, openingBalance: 1, _id: 1 });
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
}
