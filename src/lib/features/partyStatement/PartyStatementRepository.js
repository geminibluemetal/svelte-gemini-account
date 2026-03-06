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

  async fetchAllBalanceForEachParty(type = "all") {
    let balanceFilter = {};
    if (type === "pending") {
      balanceFilter = { currentBalance: { $ne: 0 } };
    } else if (type === "nil") {
      balanceFilter = { currentBalance: 0 };
    }

    const result = await this.db.collection("party").aggregate([
      {
        $lookup: {
          from: "party_statements",
          localField: "_id",
          foreignField: "partyId",
          as: "statements"
        }
      },
      {
        $addFields: {
          totalCredit: {
            $sum: {
              $map: {
                input: "$statements",
                as: "s",
                in: { $cond: [{ $eq: ["$$s.entryType", "CREDIT"] }, "$$s.amount", 0] }
              }
            }
          },
          totalDebit: {
            $sum: {
              $map: {
                input: "$statements",
                as: "s",
                in: { $cond: [{ $eq: ["$$s.entryType", "DEBIT"] }, "$$s.amount", 0] }
              }
            }
          }
        }
      },
      {
        $addFields: {
          openingBal: { $ifNull: ["$openingBalance", 0] },
          currentBalance: {
            $subtract: [
              { $add: [{ $ifNull: ["$openingBalance", 0] }, { $ifNull: ["$totalDebit", 0] }] },
              { $ifNull: ["$totalCredit", 0] }
            ]
          }
        }
      },
      { $match: balanceFilter },
      {
        $project: {
          statements: 0,
        }
      }
    ]).toArray();
    return result.map(r => ({ ...r, id: r._id.toString() }));
  }
}
