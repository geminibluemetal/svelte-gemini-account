import AppError from '$lib/core/server/error';
import { connectDB } from '$lib/core/server/mongodb';
import VehicleRepository from './VehicleRepository'; // Fixed typo
import { vehicleSchema } from './VehicleSchema';

export default class VehicleService {
  constructor() {
    this.repository = null;
  }

  // Ensure DB and Repo are ready without blocking every call
  async getRepository() {
    if (!this.repository) {
      const db = await connectDB();
      this.repository = new VehicleRepository(db);
    }
    return this.repository;
  }

  async createVehicle(data) {
    const repo = await this.getRepository();

    // Validate data
    const parsed = vehicleSchema.safeParse(data);
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0].message, 400);
    }
    return await repo.create(parsed.data);
  }
}
