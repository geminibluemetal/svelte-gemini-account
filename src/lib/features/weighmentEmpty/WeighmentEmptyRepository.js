import BaseRepository from '../base/BaseRepository';
import WeighmentEmpty from './WeighmentEmptyModel';

export default class WeighmentRepository extends BaseRepository {
  constructor(db) {
    super(db, 'weighmentEmpty', WeighmentEmpty);
  }
}
