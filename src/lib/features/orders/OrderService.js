import AppError, { handleServiceError, schemaError } from '$lib/core/server/error';
import { connectDB } from '$lib/core/server/mongodb';
import { printOut } from '$lib/core/server/print';
import { serverBus } from '$lib/core/server/serverBus';
import { EVENTS } from '$lib/core/server/serverBusEvents';
import { getFormattedDate } from '$lib/utils/dateTime';
import { formatFixed } from '$lib/utils/number';
import SettingsService from '../settings/SettingsService';
import TokenService from '../token/TokenService';
import OrderRepository from './OrderRepository';
import { orderCreateSchema, orderUpdateSchema } from './OrderSchema';

const db = await connectDB();
export default class OrderService {
  constructor() {
    this.settingsService = new SettingsService();
    this.repository = new OrderRepository(db);
  }

  async orderList() {
    return await this.repository.findAll();
  }

  async availableOrderList() {
    return await this.repository.findAll({ status: { $in: ['New', 'Loading', 'Partial'] } });
  }

  async createOrder(data) {
    try {
      const parsed = await orderCreateSchema.safeParseAsync(data);
      if (!parsed.success) schemaError(parsed);
      const settings = await this.settingsService.getSettings();

      // Store payment time for showing paytm amount for correct delivery sheet
      parsed.data.orderNumber = settings.nextOrderNumber;
      if (parsed.data.advance && parsed.data.amountType != 'AC') {
        parsed.data.paymentAt = new Date();
      }
      const order = await this.repository.create(parsed.data);

      // Store order number in settings
      if (order?.ok) {
        const result = await this.settingsService.updateSetting({
          lastOrderNumber: settings.nextOrderNumber,
        });
        if (!result.ok) throw new AppError('Order created but auto order number increment breaked');
      }

      // Emit Events
      // 1. Handle Phone Updates for Party
      serverBus.emit(EVENTS.PARTY.FIND_AND_UPDATE_PHONE, parsed.data);
      // 2. Handle Cash Sync
      const orderId = order.data.insertedId;
      const orderData = await this.repository.findById(orderId);
      serverBus.emit(EVENTS.CASH.SYNC_CASH_BY_ORDER_ID, orderData);

      return order;
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async updateOrder(id, data) {
    try {
      const parsed = await orderUpdateSchema.safeParseAsync({ ...data, id });
      if (!parsed.success) schemaError(parsed);

      // Store payment time for showing paytm amount for correct delivery sheet
      parsed.data.paymentAt =
        parsed.data.advance && parsed.data.amountType != 'AC'
          ? parsed.data.paymentAt
            ? new Date(parsed.data.paymentAt)
            : new Date()
          : null;

      // Update status again becase user may change the quantity then status should change
      const oldOrder = await this.repository.findById(id);
      parsed.data.status = OrderService.examineStatusByQuantity(
        parsed.data.totalQty,
        oldOrder.deliveredQty,
        parsed.data.totalQty - oldOrder.deliveredQty,
      );

      const order = await this.repository.updateById(id, parsed.data);

      // Emit Events
      // 1. Handle Phone Updates for Party
      serverBus.emit(EVENTS.PARTY.FIND_AND_UPDATE_PHONE, parsed.data);
      // 2. Handle Cash Sync
      const orderData = await this.repository.findById(id);
      serverBus.emit(EVENTS.CASH.SYNC_CASH_BY_ORDER_ID, orderData);

      return order;
    } catch (error) {
      return handleServiceError(error);
    }
  }

  // IMPORTANT: In Later if we implement these we should also do cash report sync
  // async deleteOrder(id) {
  //   try {

  //     return await this.repository.deleteById(id);
  //   } catch (error) {
  //     return handleServiceError(error);
  //   }
  // }

  async getOrderByNumber(orderNumber) {
    try {
      return await this.repository.findOne({ orderNumber });
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async getAllAvailableOrders() {
    try {
      const filter = { status: { $in: ['New', 'Loading', 'Partial'] } };
      return await this.repository.findAll(filter);
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async signOrder(id) {
    try {
      const result = await this.repository.toggleSignById(id);

      // Emit Events
      // 1. Handle Cash Sync
      const orderData = await this.repository.findById(id);
      serverBus.emit(EVENTS.CASH.SYNC_CASH_BY_ORDER_ID, orderData);

      return result;
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async changeStatus(id, status) {
    try {
      return await this.repository.updateById(id, { status });
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async resetStatus(id) {
    try {
      const order = await this.repository.findById(id);
      const status = OrderService.examineStatusByQuantity(
        order.totalQty,
        order.deliveredQty,
        order.balanceQty,
      );
      return await this.repository.updateById(id, { status });
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async clearCompletedOrder() {
    try {
      return await this.repository.deleteByFilter({
        status: { $in: ['Delivered', 'Cancelled', 'Finished'] },
      });
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async paytmAmountFromOrders(date) {
    const result = await this.repository.paytmAdvanceByDate(date);
    return result.map((r) => r.advance);
  }

  async generateToken(id, data) {
    const order = await this.repository.findById(data.id);
    const tokenService = new TokenService();
    tokenService.createToken(
      {
        partyName: order.partyName,
        tokenItem: order.item,
        tokenQuantity: data.qty || order.totalQty,
        deliveryItem: null,
        deliveryQuantity: 0,
        vehicle: data.vehicle,
      },
      {
        phone: order.phone,
      },
    );
  }

  async updateOrderDataFromOldDelivery(oldDelivery) {
    try {
      // Order number in delviery is string type, because we store 'NO' also in there.
      const orderNumber = Number(oldDelivery?.orderNumber);
      if (orderNumber) {
        const order = await this.getOrderByNumber(orderNumber);
        if (oldDelivery.sign) order.deliverySheetVerified = order.deliverySheetVerified - 1;
        order.deliveredQty = order.deliveredQty - oldDelivery.deliveryQuantity;
        order.status = OrderService.examineStatusByQuantity(
          order.totalQty,
          order.deliveredQty,
          order.totalQty - order.deliveredQty,
        );
        await this.repository.updateById(order.id, order);
      }
    } catch (error) {
      return handleServiceError(error)
    }
  }
  async updateOrderDataFromNewDelivery(newDelivery) {
    try {
      // Order number in delviery is string type, because we store 'NO' also in there.
      const orderNumber = Number(newDelivery?.orderNumber);
      if (orderNumber) {
        const order = await this.getOrderByNumber(orderNumber);
        if (newDelivery.sign) order.deliverySheetVerified = order.deliverySheetVerified + 1;
        order.deliveredQty = order.deliveredQty + newDelivery.deliveryQuantity;
        order.status = OrderService.examineStatusByQuantity(
          order.totalQty,
          order.deliveredQty,
          order.totalQty - order.deliveredQty,
        );
        await this.repository.updateById(order.id, order);
      }
    } catch (error) {
      return handleServiceError(error)
    }
  }

  async singlePrint(data) {
    const order = await this.repository.findById(data.id);
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
    const order = await this.repository.findById(data.id);
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
    const order = await this.repository.findById(data.id);
    await printOut((p) => {
      p.reset()
        .beepOn(1, 1)
        .setTextSize(1, 0)
        .align('left')

        // .pairs('Order', order.orderNumber)
        // .pairs('Address', order.address)
        .pairs('Phone', order.phone)
        .pairs('Item', `${order.item} - ${formatFixed(order.totalQty)}`)
        // .pairs('Qty', formatFixed(order.totalQty))
        .flushPairs()

        .feed(2)
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
