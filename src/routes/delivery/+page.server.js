import { sseEmit } from '$lib/core/server/sseBus.js';
import {
  createOldBalance,
  deleteOldBalance,
  signOldBalanceById,
  updateOldBalance,
} from '$lib/entity/party/party.service.js';
import AddressService from '$lib/features/address/AddressService.js';
import DeliveryService from '$lib/features/delivery/DeliveryService.js';
import ItemService from '$lib/features/items/ItemService.js';
import OrderService from '$lib/features/orders/OrderService.js';
import PartyService from '$lib/features/party/PartyService.js';
import { formatDateTime } from '$lib/utils/dateTime.js';
import { formDataToObject } from '$lib/utils/form.js';
import { serializeDoc } from '$lib/utils/serializer.js';
import { fail } from '@sveltejs/kit';

export async function load({ depends, url }) {
  depends('DELIVERY.TOKEN.LIST');

  const date = url.searchParams.get('date');
  let formattedDate = formatDateTime('YY-MM-DD');

  if (Date.parse(date)) {
    formattedDate = formatDateTime('YY-MM-DD', date);
  }

  const deliveryService = new DeliveryService();
  const orderService = new OrderService();
  const addressService = new AddressService();
  const partyService = new PartyService();
  const itemService = new ItemService();

  const orders = await orderService.orderList();
  const address = await addressService.addressList();
  const token = await deliveryService.deliveryList(formattedDate);
  const party = await partyService.partyList();
  const item = await itemService.itemList();
  // const oldBalance = await getAllOldBalance(formattedDate);
  const oldBalance = [];
  return {
    token: serializeDoc(token),
    party: serializeDoc(party),
    item: serializeDoc(item),
    address: serializeDoc(address),
    orders: serializeDoc(orders),
    oldBalance: serializeDoc(oldBalance),
  };
}

export const actions = {
  // Delivery Entry
  form: async ({ request }) => {
    const formData = await request.formData();
    const { editId, ...data } = formDataToObject(formData);
    const deliveryService = new DeliveryService();
    const result = await deliveryService.deliveryEntry(editId, data);
    if (!result?.ok) {
      return fail(400, { message: result.message });
    }

    sseEmit({ type: 'DELIVERY.TOKEN.LIST' });
    sseEmit({ type: 'ORDERS.LIST' });
    sseEmit({ type: 'CASH.LIST' });
    sseEmit({ type: 'BALANCE.LIST' });
    return result;
  },

  // Update Amounts
  amountUpdate: async ({ request }) => {
    const formData = await request.formData();
    const { editId, ...data } = formDataToObject(formData);
    const deliveryService = new DeliveryService();
    const result = await deliveryService.amountEntry(editId, data);

    if (!result?.ok) {
      return fail(400, { message: result.message });
    }

    sseEmit({ type: 'DELIVERY.TOKEN.LIST' });
    sseEmit({ type: 'CASH.LIST' });
    sseEmit({ type: 'BALANCE.LIST' });
    return result;
  },

  // Sign Delivery Sheet
  sign: async ({ request }) => {
    const formData = await request.formData();
    const data = formDataToObject(formData);
    const deliveryService = new DeliveryService();
    await deliveryService.signDelivery(data.id);
    sseEmit({ type: 'DELIVERY.TOKEN.LIST' });
    sseEmit({ type: 'ORDERS.LIST' });
    sseEmit({ type: 'CASH.LIST' });
    sseEmit({ type: 'BALANCE.LIST' });
  },

  // Mark Delivery Entry
  mark: async ({ request }) => {
    const formData = await request.formData();
    const data = formDataToObject(formData);
    const deliveryService = new DeliveryService();
    await deliveryService.markDelivery(data.id);
    sseEmit({ type: 'DELIVERY.TOKEN.LIST' });
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
    sseEmit({ type: 'CASH.LIST' });
    return result;
  },

  // Sign Old Balance
  oldBalanceSign: async ({ request }) => {
    const formData = await request.formData();
    const data = formDataToObject(formData);
    signOldBalanceById(data.id, data.current);
    sseEmit({ type: 'DELIVERY.TOKEN.LIST' });
    sseEmit({ type: 'BALANCE.LIST' });
    sseEmit({ type: 'CASH.LIST' });
  },

  // Delete Old Balance
  oldBalanceDelete: async ({ request }) => {
    const formData = await request.formData();
    const data = formDataToObject(formData);
    deleteOldBalance(data.id);
    sseEmit({ type: 'DELIVERY.TOKEN.LIST' });
    sseEmit({ type: 'BALANCE.LIST' });
    sseEmit({ type: 'CASH.LIST' });
  },
};
