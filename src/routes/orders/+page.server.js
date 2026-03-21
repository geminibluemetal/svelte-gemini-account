import { sseEmit } from '$lib/core/server/sseBus.js';
import AddressService from '$lib/features/address/AddressService';
import OrderService from '$lib/features/orders/OrderService.js';
import ItemService from '$lib/features/items/ItemService';
import PartyService from '$lib/features/party/PartyService';
import VehicleService from '$lib/features/vehicle/VehicleService';
import { formDataToObject } from '$lib/utils/form';
import { serializeDoc } from '$lib/utils/serializer.js';
import { fail } from '@sveltejs/kit';

export async function load({ depends }) {
  depends('ORDERS.LIST');
  const orderService = new OrderService();
  const addressService = new AddressService();
  const itemService = new ItemService();
  const partyService = new PartyService();
  const vehicleService = new VehicleService();
  const orders = await orderService.orderList();
  const address = await addressService.addressList();
  const items = await itemService.itemList();
  const party = await partyService.partyList();
  const vehicle = await vehicleService.vehicleList();
  return {
    orders: serializeDoc(orders),
    party: serializeDoc(party),
    address: serializeDoc(address),
    items: serializeDoc(items),
    vehicle: serializeDoc(vehicle),
  };
}

export const actions = {
  // Create or Update
  form: async ({ request }) => {
    const formData = await request.formData();
    const { editId, ...data } = formDataToObject(formData);
    let result = null;
    const orderService = new OrderService();

    if (editId) {
      result = await orderService.updateOrder(editId, data);
    } else {
      result = await orderService.createOrder(data);
    }

    if (!result?.ok) {
      return fail(400, { message: result.message });
    }

    sseEmit({ type: 'DELIVERY.TOKEN.LIST' });
    sseEmit({ type: 'ORDERS.LIST' });
    sseEmit({ type: 'CASH.LIST' });
    return result;
  },

  // Delete
  delete: async ({ request }) => {
    const formData = await request.formData();
    const data = formDataToObject(formData);
    const orderService = new OrderService();
    const result = await orderService.deleteOrder(data?.id);

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
    const orderService = new OrderService();
    orderService.singlePrint(data);
  },

  // Full Print
  fullPrint: async ({ request }) => {
    const formData = await request.formData();
    const data = formDataToObject(formData);
    const orderService = new OrderService();
    orderService.fullPrint(data);
  },

  // Phone Print
  phonePrint: async ({ request }) => {
    const formData = await request.formData();
    const data = formDataToObject(formData);
    const orderService = new OrderService();
    orderService.phonePrint(data);
  },

  // Sign Order
  sign: async ({ request, locals }) => {
    if (!locals.isAdmin) return;
    const formData = await request.formData();
    const data = formDataToObject(formData);
    const orderService = new OrderService();
    orderService.signOrder(data.id);
    sseEmit({ type: 'ORDERS.LIST' });
    sseEmit({ type: 'CASH.LIST' });
  },

  // change Order status To Loading
  changeToLoading: async ({ request }) => {
    const formData = await request.formData();
    const data = formDataToObject(formData);
    const orderService = new OrderService();
    orderService.changeStatus(data.id, 'Loading');
    sseEmit({ type: 'ORDERS.LIST' });
  },
  // change Order status To Cancelled
  changeToCancelled: async ({ request }) => {
    const formData = await request.formData();
    const data = formDataToObject(formData);
    const orderService = new OrderService();
    orderService.changeStatus(data.id, 'Cancelled');
    sseEmit({ type: 'ORDERS.LIST' });
  },
  // change Order status To Finished
  changeToFinished: async ({ request }) => {
    const formData = await request.formData();
    const data = formDataToObject(formData);
    const orderService = new OrderService();
    orderService.changeStatus(data.id, 'Finished');
    sseEmit({ type: 'ORDERS.LIST' });
  },
  // Reset order status
  resetStatus: async ({ request }) => {
    const formData = await request.formData();
    const data = formDataToObject(formData);
    const orderService = new OrderService();
    orderService.resetStatus(data.id);
    sseEmit({ type: 'ORDERS.LIST' });
  },

  // Create Token directly from Order
  orderToToken: async ({ request }) => {
    const formData = await request.formData();
    const data = formDataToObject(formData);
    const orderService = new OrderService();
    const result = await orderService.generateToken(data.id, data);
    if (!result?.ok) {
      return fail(400, { message: 'Error in Quick Token' });
    }

    sseEmit({ type: 'ORDERS.LIST' });
    sseEmit({ type: 'DELIVERY.TOKEN.LIST' });
    return { ok: true, message: 'Token Created' };
  },

  // Clear Orders
  clearOrder: async () => {
    const orderService = new OrderService();
    const result = await orderService.clearCompletedOrder();
    if (!result?.ok) {
      return fail(400, { message: result.message });
    }

    sseEmit({ type: 'ORDERS.LIST' });
    sseEmit({ type: 'DELIVERY.TOKEN.LIST' });
    return result;
  },
};
