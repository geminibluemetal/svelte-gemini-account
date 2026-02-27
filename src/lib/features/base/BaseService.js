// $lib/core/server/BaseService.js
import { connectDB } from '$lib/core/server/mongodb';

export default class BaseService {
  constructor(RepositoryClass) {
    this.RepositoryClass = RepositoryClass;
    this.repository = null;
    this.initPromise = null;
  }

  /**
   * Ensures the DB is connected and the Repository is instantiated.
   * Uses a single promise to prevent multiple connections during concurrent calls.
   */
  async getRepository() {
    if (this.repository) return this.repository;

    if (!this.initPromise) {
      this.initPromise = (async () => {
        const db = await connectDB();
        this.repository = new this.RepositoryClass(db);
        return this.repository;
      })();
    }

    return this.initPromise;
  }
}
