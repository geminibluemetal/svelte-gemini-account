import { handleServiceError, schemaError } from '$lib/core/server/error';
import { connectDB } from '$lib/core/server/mongodb';
import { serverBus } from '$lib/core/server/serverBus';
import { EVENTS } from '$lib/core/server/serverBusEvents';
import { getFormattedTime } from '$lib/utils/dateTime';
import CashRepository from './CashRepository';
import { cashSchema } from './CashSchema';

const db = await connectDB();
export default class CashService {
  constructor() {
    this.repository = new CashRepository(db);
  }

  async cashList(date) {
    const dateFilter = this.repository.getDateFilter(date, 'createdAt');
    return await this.repository.findAll(dateFilter);
  }

  async createCash(data) {
    try {
      const parsed = await cashSchema.safeParse(data);
      if (!parsed.success) schemaError(parsed);

      // Emit Events
      // 1. Handle Cash Description Create
      serverBus.emit(EVENTS.CASH_DESCRIPTION.CREATE_IF_NOT_EXISTS, data);

      return await this.repository.create(parsed.data);
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async updateCash(id, data) {
    try {
      const parsed = await cashSchema.safeParse(data);
      if (!parsed.success) schemaError(parsed);

      // Emit Events
      // 1. Handle Cash Description Create
      serverBus.emit(EVENTS.CASH_DESCRIPTION.CREATE_IF_NOT_EXISTS, data);

      return await this.repository.updateById(id, parsed.data);
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async deleteCash(id) {
    try {
      return await this.repository.deleteById(id);
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async deleteCashByOrderId(orderId) {
    try {
      return await this.repository.deleteByFilter({ orderId });
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async signCash(id) {
    try {
      return await this.repository.toggleSignById(id);
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async syncCashByOrderId(data) {
    if (data.advance && data.amountType == 'Cash') {
      const cashData = {
        orderId: data.id,
        reference: `OA-${data.orderNumber}`,
        description: [data.partyName, data.address].filter(Boolean).join(', '),
        amount: data.advance,
        sign: data.sign,
        entryType: 'INCOME',
        createdAt: new Date(data.paymentAt),
      };
      console.log(getFormattedTime(data.paymentAt));
      await this.deleteCashByOrderId(data.id);
      const result = await this.createCash(cashData);
      console.log(result);
    }
  }
}
