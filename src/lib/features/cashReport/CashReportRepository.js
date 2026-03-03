import BaseRepository from '../base/BaseRepository';
import CashReport from './CashReportModel';

export default class CashReportRepository extends BaseRepository {
  constructor(db) {
    super(db, 'cashReport', CashReport);
  }
}
