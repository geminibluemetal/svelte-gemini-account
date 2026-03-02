import BaseRepository from '../base/BaseRepository';
import Token from '../token/TokenModel';
import Delivery from './DeliveryModel';

export default class DeliveryRepository extends BaseRepository {
  constructor(db, isToken = false) {
    super(db, 'delivery', isToken ? Token : Delivery);
  }
}
