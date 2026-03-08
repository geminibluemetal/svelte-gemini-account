import { ObjectId } from 'mongodb';
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
        $match: { ...dateFilter, ...extraFilter, amount: { $gt: 0 }, entryType: 'CREDIT' },
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
    };
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
            $concat: [{ $ifNull: ['$partyInfo.name', ''] }, ' O/B'],
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

  async fetchAllBalanceForEachParty(type = 'pending') {
    type = type ? type : 'pending';
    let balanceFilter = {};
    if (type === 'pending') {
      balanceFilter = { currentBalance: { $ne: 0 } };
    } else if (type === 'nil') {
      balanceFilter = { currentBalance: 0 };
    }
    const result = await this.db
      .collection('party')
      .aggregate([
        {
          $lookup: {
            from: 'partyStatement',
            let: { p_id: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: [{ $toString: '$partyId' }, { $toString: '$$p_id' }],
                  },
                },
              },
            ],
            as: 'statements',
          },
        },
        {
          $addFields: {
            totalCredit: {
              $sum: {
                $map: {
                  input: '$statements',
                  as: 's',
                  in: {
                    $cond: [
                      { $eq: [{ $toUpper: '$$s.entryType' }, 'CREDIT'] }, // Force Uppercase check
                      { $ifNull: ['$$s.amount', 0] },
                      0,
                    ],
                  },
                },
              },
            },
            totalDebit: {
              $sum: {
                $map: {
                  input: '$statements',
                  as: 's',
                  in: {
                    $cond: [
                      { $eq: [{ $toUpper: '$$s.entryType' }, 'DEBIT'] }, // Force Uppercase check
                      { $ifNull: ['$$s.amount', 0] },
                      0,
                    ],
                  },
                },
              },
            },
          },
        },
        {
          $addFields: {
            openingBal: { $ifNull: ['$openingBalance', 0] },
            currentBalance: {
              $subtract: [
                { $add: [{ $ifNull: ['$openingBalance', 0] }, { $ifNull: ['$totalDebit', 0] }] },
                { $ifNull: ['$totalCredit', 0] },
              ],
            },
          },
        },
        { $match: balanceFilter },
        { $project: { statements: 0 } },
      ])
      .toArray();
    return result.map((r) => ({ ...r, id: r._id.toString() }));
  }

  async fetchStatementByParty(partyId, openingBalance = 0) {
    // 1. Fetch statements from DB, sorted by date (Ascending)
    const statements = await this.db
      .collection('partyStatement')
      .find({ partyId: new ObjectId(partyId) })
      .sort({ createdAt: 1 })
      .toArray();

    let currentBalance = openingBalance;

    // 2. Map data to match your 'headers' keys
    const formattedStatements = statements.map((stmt) => {
      const amount = stmt.amount || 0;
      const isDebit = stmt.entryType?.toUpperCase() === 'DEBIT';
      const isCredit = stmt.entryType?.toUpperCase() === 'CREDIT';

      // Calculate Debit/Credit columns
      const debit = isDebit ? amount : 0;
      const credit = isCredit ? amount : 0;

      // Update the running balance logic
      currentBalance = currentBalance + debit - credit;

      return {
        ...stmt,
        id: stmt._id.toString(),
        debit: debit, // Matches header key: 'debit'
        credit: credit, // Matches header key: 'credit'
        running_balance: currentBalance, // Matches header key: 'running_balance'
        // Ensure other header keys exist
        vehicle: stmt.vehicle || '',
        address: stmt.address || '',
        item: stmt.item || '',
        qty: stmt.qty || 0,
        amountType: stmt.amountType || '',
        sign: stmt.sign || false,
      };
    });

    return formattedStatements;
  }
}
