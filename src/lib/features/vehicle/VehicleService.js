import { handleServiceError, schemaError } from '$lib/core/server/error';
import { connectDB } from '$lib/core/server/mongodb';
import VehicleRepository from './VehicleRepository';
import { vehicleCreateSchema, vehicleUpdateSchema } from './VehicleSchema';

const db = await connectDB()
export default class VehicleService {
  constructor() {
    this.repository = new VehicleRepository(db);
  }

  async vehicleList() {
    return await this.repository.findAll({}, { shortNumber: 1, isCompanyVehicle: 1, _id: 1 });
  }

  async createVehicle(data) {
    try {
      const parsed = await vehicleCreateSchema.safeParseAsync(data);
      if (!parsed.success) {
        schemaError(parsed);
      }
      return await this.repository.create(parsed.data);
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async updateVehicle(id, data) {
    try {
      const parsed = await vehicleUpdateSchema.safeParseAsync({ ...data, id });
      if (!parsed.success) {
        schemaError(parsed);
      }
      return await this.repository.updateById(id, parsed.data);
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async deleteVehicle(id) {
    try {
      return await this.repository.deleteById(id);
    } catch (error) {
      return handleServiceError(error);
    }
  }
}
