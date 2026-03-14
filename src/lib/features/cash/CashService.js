import { handleServiceError, schemaError } from '$lib/core/server/error';
import { connectDB } from '$lib/core/server/mongodb';
import { serverBus } from '$lib/core/server/serverBus';
import { EVENTS } from '$lib/core/server/serverBusEvents';
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

  async getAdvanceCashForAttendance(type) {
    if (type == 'driver') {
      return await this.repository.findAll({
        $or: [
          { description: { $regex: 'Cleaner$' } },
          { description: { $regex: 'Driver$' } }
        ]
      });
    } else { // Crusher
      return await this.repository.findAll({
        description: { $regex: 'Crusher$' }
      });
    }
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
    await this.deleteCashByOrderId(data.id);
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
      const result = await this.createCash(cashData);
      console.log(result);
    }
  }

  async clearCashByDate(date) {
    const dateFilter = this.repository.getDateFilter(date, 'createdAt');
    return this.repository.deleteByFilter(dateFilter);
  }
}
