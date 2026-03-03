import { handleServiceError, schemaError } from '$lib/core/server/error';
import { connectDB } from '$lib/core/server/mongodb';
import { printOut } from '$lib/core/server/print';
import { serverBus } from '$lib/core/server/serverBus';
import { EVENTS } from '$lib/core/server/serverBusEvents';
import { getFormattedDate } from '$lib/utils/dateTime';
import { formatFixed } from '$lib/utils/number';
import TokenService from '../token/TokenService';
import CashRepository from './CashRepository';
import { cashCreateSchema, cashUpdateSchema } from './CashSchema';

const db = await connectDB();
export default class CashService {
  constructor() {
    this.repository = new CashRepository(db);
  }

  async cashList(date) {
    const dateFilter = this.repository.getDateFilter(date);
    return await this.repository.findAll(dateFilter);
  }

  async createCash(data) {
    try {
      const parsed = await cashCreateSchema.safeParseAsync(data);
      if (!parsed.success) schemaError(parsed);
      // Emit Events
      // 1. Handle Phone Updates for Party
      serverBus.emit(EVENTS.PARTY.FIND_AND_UPDATE_PHONE, data);
      // 2. Todo: Handle Cash Report Sync
      // serverBus.emit(EVENTS.PARTY.FIND_AND_UPDATE_PHONE, data);
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async updateCash(id, data) {
    try {
      const parsed = await cashUpdateSchema.safeParseAsync({ ...data, id });
      if (!parsed.success) schemaError(parsed);

      const cash = await this.repository.updateById(id, parsed.data);

      // Emit Events
      // 1. Handle Phone Updates for Party
      serverBus.emit(EVENTS.PARTY.FIND_AND_UPDATE_PHONE, data);
      // 2. Todo: Handle Cash Report Sync
      // serverBus.emit(EVENTS.PARTY.FIND_AND_UPDATE_PHONE, data);

      return cash;
    } catch (error) {
      return handleServiceError(error);
    }
  }

  // IMPORTANT: In Later if we implement these we should also do cash report sync
  // async deleteCash(id) {
  //   try {

  //     return await this.repository.deleteById(id);
  //   } catch (error) {
  //     return handleServiceError(error);
  //   }
  // }

  async getCashByNumber(cashNumber) {
    try {
      return await this.repository.findOne({ cashNumber });
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async getAllAvailableCashs() {
    try {
      const filter = { status: { $in: ['New', 'Loading', 'Partial'] } };
      return await this.repository.findAll(filter);
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

  async changeStatus(id, status) {
    try {
      return await this.repository.updateById(id, { status });
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async resetStatus(id) {
    try {
      const cash = await this.repository.findById(id);
      const status = CashService.examineStatusByQuantity(
        cash.totalQty,
        cash.deliveredQty,
        cash.balanceQty,
      );
      return await this.repository.updateById(id, { status });
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async clearCompletedCash() {
    try {
      return await this.repository.deleteByFilter({
        status: { $in: ['Delivered', 'Cancelled', 'Finished'] },
      });
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async generateToken(id, data) {
    const cash = await this.repository.findById(data.id);
    const tokenService = new TokenService();
    tokenService.createToken(
      {
        partyName: cash.partyName,
        tokenItem: cash.item,
        tokenQuantity: data.qty || cash.totalQty,
        deliveryItem: null,
        deliveryQuantity: 0,
        vehicle: data.vehicle,
      },
      {
        phone: cash.phone,
      },
    );
  }

  async singlePrint(data) {
    const cash = await this.repository.findById(data.id);
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
        .pairs('Cash', cash.cashNumber)
        .pairs('Party', cash.partyName)
        .pairs('Address', cash.address)
        .pairs('Phone', cash.phone)
        .pairs('Item', cash.item)
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
    const cash = await this.repository.findById(data.id);
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
        .pairs('Cash', cash.cashNumber)
        .pairs('Party', cash.partyName)
        .pairs('Address', cash.address)
        .pairs('Phone', cash.phone)
        .pairs('Item', cash.item)
        .pairs('Qty', formatFixed(cash.totalQty))
        .pairs('Amount', cash.amount)
        .pairs('Advance', cash.advance)
        .pairs('Discount', cash.discount)
        .pairs('Balance', cash.balance)
        .pairs('Tip', data.tip)
        .pairs('Total', Number(cash.balance) + Number(data.tip))
        .flushPairs()

        .feed(1)
        .cut();
    });
  }

  async phonePrint(data) {
    const cash = await this.repository.findById(data.id);
    await printOut((p) => {
      p.reset()
        .beepOn(1, 1)
        .setTextSize(1, 0)
        .align('left')

        .pairs('Cash', cash.cashNumber)
        .pairs('Address', cash.address)
        .pairs('Phone', cash.phone)
        .pairs('Item', cash.item)
        .pairs('Qty', formatFixed(cash.totalQty))
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
