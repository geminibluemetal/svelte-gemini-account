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
        $match: {
          ...dateFilter,
          ...extraFilter,
          amount: { $gt: 0 },
          entryType: 'CREDIT',
          isCleared: false,
        },
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
          isCleared: false,
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
                    $and: [
                      { $eq: [{ $toString: '$partyId' }, { $toString: '$$p_id' }] },
                      { $ne: ['$isHidden', true] },
                    ],
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
            totalAdjust: {
              $sum: {
                $map: {
                  input: '$statements',
                  as: 's',
                  in: {
                    $cond: [
                      { $eq: [{ $toUpper: '$$s.entryType' }, 'ADJUST'] }, // Force Uppercase check
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
                { $add: [{ $ifNull: ['$totalCredit', 0] }, { $ifNull: ['$totalAdjust', 0] }] },
              ],
            },
          },
        },
        { $match: balanceFilter },
        { $sort: { name: 1 } },
        { $project: { statements: 0 } },
      ])
      .toArray();
    return result.map((r) => ({ ...r, id: r._id.toString() }));
  }

  async fetchStatementByParty(partyId, openingBalance = 0) {
    // 1. Fetch statements from DB, sorted by date (Ascending)
    const statements = await this.db
      .collection('partyStatement')
      .find({ partyId: new ObjectId(partyId), isHidden: { $ne: true } })
      .sort({ createdAt: 1 })
      .toArray();

    let currentBalance = openingBalance;

    // 2. Map data to match your 'headers' keys
    const formattedStatements = statements.map((stmt) => {
      const amount = stmt.amount || 0;
      const isDebit = stmt.entryType?.toUpperCase() === 'DEBIT';
      const isCredit = stmt.entryType?.toUpperCase() === 'CREDIT';
      const isAdjust = stmt.entryType?.toUpperCase() === 'ADJUST';

      // Calculate Debit/Credit columns
      const debit = isDebit ? amount : 0;
      const credit = isCredit || isAdjust ? amount : 0;

      // Update the running balance logic
      currentBalance = currentBalance + debit - credit;

      return {
        ...stmt,
        id: stmt._id.toString(),
        debit: debit, // Matches header key: 'debit'
        credit: credit, // Matches header key: 'credit'
        runningBalance: currentBalance, // Matches header key: 'runningBalance'
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

  async fetchBalanceByPartyId(partyId) {
    const pId = typeof partyId === 'string' ? new ObjectId(partyId) : partyId;
    const result = await this.db
      .collection('party')
      .aggregate([
        { $match: { _id: pId } },
        {
          $lookup: {
            from: 'partyStatement',
            let: { p_id: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: [{ $toString: '$partyId' }, { $toString: '$$p_id' }] },
                      { $ne: ['$isHidden', true] },
                    ],
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
                      { $eq: [{ $toUpper: '$$s.entryType' }, 'CREDIT'] },
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
                      { $eq: [{ $toUpper: '$$s.entryType' }, 'DEBIT'] },
                      { $ifNull: ['$$s.amount', 0] },
                      0,
                    ],
                  },
                },
              },
            },
            totalAdjust: {
              $sum: {
                $map: {
                  input: '$statements',
                  as: 's',
                  in: {
                    $cond: [
                      { $eq: [{ $toUpper: '$$s.entryType' }, 'ADJUST'] },
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
                { $add: [{ $ifNull: ['$totalCredit', 0] }, { $ifNull: ['$totalAdjust', 0] }] },
              ],
            },
          },
        },
        { $project: { statements: 0 } },
      ])
      .toArray();

    // Return the single object or null if not found
    if (result.length === 0) return null;
    const party = result[0];
    return { ...party, id: party._id.toString() };
  }

  async bulkUpdateCurrentBalanceToOpeningBalance() {
    // 1. Calculate the 'Settled' Balance for every party
    const partyBalances = await this.db
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
                    $and: [
                      { $eq: [{ $toString: '$partyId' }, { $toString: '$$p_id' }] },
                      { $ne: ['$isHidden', true] },
                    ],
                  },
                },
              },
            ],
            as: 'statements',
          },
        },
        {
          $addFields: {
            totalDebit: {
              $sum: {
                $map: {
                  input: '$statements',
                  as: 's',
                  in: {
                    $cond: [
                      { $eq: [{ $toUpper: '$$s.entryType' }, 'DEBIT'] },
                      { $ifNull: ['$$s.amount', 0] },
                      0,
                    ],
                  },
                },
              },
            },
            totalCredit: {
              $sum: {
                $map: {
                  input: '$statements',
                  as: 's',
                  in: {
                    $cond: [
                      { $eq: [{ $toUpper: '$$s.entryType' }, 'CREDIT'] },
                      { $ifNull: ['$$s.amount', 0] },
                      0,
                    ],
                  },
                },
              },
            },
            totalAdjust: {
              $sum: {
                $map: {
                  input: '$statements',
                  as: 's',
                  in: {
                    $cond: [
                      { $eq: [{ $toUpper: '$$s.entryType' }, 'ADJUST'] },
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
          $project: {
            _id: 1,
            newOpeningBalance: {
              $subtract: [
                { $add: [{ $ifNull: ['$openingBalance', 0] }, '$totalDebit'] },
                { $add: ['$totalCredit', '$totalAdjust'] },
              ],
            },
          },
        },
      ])
      .toArray();

    if (partyBalances.length === 0) return { message: 'No data to settle.' };

    // 2. Prepare Bulk Write for Party Collection
    const bulkOps = partyBalances.map((pb) => ({
      updateOne: {
        filter: { _id: pb._id },
        update: { $set: { openingBalance: pb.newOpeningBalance } },
      },
    }));

    // 3. Execute Updates
    const updateResult = await this.db.collection('party').bulkWrite(bulkOps);

    // 4. CLEAR the entire PartyStatement collection
    // Only do this if the update was successful to prevent data loss!
    // Step 4.1: Mark all as hidden
    if (updateResult.modifiedCount > 0 || updateResult.upsertedCount > 0) {
      await this.db.collection('partyStatement').updateMany({}, { $set: { isHidden: true } });
    }
    // Step 4.2: Delete only already-cleared ones
    await this.db.collection('partyStatement').deleteMany({ isHidden: true, isCleared: true });


    return {
      updatedParties: updateResult.modifiedCount,
      statementsCleared: true,
    };
  }
}
