import { handleServiceError, handleSuccess, schemaError } from '$lib/core/server/error';
import { connectDB } from '$lib/core/server/mongodb';
import AddressRepository from './AddressRepository';
import { addressCreateSchema, addressUpdateSchema } from './AddressSchema';

const db = await connectDB()
export default class AddressService {
  constructor() {
    this.repository = new AddressRepository(db);
  }

  async addressList() {
    return await this.repository.findAll({}, { name: 1, deliveryCharges: 1, _id: 1 });
  }

  async createAddress(data) {
    try {
      const parsed = await addressCreateSchema.safeParseAsync(data);
      if (!parsed.success) {
        schemaError(parsed);
      }
      return await this.repository.create(parsed.data);
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async updateAddress(id, data) {
    try {
      const parsed = await addressUpdateSchema.safeParseAsync({ ...data, id });
      if (!parsed.success) {
        schemaError(parsed);
      }
      return await this.repository.updateById(id, parsed.data);
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async deleteAddress(id) {
    try {
      return await this.repository.deleteById(id);
    } catch (error) {
      return handleServiceError(error);
    }
  }

  async checkAddressHasDeliveryCharge(address, quantity) {
    try {
      const addressData = await this.repository.findOne({ name: address });
      if (!addressData) throw new Error('Address not found');

      let checkingCharge = ''
      if (quantity < 0.5) checkingCharge = 'chargeHalf';
      else if (quantity <= 1) checkingCharge = 'chargeSingle';
      else checkingCharge = 'chargeMax';

      const charge = addressData.deliveryCharges[checkingCharge] > 0;
      return handleSuccess('Address has delivery charge', { hasCharge: charge });
    } catch (error) {
      return handleServiceError(error);
    }
  }
}
