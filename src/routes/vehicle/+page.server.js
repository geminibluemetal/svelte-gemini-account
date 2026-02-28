import { sseEmit } from '$lib/core/server/sseBus.js';
import VehicleService from '$lib/features/vehicle/VehicleService.js';
import { formDataToObject } from '$lib/utils/form.js';
import { serializeDoc } from '$lib/utils/serializer.js';
import { fail } from '@sveltejs/kit';

export async function load({ depends }) {
  depends('VEHICLE.LIST');
  const vehicleService = new VehicleService();
  const vehicle = await vehicleService.vehicleList();
  return { vehicle: serializeDoc(vehicle) };
}

export const actions = {
  // Create or Update
  form: async ({ request }) => {
    const formData = await request.formData();
    const { editId, ...data } = formDataToObject(formData);
    let result = null;
    const vehicleService = new VehicleService();
    if (editId) {
      result = await vehicleService.updateVehicle(editId, data);
    } else {
      result = await vehicleService.createVehicle(data);
    }

    if (!result?.ok) {
      return fail(400, { message: result.message });
    }

    sseEmit({ type: 'VEHICLE.LIST' });
    return result;
  },

  // Delete
  delete: async ({ request }) => {
    const formData = await request.formData();
    const data = formDataToObject(formData);
    const vehicleService = new VehicleService();
    const result = await vehicleService.deleteVehicle(data.id);

    if (!result?.ok) {
      return fail(400, { message: result.message });
    }

    sseEmit({ type: 'VEHICLE.LIST' });
    return result;
  },
};
