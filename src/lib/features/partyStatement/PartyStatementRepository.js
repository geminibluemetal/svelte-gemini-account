import BaseRepository from '../base/BaseRepository';
import PartyStatement from './PartyStatementModel';

export default class PartyStatementRepository extends BaseRepository {
  constructor(db) {
    super(db, 'partyStatement', PartyStatement);
  }

  async findAllOldBalance(date, extraFilter = {}) {
    const dateFilter = this.getDateFilter(date, 'createdAt');
    const pipeline = [
      {
        $match: { ...dateFilter, ...extraFilter },
      },
      {
        $addFields: {
          partyObjectId: { $toObjectId: '$partyId' },
        },
      },
      {
        $lookup: {
          from: 'party',
          localField: 'partyObjectId',
          foreignField: '_id',
          as: 'partyInfo',
        },
      },
      {
        $unwind: {
          path: '$partyInfo',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          partyName: '$partyInfo.name',
        },
      },
      {
        $project: {
          partyInfo: 0, // Remove the entire partyInfo object
          partyObjectId: 0, // Remove the temporary field
        },
      },
    ];

    const docs = await this.collection.aggregate(pipeline).toArray();
    return docs.map((doc) => this.toModel(doc));
  }

  async findAllOldBalanceCash(date) {
    const dateFilter = this.getDateFilter(date, 'createdAt');
    const projection = {
      amount: 1,
      description: 1,
      reference: 1,
      createdAt: 1,
      sign: 1,
      entryType: 1,
    }
    const pipeline = [
      {
        $match: {
          ...dateFilter,
          amountType: 'Cash',
          amount: { $gt: 0 },
        },
      },
      {
        $addFields: {
          partyObjectId: {
            $cond: {
              if: { $and: [{ $ne: ['$partyId', null] }, { $ne: ['$partyId', ''] }] },
              then: { $toObjectId: '$partyId' },
              else: null,
            },
          },
        },
      },
      {
        $lookup: {
          from: 'party',
          localField: 'partyObjectId',
          foreignField: '_id',
          as: 'partyInfo',
        },
      },
      {
        $unwind: {
          path: '$partyInfo',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          description: {
            $concat: [
              { $ifNull: ['$partyInfo.name', ''] },
              ' O/B',
            ],
          },
          reference: 'OB',
          entryType: 'INCOME',
        },
      },
      {
        $project: projection,
      },
    ];

    const docs = await this.collection.aggregate(pipeline).toArray();
    return docs.map((doc) => this.toModel(doc, projection));
  }
}
