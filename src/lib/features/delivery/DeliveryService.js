import { handleServiceError, schemaError } from '$lib/core/server/error';
import { connectDB } from '$lib/core/server/mongodb';
import { printOut } from '$lib/core/server/print';
import { serverBus } from '$lib/core/server/serverBus';
import { EVENTS } from '$lib/core/server/serverBusEvents';
import { getFormattedDate } from '$lib/utils/dateTime';
import { formatFixed } from '$lib/utils/number';
import SettingsService from '../settings/SettingsService';
import DeliveryRepository from './DeliveryRepository';
import { deliveryEntrySchema, amountEntrySchema } from './DeliverySchema';

const db = await connectDB();
export default class DeliveryService {
  constructor() {
    this.settingsService = new SettingsService();
    this.repository = new DeliveryRepository(db);
  }

  async deliveryList(date) {
    const dateFilter = this.repository.getDateFilter(date, 'createdAt');
    return await this.repository.findAll(dateFilter);
  }

  async deliveryEntry(id, data) {
    try {
      const parsed = await deliveryEntrySchema.safeParseAsync(data);
      console.log(parsed);
      if (!parsed.success) schemaError(parsed);
      parsed.data.deliveredAt = data.deliveredAt ? new Date(data.deliveredAt) : new Date();
      return await this.repository.updateById(id, parsed.data);
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async amountEntry(id, data) {
    try {
      const parsed = await amountEntrySchema.safeParseAsync(data);
      if (!parsed.success) schemaError(parsed);
      parsed.data.paymentAt = data?.paymentAt ? new Date(data.paymentAt) : new Date();
      return await this.repository.updateById(id, parsed.data);
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async signDelivery(id) {
    try {
      const result = await this.repository.toggleSignById(id);
      console.log(result);
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

  // IMPORTANT: In Later if we implement these we should also do cash report sync
  // async deleteDelivery(id) {
  //   try {

  //     return await this.repository.deleteById(id);
  //   } catch (error) {
  //     return handleServiceError(error);
  //   }
  // }

  async getDeliveryByNumber(deliveryNumber) {
    try {
      return await this.repository.findOne({ deliveryNumber });
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async getAllAvailableDeliverys() {
    try {
      const filter = { status: { $in: ['New', 'Loading', 'Partial'] } };
      return await this.repository.findAll(filter);
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
      const delivery = await this.repository.findById(id);
      const status = DeliveryService.examineStatusByQuantity(
        delivery.totalQty,
        delivery.deliveredQty,
        delivery.balanceQty,
      );
      return await this.repository.updateById(id, { status });
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async clearCompletedDelivery() {
    try {
      return await this.repository.deleteByFilter({
        status: { $in: ['Delivered', 'Cancelled', 'Finished'] },
      });
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async singlePrint(data) {
    const delivery = await this.repository.findById(data.id);
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
        .pairs('Delivery', delivery.deliveryNumber)
        .pairs('Party', delivery.partyName)
        .pairs('Address', delivery.address)
        .pairs('Phone', delivery.phone)
        .pairs('Item', delivery.item)
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
    const delivery = await this.repository.findById(data.id);
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
        .pairs('Delivery', delivery.deliveryNumber)
        .pairs('Party', delivery.partyName)
        .pairs('Address', delivery.address)
        .pairs('Phone', delivery.phone)
        .pairs('Item', delivery.item)
        .pairs('Qty', formatFixed(delivery.totalQty))
        .pairs('Amount', delivery.amount)
        .pairs('Advance', delivery.advance)
        .pairs('Discount', delivery.discount)
        .pairs('Balance', delivery.balance)
        .pairs('Tip', data.tip)
        .pairs('Total', Number(delivery.balance) + Number(data.tip))
        .flushPairs()

        .feed(1)
        .cut();
    });
  }

  async phonePrint(data) {
    const delivery = await this.repository.findById(data.id);
    await printOut((p) => {
      p.reset()
        .beepOn(1, 1)
        .setTextSize(1, 0)
        .align('left')

        .pairs('Delivery', delivery.deliveryNumber)
        .pairs('Address', delivery.address)
        .pairs('Phone', delivery.phone)
        .pairs('Item', delivery.item)
        .pairs('Qty', formatFixed(delivery.totalQty))
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
