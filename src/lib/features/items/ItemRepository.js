import BaseRepository from '../base/BaseRepository';
import Item from './ItemModel';

export default class VehicleRepository extends BaseRepository {
  constructor(db) {
    super(db, 'items', Item);
  }
}
