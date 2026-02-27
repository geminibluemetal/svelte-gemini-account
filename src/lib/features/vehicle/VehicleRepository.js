import BaseRepository from '../base/BaseRepository';
import VehicleModel from './VehicleModel';

export default class VehicleRepository extends BaseRepository {
  constructor(db) {
    super(db, 'vehicle', VehicleModel);
  }
}
