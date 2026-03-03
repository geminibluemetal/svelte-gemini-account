import BaseRepository from '../base/BaseRepository';
import CashDescription from './CashDescriptionModel';

export default class CashDescriptionRepository extends BaseRepository {
  constructor(db) {
    super(db, 'cashDescription', CashDescription);
  }
}
