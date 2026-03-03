import { handleServiceError, schemaError } from '$lib/core/server/error';
import { connectDB } from '$lib/core/server/mongodb';
import { printOut } from '$lib/core/server/print';
import { serverBus } from '$lib/core/server/serverBus';
import { EVENTS } from '$lib/core/server/serverBusEvents';
import { getFormattedDate } from '$lib/utils/dateTime';
import { formatFixed } from '$lib/utils/number';
import TokenService from '../token/TokenService';
import CashReportRepository from './CashReportRepository';
import { cashReportCreateSchema, cashReportUpdateSchema } from './CashReportSchema';

const db = await connectDB();
export default class CashReportService {
  constructor() {
    this.repository = new CashReportRepository(db);
  }

  async cashReportList(date) {
    const dateFilter = this.repository.getDateFilter(date);
    return await this.repository.findAll(dateFilter);
  }

  async createCashReport(data) {
    try {
      const parsed = await cashReportCreateSchema.safeParseAsync(data);
      if (!parsed.success) schemaError(parsed);
      serverBus.emit(EVENTS.PARTY.FIND_AND_UPDATE_PHONE, data);
      // 2. Todo: Handle CashReport Report Sync
      // serverBus.emit(EVENTS.PARTY.FIND_AND_UPDATE_PHONE, data);
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async updateCashReport(id, data) {
    try {
      const parsed = await cashReportUpdateSchema.safeParseAsync({ ...data, id });
      if (!parsed.success) schemaError(parsed);

      const cashReport = await this.repository.updateById(id, parsed.data);

      // Emit Events
      // 1. Handle Phone Updates for Party
      serverBus.emit(EVENTS.PARTY.FIND_AND_UPDATE_PHONE, data);
      // 2. Todo: Handle CashReport Report Sync
      // serverBus.emit(EVENTS.PARTY.FIND_AND_UPDATE_PHONE, data);

      return cashReport;
    } catch (error) {
      return handleServiceError(error);
    }
  }

  // IMPORTANT: In Later if we implement these we should also do cashReport report sync
  // async deleteCashReport(id) {
  //   try {

  //     return await this.repository.deleteById(id);
  //   } catch (error) {
  //     return handleServiceError(error);
  //   }
  // }

  async getCashReportByNumber(cashReportNumber) {
    try {
      return await this.repository.findOne({ cashReportNumber });
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async getAllAvailableCashReports() {
    try {
      const filter = { status: { $in: ['New', 'Loading', 'Partial'] } };
      return await this.repository.findAll(filter);
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async signCashReport(id) {
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
      const cashReport = await this.repository.findById(id);
      const status = CashReportService.examineStatusByQuantity(
        cashReport.totalQty,
        cashReport.deliveredQty,
        cashReport.balanceQty,
      );
      return await this.repository.updateById(id, { status });
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async clearCompletedCashReport() {
    try {
      return await this.repository.deleteByFilter({
        status: { $in: ['Delivered', 'Cancelled', 'Finished'] },
      });
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async generateToken(id, data) {
    const cashReport = await this.repository.findById(data.id);
    const tokenService = new TokenService();
    tokenService.createToken(
      {
        partyName: cashReport.partyName,
        tokenItem: cashReport.item,
        tokenQuantity: data.qty || cashReport.totalQty,
        deliveryItem: null,
        deliveryQuantity: 0,
        vehicle: data.vehicle,
      },
      {
        phone: cashReport.phone,
      },
    );
  }

  async singlePrint(data) {
    const cashReport = await this.repository.findById(data.id);
    await printOut((p) => {
      p.reset()
        .beepOn(1, 2)
        .align('center')
        .setTextSize(1, 0)
        .bold(true)
        .line('Single CashReport Bill')
        .bold(false)
        .dashedLine(17)
        .align('left')

        .pairs('Date', getFormattedDate())
        .pairs('CashReport', cashReport.cashReportNumber)
        .pairs('Party', cashReport.partyName)
        .pairs('Address', cashReport.address)
        .pairs('Phone', cashReport.phone)
        .pairs('Item', cashReport.item)
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
    const cashReport = await this.repository.findById(data.id);
    await printOut((p) => {
      p.reset()
        .beepOn(2, 2)
        .align('center')
        .setTextSize(1, 0)
        .bold(true)
        .line('Full CashReport Bill')
        .bold(false)
        .dashedLine(17)
        .align('left')

        .pairs('Date', getFormattedDate())
        .pairs('CashReport', cashReport.cashReportNumber)
        .pairs('Party', cashReport.partyName)
        .pairs('Address', cashReport.address)
        .pairs('Phone', cashReport.phone)
        .pairs('Item', cashReport.item)
        .pairs('Qty', formatFixed(cashReport.totalQty))
        .pairs('Amount', cashReport.amount)
        .pairs('Advance', cashReport.advance)
        .pairs('Discount', cashReport.discount)
        .pairs('Balance', cashReport.balance)
        .pairs('Tip', data.tip)
        .pairs('Total', Number(cashReport.balance) + Number(data.tip))
        .flushPairs()

        .feed(1)
        .cut();
    });
  }

  async phonePrint(data) {
    const cashReport = await this.repository.findById(data.id);
    await printOut((p) => {
      p.reset()
        .beepOn(1, 1)
        .setTextSize(1, 0)
        .align('left')

        .pairs('CashReport', cashReport.cashReportNumber)
        .pairs('Address', cashReport.address)
        .pairs('Phone', cashReport.phone)
        .pairs('Item', cashReport.item)
        .pairs('Qty', formatFixed(cashReport.totalQty))
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
