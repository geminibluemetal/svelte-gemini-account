import AppError, { handleServiceError, schemaError } from '$lib/core/server/error';
import { connectDB } from '$lib/core/server/mongodb';
import { ObjectId } from 'mongodb';
import PartyStatementRepository from './PartyStatementRepository';
import { partyStatementSchema } from './PartyStatementSchema';
import { calculateAmount } from '$lib/core/helper';
import PartyService from '../party/PartyService';

const db = await connectDB();
export default class PartyStatementService {
  constructor() {
    this.repository = new PartyStatementRepository(db);
  }

  async partyStatementList() {
    return await this.repository.findAll();
  }

  async getAllOldBalance(date) {
    return await this.repository.findAllOldBalance(date);
  }

  async getBalance(type) {
    return await this.repository.fetchAllBalanceForEachParty(type);
  }

  async getStatementByParty(partyId, openingBalance = 0) {
    return await this.repository.fetchStatementByParty(partyId, openingBalance);
  }

  async createPartyStatement(data) {
    try {
      const parsed = await partyStatementSchema.safeParseAsync(data);
      if (!parsed.success) schemaError(parsed);
      const oldBalanceResult = await this.repository.create(parsed.data);
      return oldBalanceResult;
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async updatePartyStatement(id, data) {
    try {
      const parsed = await partyStatementSchema.safeParseAsync(data);
      if (!parsed.success) schemaError(parsed);
      const oldBalanceResult = await this.repository.updateById(id, parsed.data);
      return oldBalanceResult;
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async signPartyStatement(id) {
    try {
      await this.repository.toggleSignById(id);
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async getPartyStatementByDeliveryId(deliveryId) {
    try {
      deliveryId = new ObjectId(deliveryId);
      return await this.repository.findOne({ deliveryId });
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async deletePartyStatement(id) {
    try {
      await this.repository.deleteById(id);
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async getAllOldBalanceCashList(date) {
    try {
      return await this.repository.findAllOldBalanceCash(date);
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async updatePartyStatementFromDelivery(delivery) {
    try {
      // First Delete Existing Record
      await this.repository.deleteByFilter({ deliveryId: new ObjectId(delivery.id) });

      if (delivery.amountType1 == 'AC' || delivery.amountType2 == 'AC') {
        let amount =
          (delivery.amountType1 == 'AC' ? delivery.amount1 : 0) +
          (delivery.amountType2 == 'AC' ? delivery.amount2 : 0);
        if (!amount) {
          const calcResult = await calculateAmount(
            delivery.address,
            delivery.deliveryItem,
            delivery.deliveryQuantity,
          );
          if (calcResult.success && calcResult?.data) {
            amount = calcResult.data;
          } else {
            throw new AppError(calcResult.message);
          }
        }
        const partyService = new PartyService();
        const party = await partyService.findPartyByPartyName(delivery.partyName);

        const preparedPartyStatement = {
          partyId: new ObjectId(party.id),
          deliveryId: new ObjectId(delivery.id),
          amountType: '',
          entryType: 'DEBIT',
          amount,
          item: delivery.deliveryItem,
          qty: delivery.deliveryQuantity,
          vehicle: delivery.vehicle,
          address: delivery.address,
          createdAt: delivery?.deliveredAt ? new Date(delivery.deliveredAt) : new Date(),
          sign: delivery.sign,
        };
        await this.repository.create(preparedPartyStatement);
      }
    } catch (error) {
      return handleServiceError(error);
    }
  }
}
