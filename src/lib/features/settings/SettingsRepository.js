import BaseRepository from '../base/BaseRepository';
import Settings from './SettingsModel';

export default class SettingsRepository extends BaseRepository {
  constructor(db) {
    super(db, 'settings', Settings);
  }
}
