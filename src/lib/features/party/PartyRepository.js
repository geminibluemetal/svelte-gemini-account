import BaseRepository from '../base/BaseRepository';
import Party from './PartyModel';

export default class PartyRepository extends BaseRepository {
  constructor(db) {
    super(db, 'party', Party);
  }
}
