import { sseEmit } from '$lib/core/server/sseBus.js';
import { getAllAddress } from '$lib/entity/address/address.service.js';
import { getAllItems } from '$lib/entity/items/items.service.js';
import {
  createOrder,
  createTokenFromOrder,
  deleteOrder,
  getAllOrders,
  orderFullPrint,
  orderPhonePrint,
  orderSinglePrint,
  signOrderById,
  updateOrder
} from '$lib/entity/orders/order.service.js';
import { getAllParty } from '$lib/entity/party/party.service.js';
import { getAllVehicle } from '$lib/entity/vehicle/vehicle.service.js';
import { formDataToObject } from '$lib/utils/form';
import { fail } from '@sveltejs/kit';

export async function load({ depends }) {
  depends('ORDERS.LIST');
  const orders = await getAllOrders();
  const party = await getAllParty();
  const address = await getAllAddress();
  const items = await getAllItems();
  const vehicle = await getAllVehicle();
  return { orders, party, address, items, vehicle };
}

export const actions = {
  // Create or Update
  form: async ({ request }) => {
    const formData = await request.formData();
    const { editId, ...data } = formDataToObject(formData);
    let result = null;

    if (editId) {
      result = await updateOrder(data, editId);
    } else {
      result = await createOrder(data);
    }

    if (!result?.ok) {
      return fail(400, { message: result.message });
    }

    sseEmit({ type: 'ORDERS.LIST' });
    return result;
  },

  // Delete
  delete: async ({ request }) => {
    const formData = await request.formData();
    const data = formDataToObject(formData);
    const result = await deleteOrder(data?.id);

    if (!result?.ok) {
      return fail(400, { message: result.message });
    }

    sseEmit({ type: 'ORDERS.LIST' });
    return result;
  },

  // Single Print
  singlePrint: async ({ request }) => {
    const formData = await request.formData();
    const data = formDataToObject(formData);
    orderSinglePrint(data);
  },

  // Full Print
  fullPrint: async ({ request }) => {
    const formData = await request.formData();
    const data = formDataToObject(formData);
    orderFullPrint(data);
  },

  // Phone Print
  phonePrint: async ({ request }) => {
    const formData = await request.formData();
    const data = formDataToObject(formData);
    orderPhonePrint(data);
  },

  // Sign Order
  sign: async ({ request }) => {
    const formData = await request.formData();
    const data = formDataToObject(formData);
    signOrderById(data.id, data.current);
    sseEmit({ type: 'ORDERS.LIST' });
  },

  // Create Token directly from Order
  orderToToken: async ({ request }) => {
    const formData = await request.formData();
    const data = formDataToObject(formData);
    const result = await createTokenFromOrder(data.id, data);
    if (!result?.ok) {
      return fail(400, { message: result.message });
    }

    sseEmit({ type: 'DELIVERY.TOKEN.LIST' });
    return result;
  }
};
