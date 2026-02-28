import { handleServiceError, schemaError } from '$lib/core/server/error';
import BaseService from '../base/BaseService';
import ItemRepository from './ItemRepository';
import { itemCreateSchema, itemUpdateSchema } from './ItemSchema';

export default class ItemService extends BaseService {
  constructor() {
    super(ItemRepository);
  }

  async itemList() {
    const repo = await this.getRepository();
    return await repo.findAll({}, { name: 1, _id: 1, price: 1 });
  }

  async createItem(data) {
    try {
      const repo = await this.getRepository();
      const parsed = await itemCreateSchema.safeParseAsync(data);
      if (!parsed.success) {
        schemaError(parsed);
      }
      return await repo.create(parsed.data);
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async updateItem(id, data) {
    try {
      const repo = await this.getRepository();
      const parsed = await itemUpdateSchema.safeParseAsync({ ...data, id });
      if (!parsed.success) {
        schemaError(parsed);
      }
      return await repo.updateById(id, parsed.data);
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async deleteItem(id) {
    try {
      const repo = await this.getRepository();
      return await repo.deleteById(id);
    } catch (error) {
      return handleServiceError(error);
    }
  }
}
