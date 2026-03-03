import BaseRepository from '../base/BaseRepository';
import Cash from './CashModel';

export default class CashRepository extends BaseRepository {
  constructor(db) {
    super(db, 'cash', Cash);
  }
}
