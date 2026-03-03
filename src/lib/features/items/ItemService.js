import { handleServiceError, handleSuccess, schemaError } from '$lib/core/server/error';
import { connectDB } from '$lib/core/server/mongodb';
import ItemRepository from './ItemRepository';
import { itemCreateSchema, itemUpdateSchema } from './ItemSchema';

const db = await connectDB()
export default class ItemService {
  constructor() {
    this.repository = new ItemRepository(db);
  }

  async itemList() {
    return await this.repository.findAll({}, { name: 1, _id: 1, price: 1 });
  }

  async createItem(data) {
    try {
      const parsed = await itemCreateSchema.safeParseAsync(data);
      if (!parsed.success) {
        schemaError(parsed);
      }
      return await this.repository.create(parsed.data);
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async updateItem(id, data) {
    try {
      const parsed = await itemUpdateSchema.safeParseAsync({ ...data, id });
      if (!parsed.success) {
        schemaError(parsed);
      }
      return await this.repository.updateById(id, parsed.data);
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async deleteItem(id) {
    try {
      return await this.repository.deleteById(id);
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async checkItemHasPrice(item, quantity) {
    try {
      const itemData = await this.repository.findOne({ name: item });
      if (!itemData) throw new Error('Item not found');

      let checkingPrice = ''
      if (quantity === 0.25) checkingPrice = 'unit025';
      else if (quantity === 0.5) checkingPrice = 'unit050';
      else if (quantity === 1) checkingPrice = 'unit100';
      else if (quantity === 1.5) checkingPrice = 'unit150';
      else if (quantity === 2) checkingPrice = 'unit200';
      else checkingPrice = 'unit100';

      const price = itemData.price[checkingPrice] > 0;
      return handleSuccess('Item has price', { hasPrice: price });
    } catch (error) {
      return handleServiceError(error);
    }
  }
}
