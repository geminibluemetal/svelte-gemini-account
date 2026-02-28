import { handleServiceError, schemaError } from '$lib/core/server/error';
import BaseService from '../base/BaseService';
import OrderRepository from './OrderRepository';
import { orderCreateSchema, orderUpdateSchema } from './OrderSchema';

export default class OrderService extends BaseService {
  constructor() {
    super(OrderRepository);
  }

  async orderList() {
    const repo = await this.getRepository();
    return await repo.findAll();
  }

  async createOrder(data) {
    try {
      const repo = await this.getRepository();
      const parsed = await orderCreateSchema.safeParseAsync(data);
      if (!parsed.success) {
        schemaError(parsed);
      }
      return await repo.create(parsed.data);
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async updateOrder(id, data) {
    try {
      const repo = await this.getRepository();
      const parsed = await orderUpdateSchema.safeParseAsync({ ...data, id });
      if (!parsed.success) {
        schemaError(parsed);
      }
      return await repo.updateById(id, parsed.data);
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async deleteOrder(id) {
    try {
      const repo = await this.getRepository();
      return await repo.deleteById(id);
    } catch (error) {
      return handleServiceError(error);
    }
  }
}
