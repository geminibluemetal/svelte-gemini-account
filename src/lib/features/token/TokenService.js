import AppError, { handleServiceError, schemaError } from '$lib/core/server/error';
import { connectDB } from '$lib/core/server/mongodb';
import { printOut } from '$lib/core/server/print';
import { getFormattedDate, getFormattedTime } from '$lib/utils/dateTime';
import { formatFixed } from '$lib/utils/number';
import DeliveryRepository from '../delivery/DeliveryRepository';
import SettingsService from '../settings/SettingsService';
import { tokenSchema } from './TokenSchema';

const db = await connectDB();
export default class TokenService {
  constructor() {
    this.settingsService = new SettingsService();
    this.repository = new DeliveryRepository(db, true); // Passing true as 2nd para should use Token model instead of delivery
  }

  async tokenList(date) {
    const dateFilter = this.repository.getDateFilter(date, 'createdAt');
    return await this.repository.findAll(dateFilter);
  }

  async createToken(data, additionalDataToPrint = {}) {
    try {
      const parsed = await tokenSchema.safeParse(data);
      if (!parsed.success) schemaError(parsed);
      parsed.data.serial = await this.getLastSerial();
      const tokenResult = await this.repository.create(parsed.data);
      const token = await this.repository.findById(tokenResult.data.insertedId);
      this.sendPrint(token, additionalDataToPrint);
      return tokenResult;
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async updateToken(id, data) {
    try {
      const parsed = await tokenSchema.safeParse(data);
      if (!parsed.success) schemaError(parsed);
      const tokenResult = await this.repository.updateById(id, parsed.data);
      const token = await this.repository.findById(id);
      this.sendPrint(token);
      return tokenResult;
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async deleteToken(id) {
    try {
      // Get last token and match id for delete last token only
      const lastToken = await this.repository.findOne({}, {}, { sort: { createdAt: -1 } });
      if (lastToken.id !== id) throw new AppError('Can only delete last token');
      if (lastToken.isClosed) throw new AppError('Cannot delete closed token.');
      return await this.repository.deleteById(id);
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async printToken(id) {
    try {
      const token = await this.repository.findById(id);
      this.sendPrint(token);
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async getLastSerial(date = new Date()) {
    try {
      const dateFilter = this.repository.getDateFilter(date, 'createdAt');
      const result = await this.repository.findOne(
        dateFilter,
        { serial: 1 },
        { sort: { createdAt: -1 } },
      );
      if (!result) return 1;
      return result.serial ? result.serial + 1 : 1; // increment
    } catch (error) {
      return handleServiceError(error);
    }
  }

  sendPrint(token, additionalData = {}) {
    printOut((p) => {
      p.reset()
        .beepOn(3, 1)
        .align('center')
        .setTextSize(1, 0)
        .bold(true)
        .line('Token')
        .bold(false)
        .dashedLine(17)
        .align('left');

      p.pairs('Token', token.serial);
      p.pairs('Party', token.partyName);
      p.pairs('Vcle', token.vehicle);
      p.pairs('Item', token.tokenItem);
      p.pairs('Qty', formatFixed(token.tokenQuantity));
      p.pairs('Date', getFormattedDate());
      p.pairs('Time', getFormattedTime());

      // Dynamically add pairs from data object
      Object.entries(additionalData).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          p.pairs(key, value);
        }
      });

      // Footer
      p.flushPairs().feed(1).cut();
    });
  }
}
