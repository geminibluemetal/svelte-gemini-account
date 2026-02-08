import { sseEmit } from '$lib/core/server/sseBus.js';
import { getAllAddress } from '$lib/entity/address/address.service.js';
import { getAllItems } from '$lib/entity/items/items.service.js';
import { getAllAvailableOrders } from '$lib/entity/orders/order.service.js';
import { getAllParty } from '$lib/entity/party/party.service.js';
import {
  createToken,
  deleteToken,
  getAllToken,
  printTokenById,
  updateToken
} from '$lib/entity/token/token.service.js';
import { getAllVehicle } from '$lib/entity/vehicle/vehicle.service.js';
import { formDataToObject } from '$lib/utils/form.js';
import { fail } from '@sveltejs/kit';

export async function load({ depends }) {
  depends('TOKEN.LIST');
  const orders = await getAllAvailableOrders();
  const address = await getAllAddress();
  const token = await getAllToken();
  const party = await getAllParty();
  const vehicle = await getAllVehicle();
  const item = await getAllItems();
  return { token, party, vehicle, item, address, orders };
}

export const actions = {
  // Create or Update
  form: async ({ request }) => {
    const formData = await request.formData();
    const { editId, ...data } = formDataToObject(formData);
    let result = null;

    if (editId) {
      result = await updateToken(data, editId);
    } else {
      result = await createToken(data);
    }

    if (!result?.ok) {
      return fail(400, { message: result.message });
    }

    sseEmit({ type: 'TOKEN.LIST' });
    return result;
  },

  // Delete
  delete: async ({ request }) => {
    const formData = await request.formData();
    const data = formDataToObject(formData);
    const result = await deleteToken(data?.id);

    if (!result?.ok) {
      return fail(400, { message: result.message });
    }

    sseEmit({ type: 'TOKEN.LIST' });
    return result;
  },

  // Print
  print: async ({ request }) => {
    const formData = await request.formData();
    const data = formDataToObject(formData);
    printTokenById(data?.id);
  }
};
