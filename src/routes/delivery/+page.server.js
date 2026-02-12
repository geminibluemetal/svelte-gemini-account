import { sseEmit } from '$lib/core/server/sseBus.js';
import { getAllAddress } from '$lib/entity/address/address.service.js';
import {
  signDeliveryById,
  updateDelivery,
  updateDeliveryAmount
} from '$lib/entity/delivery/delivery.service.js';
import { getAllItems } from '$lib/entity/items/items.service.js';
import { getAllAvailableOrders } from '$lib/entity/orders/order.service.js';
import {
  createOldBalance,
  getAllOldBalance,
  getAllParty,
  updateOldBalance
} from '$lib/entity/party/party.service.js';
import { getAllToken } from '$lib/entity/token/token.service.js';
import { getAllVehicle } from '$lib/entity/vehicle/vehicle.service.js';
import { formatDateTime } from '$lib/utils/dateTime.js';
import { formDataToObject } from '$lib/utils/form.js';
import { fail } from '@sveltejs/kit';

export async function load({ depends, url }) {
  depends('DELIVERY.TOKEN.LIST');

  const date = url.searchParams.get('date');
  let formattedDate = formatDateTime('YY-MM-DD');

  if (Date.parse(date)) {
    formattedDate = formatDateTime('YY-MM-DD', date);
  }

  const orders = await getAllAvailableOrders();
  const address = await getAllAddress();
  const token = await getAllToken(formattedDate);
  const party = await getAllParty();
  const vehicle = await getAllVehicle();
  const item = await getAllItems();
  const oldBalance = await getAllOldBalance(formattedDate);
  return { token, party, vehicle, item, address, orders, oldBalance };
}

export const actions = {
  // Delivery Entry
  form: async ({ request }) => {
    const formData = await request.formData();
    const { editId, ...data } = formDataToObject(formData);
    const result = await updateDelivery(data, editId);

    if (!result?.ok) {
      return fail(400, { message: result.message });
    }

    sseEmit({ type: 'DELIVERY.TOKEN.LIST' });
    sseEmit({ type: 'ORDERS.LIST' });
    return result;
  },

  // Update Amounts
  amountUpdate: async ({ request }) => {
    const formData = await request.formData();
    const { editId, ...data } = formDataToObject(formData);
    const result = await updateDeliveryAmount(data, editId);

    if (!result?.ok) {
      return fail(400, { message: result.message });
    }

    sseEmit({ type: 'DELIVERY.TOKEN.LIST' });
    return result;
  },

  // Sing Delivery Sheet
  sign: async ({ request }) => {
    const formData = await request.formData();
    const data = formDataToObject(formData);
    signDeliveryById(data.id, data.current);
    sseEmit({ type: 'DELIVERY.TOKEN.LIST' });
    sseEmit({ type: 'ORDERS.LIST' });
  },

  // Full Delete
  fullDelete: async ({ request }) => {
    const formData = await request.formData();
    const data = formDataToObject(formData);
    console.log('Full Delete Delivery SHeet By Date Pending', data);
    // sseEmit({ type: 'DELIVERY.TOKEN.LIST' });
    // sseEmit({ type: 'ORDERS.LIST' });
  },

  // Old Balance
  oldBalance: async ({ request }) => {
    const formData = await request.formData();
    const { editId, ...data } = formDataToObject(formData);
    let result = null;
    if (editId) result = await updateOldBalance(data, editId);
    else result = await createOldBalance(data);

    if (!result?.ok) {
      return fail(400, { message: result.message });
    }

    sseEmit({ type: 'DELIVERY.TOKEN.LIST' });
    sseEmit({ type: 'BALANCE.LIST' });
    return result;
  }
};
