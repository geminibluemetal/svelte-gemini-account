import { handleServiceError, schemaError } from '$lib/core/server/error';
import BaseService from '../base/BaseService';
import VehicleRepository from './VehicleRepository';
import { vehicleSchema } from './VehicleSchema';

export default class VehicleService extends BaseService {
  constructor() {
    super(VehicleRepository);
  }

  async vehicleList() {
    const repo = await this.getRepository();
    return await repo.findAll();
  }

  async createVehicle(data) {
    try {
      const repo = await this.getRepository();
      const parsed = await vehicleSchema.safeParseAsync(data);
      if (!parsed.success) {
        schemaError(parsed);
      }
      return await repo.create(parsed.data);
    } catch (error) {
      return handleServiceError(error);
    }
  }
}
