import { handleServiceError, schemaError } from '$lib/core/server/error';
import { connectDB } from '$lib/core/server/mongodb';
import { serverBus } from '$lib/core/server/serverBus';
import { EVENTS } from '$lib/core/server/serverBusEvents';
import DeliveryRepository from './DeliveryRepository';
import { deliveryEntrySchema, amountEntrySchema } from './DeliverySchema';

const db = await connectDB();
export default class DeliveryService {
  constructor() {
    this.repository = new DeliveryRepository(db);
  }

  async deliveryList(date) {
    const dateFilter = this.repository.getDateFilter(date, 'createdAt');
    return await this.repository.findAll(dateFilter);
  }

  async deliveryEntry(id, data) {
    try {
      const parsed = await deliveryEntrySchema.safeParseAsync(data);
      if (!parsed.success) schemaError(parsed);
      parsed.data.deliveredAt = data.deliveredAt ? new Date(data.deliveredAt) : new Date();

      // Get the delivery data before updating with new data
      const oldDelivery = await this.repository.findById(id);
      const result = await this.repository.updateById(id, parsed.data);
      // Get the delivery data after updating with new data
      const newDelivery = await this.repository.findById(id);

      // If operation success we do syncing
      if (result?.ok) {
        // 1. Sync orders
        serverBus.emit(EVENTS.ORDER.UPDATE_ORDER_BY_DELIVERY, { oldDelivery, newDelivery });
        // 2. Sync party statement
        serverBus.emit(EVENTS.PARTY_STATEMENT.UPDATE_PARTY_STATEMENT_BY_DELIVERY, newDelivery);
      }
      return result;
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async amountEntry(id, data) {
    try {
      const parsed = await amountEntrySchema.safeParseAsync(data);
      if (!parsed.success) schemaError(parsed);
      parsed.data.paymentAt = data?.paymentAt ? new Date(data.paymentAt) : new Date();
      const result = await this.repository.updateById(id, parsed.data);

      // If operation success we do syncing
      if (result?.ok) {
        // 1. Sync party statement
        const newDelivery = await this.repository.findById(id);
        serverBus.emit(EVENTS.PARTY_STATEMENT.UPDATE_PARTY_STATEMENT_BY_DELIVERY, newDelivery);
      }
      return result;
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async signDelivery(id) {
    try {
      // Get the delivery data before updating with new data
      const oldDelivery = await this.repository.findById(id);
      const result = await this.repository.toggleSignById(id);
      // Get the delivery data after updating with new data
      const newDelivery = await this.repository.findById(id);

      // If operation success we do syncing
      if (result?.ok) {
        // 1. Sync orders
        serverBus.emit(EVENTS.ORDER.UPDATE_ORDER_BY_DELIVERY, { oldDelivery, newDelivery });
        // 2. Sync party statement
        serverBus.emit(EVENTS.PARTY_STATEMENT.UPDATE_PARTY_STATEMENT_BY_DELIVERY, newDelivery);
      }
      return result;
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async markDelivery(id) {
    try {
      const result = await this.repository.toggleFieldById(id, 'hasMark');
      console.log(result);
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async updateDelivery(id, data) {
    try {
      const parsed = await deliveryEntrySchema.safeParseAsync({ ...data, id });
      if (!parsed.success) schemaError(parsed);

      const delivery = await this.repository.updateById(id, parsed.data);

      // Emit Events
      // 1. Handle Phone Updates for Party
      serverBus.emit(EVENTS.PARTY.FIND_AND_UPDATE_PHONE, data);
      // 2. Todo: Handle Cash Report Sync
      // serverBus.emit(EVENTS.PARTY.FIND_AND_UPDATE_PHONE, data);

      return delivery;
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async cashList(date) {
    const dateFilter = this.repository.getDateFilter(date, 'paymentAt');
    return this.repository.findCashDeliveryByDate(dateFilter);
  }

  async clearDeliveryByDate(date) {
    const dateFilter = this.repository.getDateFilter(date, 'createdAt');
    return this.repository.deleteByFilter(dateFilter);
  }
}
