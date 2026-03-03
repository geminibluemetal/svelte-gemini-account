import BaseRepository from '../base/BaseRepository';
import Token from '../token/TokenModel';
import Delivery from './DeliveryModel';

export default class DeliveryRepository extends BaseRepository {
  constructor(db, isToken = false) {
    super(db, 'delivery', isToken ? Token : Delivery);
  }

  async findCashDeliveryByDate(dateFilter) {
    const projection = {
      paymentAt: 1,
      amount: 1,
      description: 1,
      reference: 1,
      sign: 1,
    };
    const pipeline = [
      {
        $match: {
          ...dateFilter,
          $or: [{ amountType1: { $eq: 'CP' } }, { amountType2: { $eq: 'CP' } }],
        },
      },
      {
        $addFields: {
          amount: {
            $cond: {
              if: {
                $and: [{ $eq: ['$amountType1', 'CP'] }, { $eq: ['$amountType2', 'CP'] }],
              },
              then: { $add: ['$amount1', '$amount2'] },
              else: {
                $cond: {
                  if: { $eq: ['$amountType1', 'CP'] },
                  then: '$amount1',
                  else: '$amount2',
                },
              },
            },
          },
          description: {
            $cond: {
              if: {
                $and: [
                  { $ne: ['$partyName', null] },
                  { $ne: ['$partyName', ''] },
                  { $ne: ['$address', null] },
                  { $ne: ['$address', ''] },
                ],
              },
              then: { $concat: ['$partyName', ', ', '$address'] },
              else: {
                $cond: {
                  if: {
                    $and: [{ $ne: ['$partyName', null] }, { $ne: ['$partyName', ''] }],
                  },
                  then: '$partyName',
                  else: '$address',
                },
              },
            },
          },
          reference: {
            $concat: ['DS-', { $toString: '$serial' }],
          },
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
