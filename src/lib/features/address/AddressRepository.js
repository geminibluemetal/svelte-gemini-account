import BaseRepository from '../base/BaseRepository';
import Address from './AddressModel';

export default class AddressRepository extends BaseRepository {
  constructor(db) {
    super(db, 'address', Address);
  }
}
