import { handleServiceError, schemaError } from '$lib/core/server/error';
import BaseService from '../base/BaseService';
import VehicleRepository from './VehicleRepository';
import { vehicleCreateSchema, vehicleUpdateSchema } from './VehicleSchema';

export default class VehicleService extends BaseService {
  constructor() {
    super(VehicleRepository);
  }

  async vehicleList() {
    const repo = await this.getRepository();
    return await repo.findAll({}, { shortNumber: 1, isCompanyVehicle: 1, _id: 1 });
  }

  async createVehicle(data) {
    try {
      const repo = await this.getRepository();
      const parsed = await vehicleCreateSchema.safeParseAsync(data);
      if (!parsed.success) {
        schemaError(parsed);
      }
      return await repo.create(parsed.data);
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async updateVehicle(id, data) {
    try {
      const repo = await this.getRepository();
      const parsed = await vehicleUpdateSchema.safeParseAsync(data);
      if (!parsed.success) {
        schemaError(parsed);
      }
      return await repo.updateById(id, parsed.data);
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async deleteVehicle(id) {
    try {
      const repo = await this.getRepository();
      return await repo.deleteById(id);
    } catch (error) {
      return handleServiceError(error);
    }
  }
}
