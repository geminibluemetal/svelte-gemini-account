import BaseRepository from '../base/BaseRepository';
import PartyStatement from './PartyStatementModel';

export default class PartyStatementRepository extends BaseRepository {
  constructor(db) {
    super(db, 'partyStatement', PartyStatement);
  }

  async findAllOldBalance(date) {
    const dateFilter = this.getDateFilter(date, 'createdAt');
    const pipeline = [
      {
        $match: dateFilter,
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
}
