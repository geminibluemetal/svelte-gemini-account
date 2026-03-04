import BaseRepository from '../base/BaseRepository';
import Order from './OrderModel';

export default class OrderRepository extends BaseRepository {
  constructor(db) {
    super(db, 'order', Order);
  }

  async paytmAdvanceByDate(date) {
    const dateFilter = this.getDateFilter(date, 'paymentAt');
    const pipeline = [
      {
        $match: {
          ...dateFilter,
          amountType: 'Paytm',
          advance: { $gt: 0 },
        },
      },
      {
        $project: {
          advance: 1,
          _id: 0,
        },
      },
    ];
    return await this.collection.aggregate(pipeline).toArray();
  }
}
