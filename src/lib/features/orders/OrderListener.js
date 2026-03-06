// src\lib\features\order\orderListener.js

import { serverBus } from '$lib/core/server/serverBus';
import { EVENTS } from '$lib/core/server/serverBusEvents';
import { sseEmit } from '$lib/core/server/sseBus';
import OrderService from './OrderService';

// Remove any existing listeners for this event to prevent duplicates
serverBus.removeAllListeners(EVENTS.ORDER.UPDATE_ORDER_BY_DELIVERY);

// find and update phone
serverBus.on(EVENTS.ORDER.UPDATE_ORDER_BY_DELIVERY, async ({ oldDelivery, newDelivery }) => {
  const orderService = new OrderService();
  await orderService.updateOrderDataFromOldDelivery(oldDelivery);
  await orderService.updateOrderDataFromNewDelivery(newDelivery);
  sseEmit({ type: 'ORDERS.LIST' });
});

console.log('✅ Order listeners registered');
