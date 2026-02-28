import BaseRepository from '../base/BaseRepository';
import Order from './OrderModel';

export default class OrderRepository extends BaseRepository {
  constructor(db) {
    super(db, 'order', Order);
  }
}
