import AppError, { handleServiceError, schemaError } from '$lib/core/server/error';
import { printOut } from '$lib/core/server/print';
import { serverBus } from '$lib/core/server/serverBus';
import { EVENTS } from '$lib/core/server/serverBusEvents';
import { getFormattedDate } from '$lib/utils/dateTime';
import { formatFixed } from '$lib/utils/number';
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

  async getAllAvailableOrders() {
    try {
      const repo = await this.getRepository();
      const filter = { status: { $in: ['New', 'Loading', 'Partial'] } }
      return await repo.findAll(filter);
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async signOrder(id) {
    try {
      const repo = await this.getRepository();
      const piplineArray = [{ $set: { sign: { $not: "$sign" } } }]
      return await repo.updateAggregationById(id, piplineArray);
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async changeStatus(id, status) {
    try {
      const repo = await this.getRepository();
      return await repo.updateById(id, { status });
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async resetStatus(id) {
    try {
      const repo = await this.getRepository();
      const order = await repo.findById(id);
      const status = OrderService.examineStatusByQuantity(order.totalQty, order.deliveredQty, order.balanceQty);
      return await repo.updateById(id, { status });
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async clearCompletedOrder() {
    try {
      const repo = await this.getRepository();
      return await repo.deleteByFilter({ status: { $in: ['Delivered', 'Cancelled', 'Finished'] } });
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async singlePrint(data) {
    const repo = await this.getRepository();
    const order = await repo.findById(data.id);
    await printOut((p) => {
      p.reset()
        .beepOn(1, 2)
        .align('center')
        .setTextSize(1, 0)
        .bold(true)
        .line('Single Cash Bill')
        .bold(false)
        .dashedLine(17)
        .align('left')

        .pairs('Date', getFormattedDate())
        .pairs('Order', order.orderNumber)
        .pairs('Party', order.partyName)
        .pairs('Address', order.address)
        .pairs('Phone', order.phone)
        .pairs('Item', order.item)
        .pairs('Qty', formatFixed(data.qty))
        .pairs('Amount', data.amount)
        .pairs('Tip', data.tip)
        .pairs('Total', Number(data.amount) + Number(data.tip))
        .flushPairs()

        .feed(1)
        .cut();
    });
  }

  async fullPrint(data) {
    const repo = await this.getRepository();
    const order = await repo.findById(data.id);
    await printOut((p) => {
      p.reset()
        .beepOn(2, 2)
        .align('center')
        .setTextSize(1, 0)
        .bold(true)
        .line('Full Cash Bill')
        .bold(false)
        .dashedLine(17)
        .align('left')

        .pairs('Date', getFormattedDate())
        .pairs('Order', order.orderNumber)
        .pairs('Party', order.partyName)
        .pairs('Address', order.address)
        .pairs('Phone', order.phone)
        .pairs('Item', order.item)
        .pairs('Qty', formatFixed(order.totalQty))
        .pairs('Amount', order.amount)
        .pairs('Advance', order.advance)
        .pairs('Discount', order.discount)
        .pairs('Balance', order.balance)
        .pairs('Tip', data.tip)
        .pairs('Total', Number(order.balance) + Number(data.tip))
        .flushPairs()

        .feed(1)
        .cut();
    });
  }

  async phonePrint(data) {
    const repo = await this.getRepository();
    const order = await repo.findById(data.id);
    await printOut((p) => {
      p.reset()
        .beepOn(1, 1)
        .setTextSize(1, 0)
        .align('left')

        .pairs('Order', order.orderNumber)
        .pairs('Address', order.address)
        .pairs('Phone', order.phone)
        .pairs('Item', order.item)
        .pairs('Qty', formatFixed(order.totalQty))
        .flushPairs()

        .feed(1)
        .cut();
    });
  }

  static examineStatusByQuantity(totalQty, deliveredQty, balanceQty) {
    totalQty = Number(totalQty) || 0;
    deliveredQty = Number(deliveredQty) || 0;
    balanceQty = Number(balanceQty) || 0;
    return deliveredQty >= totalQty
      ? 'Delivered'
      : totalQty === balanceQty && deliveredQty === 0
        ? 'New'
        : balanceQty !== 0
          ? 'Partial'
          : 'New';
  }
}