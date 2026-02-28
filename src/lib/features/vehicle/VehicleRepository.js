import BaseRepository from '../base/BaseRepository';
import Vehicle from './VehicleModel';

export default class VehicleRepository extends BaseRepository {
  constructor(db) {
    super(db, 'vehicle', Vehicle);
  }
}
