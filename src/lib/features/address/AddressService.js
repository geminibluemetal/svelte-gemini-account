import { handleServiceError, schemaError } from '$lib/core/server/error';
import BaseService from '../base/BaseService';
import AddressRepository from './AddressRepository';
import { addressCreateSchema, addressUpdateSchema } from './AddressSchema';

export default class AddressService extends BaseService {
  constructor() {
    super(AddressRepository);
  }

  async addressList() {
    const repo = await this.getRepository();
    return await repo.findAll({}, { name: 1, deliveryCharges: 1, _id: 1 });
  }

  async createAddress(data) {
    try {
      const repo = await this.getRepository();
      const parsed = await addressCreateSchema.safeParseAsync(data);
      if (!parsed.success) {
        schemaError(parsed);
      }
      return await repo.create(parsed.data);
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async updateAddress(id, data) {
    try {
      const repo = await this.getRepository();
      const parsed = await addressUpdateSchema.safeParseAsync({ ...data, id });
      if (!parsed.success) {
        schemaError(parsed);
      }
      return await repo.updateById(id, parsed.data);
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async deleteAddress(id) {
    try {
      const repo = await this.getRepository();
      return await repo.deleteById(id);
    } catch (error) {
      return handleServiceError(error);
    }
  }
}
