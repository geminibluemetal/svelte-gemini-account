import AppError, { handleServiceError, schemaError } from '$lib/core/server/error';
import { serverBus } from '$lib/core/server/serverBus';
import { EVENTS } from '$lib/core/server/serverBusEvents';
import BaseService from '../base/BaseService';
import SettingsService from '../settings/SettingsService';
import OrderRepository from './OrderRepository';
import { orderCreateSchema, orderUpdateSchema } from './OrderSchema';

export default class OrderService extends BaseService {
  constructor() {
    super(OrderRepository);
    this.settingsService = new SettingsService();
  }

  async orderList() {
    const repo = await this.getRepository();
    return await repo.findAll();
  }

  async createOrder(data) {
    try {
      const repo = await this.getRepository();
      const parsed = await orderCreateSchema.safeParseAsync(data);
      if (!parsed.success) schemaError(parsed);
      const settings = await this.settingsService.getSettings();

      parsed.data.orderNumber = settings.nextOrderNumber;
      const order = await repo.create(parsed.data);

      if (order?.ok) {
        const result = await this.settingsService.updateSetting({
          lastOrderNumber: settings.nextOrderNumber,
        });
        if (!result.ok) throw new AppError('Order created but auto order number increment breaked');
      }

      // Emit Events
      // 1. Handle Phone Updates for Party
      serverBus.emit(EVENTS.PARTY.FIND_AND_UPDATE_PHONE, data);
      // 2. Todo: Handle Cash Report Sync
      // serverBus.emit(EVENTS.PARTY.FIND_AND_UPDATE_PHONE, data);

      return order;
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async updateOrder(id, data) {
    try {
      const repo = await this.getRepository();
      const parsed = await orderUpdateSchema.safeParseAsync({ ...data, id });
      if (!parsed.success) schemaError(parsed);

      const order = await repo.updateById(id, parsed.data);

      // Emit Events
      // 1. Handle Phone Updates for Party
      serverBus.emit(EVENTS.PARTY.FIND_AND_UPDATE_PHONE, data);
      // 2. Todo: Handle Cash Report Sync
      // serverBus.emit(EVENTS.PARTY.FIND_AND_UPDATE_PHONE, data);

      return order;
    } catch (error) {
      return handleServiceError(error);
    }
  }

  // IMPORTANT: In Later if we implement these we should also do cash report sync
  // async deleteOrder(id) {
  //   try {
  //     const repo = await this.getRepository();
  //     return await repo.deleteById(id);
  //   } catch (error) {
  //     return handleServiceError(error);
  //   }
  // }

  async getOrderByNumber(orderNumber) {
    try {
      const repo = await this.getRepository();
      return await repo.findOne({ orderNumber });
    } catch (error) {
      return handleServiceError(error);
    }
  }
}
