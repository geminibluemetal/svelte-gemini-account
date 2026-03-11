import BaseRepository from '../base/BaseRepository';
import Weighment from './WeighmentModel';

export default class WeighmentRepository extends BaseRepository {
  constructor(db) {
    super(db, 'weighment', Weighment);
  }
}
