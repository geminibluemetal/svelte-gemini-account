import { handleServiceError } from '$lib/core/server/error';
import { connectDB } from '$lib/core/server/mongodb';
import FingerprintRepository from './FingerprintRepository';

const db = await connectDB()
export default class FingerprintService {
  constructor() {
    this.repository = new FingerprintRepository(db);
  }

  async fingerprintList() {
    return await this.repository.findAll({}, { shortNumber: 1, isCompanyFingerprint: 1, _id: 1 });
  }

  async getSingleFingerprint(fingerprint) {
    return await this.repository.findOne({ fingerprint });
  }

  async entryFingerprint(fingerprint) {
    const fingerprintResult = await this.getSingleFingerprint(fingerprint)
    if (fingerprintResult) {
      const data = {
        fingerprint,
      }
    }
  }

  async deleteFingerprint(id) {
    try {
      return await this.repository.deleteById(id);
    } catch (error) {
      return handleServiceError(error);
    }
  }
}
