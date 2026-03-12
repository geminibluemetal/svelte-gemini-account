import { handleServiceError, schemaError } from '$lib/core/server/error';
import { connectDB } from '$lib/core/server/mongodb';
import WeighmentRepository from './WeighmentEmptyRepository';
import { weighmentEmptySchema } from './WeighmentEmptySchema';

const db = await connectDB();

export default class WeighmentEmptyService {
  constructor() {
    this.repository = new WeighmentRepository(db);
  }

  async weighmentEmptyList() {
    return await this.repository.findAll();
  }

  async saveEmptyWeight(data) {
    try {
      if (!Array.isArray(data)) {
        throw new Error('Invalid data format');
      }

      // remove empty rows
      const cleaned = data.filter(
        (item) => item.vehicle && item.emptyWeight !== undefined
      );

      const existing = await this.weighmentEmptyList();

      const existingMap = new Map(
        existing.map((item) => [item.vehicle, item])
      );

      const operations = [];

      for (const item of cleaned) {

        const parsed = weighmentEmptySchema.safeParse(item);
        if (!parsed.success) {
          schemaError(parsed);
        }

        const exist = existingMap.get(parsed.data.vehicle);

        if (exist) {
          operations.push(
            this.repository.updateById(exist.id, {
              ...parsed.data
            })
          );
        } else {
          operations.push(
            this.repository.create(parsed.data)
          );
        }
      }

      // detect deleted vehicles
      const incomingVehicles = new Set(cleaned.map((i) => i.vehicle));

      for (const item of existing) {
        if (!incomingVehicles.has(item.vehicle)) {
          operations.push(this.repository.deleteById(item.id));
        }
      }

      await Promise.all(operations);

      return { ok: true, message: 'Vehicle empty weights saved' };

    } catch (error) {
      return handleServiceError(error);
    }
  }
}