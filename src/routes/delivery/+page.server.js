import { sseEmit } from '$lib/core/server/sseBus.js';
import AddressService from '$lib/features/address/AddressService.js';
import CashService from '$lib/features/cash/CashService';
import CashReportService from '$lib/features/cashReport/CashReportService.js';
import DeliveryService from '$lib/features/delivery/DeliveryService.js';
import ItemService from '$lib/features/items/ItemService.js';
import OrderService from '$lib/features/orders/OrderService.js';
import PartyService from '$lib/features/party/PartyService.js';
import PartyStatementService from '$lib/features/partyStatement/PartyStatementService';
import { parseDate } from '$lib/utils/dateTimeParser';
import { formDataToObject } from '$lib/utils/form.js';
import { serializeDoc } from '$lib/utils/serializer.js';
import { fail } from '@sveltejs/kit';

export async function load({ depends, url }) {
  depends('DELIVERY.TOKEN.LIST');

  const date = url.searchParams.get('date');
  let formattedDate = date ? parseDate(date) : new Date();

  const deliveryService = new DeliveryService();
  const orderService = new OrderService();
  const addressService = new AddressService();
  const partyService = new PartyService();
  const itemService = new ItemService();
  const partyStatement = new PartyStatementService();

  // Make parllel fetching for better performance
  const [orders, address, token, party, item, oldBalance, paytmOrder] = await Promise.all([
    orderService.availableOrderList(),
    addressService.addressList(),
    deliveryService.deliveryList(formattedDate),
    partyService.partyList(),
    itemService.itemList(),
    partyStatement.getAllOldBalance(formattedDate),
    orderService.paytmAmountFromOrders(formattedDate),
  ]);
  return {
    token: serializeDoc(token),
    party: serializeDoc(party),
    item: serializeDoc(item),
    address: serializeDoc(address),
    orders: serializeDoc(orders),
    oldBalance: serializeDoc(oldBalance),
    paytmOrder,
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
  sign: async ({ request, locals }) => {
    if (!locals.isAdmin) return;
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

  // Revoke Delivery Entry
  revoke: async ({ request }) => {
    const formData = await request.formData();
    const data = formDataToObject(formData);
    const deliveryService = new DeliveryService();
    await deliveryService.revokeDelivery(data.id);
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
    const partyStatement = new PartyStatementService();
    if (editId) result = await partyStatement.updatePartyStatement(editId, data);
    else result = await partyStatement.createPartyStatement(data);

    if (!result?.ok) {
      return fail(400, { message: result.message });
    }

    sseEmit({ type: 'DELIVERY.TOKEN.LIST' });
    sseEmit({ type: 'BALANCE.LIST' });
    sseEmit({ type: 'CASH.LIST' });
    return result;
  },

  // Sign Old Balance
  oldBalanceSign: async ({ request, locals }) => {
    if (!locals.isAdmin) return;
    const formData = await request.formData();
    const data = formDataToObject(formData);
    const partyStatement = new PartyStatementService();
    await partyStatement.signPartyStatement(data.id);
    sseEmit({ type: 'DELIVERY.TOKEN.LIST' });
    sseEmit({ type: 'BALANCE.LIST' });
    sseEmit({ type: 'CASH.LIST' });
  },

  // Delete Old Balance
  oldBalanceDelete: async ({ request }) => {
    const formData = await request.formData();
    const data = formDataToObject(formData);
    const partyStatement = new PartyStatementService();
    await partyStatement.deletePartyStatement(data.id);
    sseEmit({ type: 'DELIVERY.TOKEN.LIST' });
    sseEmit({ type: 'BALANCE.LIST' });
    sseEmit({ type: 'CASH.LIST' });
  },

  // Overing Details
  deliveryOverRow: async ({ request }) => {
    const formData = await request.formData();
    const data = formDataToObject(formData);
    const result = {};

    if (data.orderNumber) {
      const orderNumber = Number(data.orderNumber);
      const orderService = new OrderService();
      result.order = await orderService.getOrderByNumber(orderNumber);
    }

    // if (data.deliveryId) {
    //   const partyStatementService = new PartyStatementService();
    //   result.statement = await partyStatementService.getPartyStatementByDeliveryId(data.deliveryId);
    // }

    return serializeDoc(result);
  },

  // Clear Delivery Sheet and Cash Repor by Date
  clearDelivery: async ({ request }) => {
    const formData = await request.formData();
    const { date } = formDataToObject(formData);
    let formattedDate = date ? parseDate(date) : new Date();

    const deliveryService = new DeliveryService();
    await deliveryService.clearDeliveryByDate(formattedDate);
    const cashService = new CashService();
    await cashService.clearCashByDate(formattedDate);
    const cashReportService = new CashReportService();
    await cashReportService.clearCashReportByDate(formattedDate);
    const orderService = new OrderService();
    await orderService.clearOrderForDelivery(formattedDate);
    const partyStatementService = new PartyStatementService();
    await partyStatementService.clearPartyStatementForDelivery(formattedDate);

    sseEmit({ type: 'DELIVERY.TOKEN.LIST' });
    sseEmit({ type: 'CASH.LIST' });
  },
};
