import BaseRepository from '../base/BaseRepository';
import Fingerprint from './FingerprintModel';

export default class FingerprintRepository extends BaseRepository {
  constructor(db) {
    super(db, 'fingerprint', Fingerprint);
  }
}
