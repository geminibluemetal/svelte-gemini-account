// src\lib\features\cash\CashListener.js

import { serverBus } from '$lib/core/server/serverBus';
import { EVENTS } from '$lib/core/server/serverBusEvents';
import { sseEmit } from '$lib/core/server/sseBus';
import CashService from './CashService';

const cashService = new CashService();

// Remove any existing listeners for this event to prevent duplicates
serverBus.removeAllListeners(EVENTS.CASH.SYNC_CASH_BY_ORDER_ID);

// find and update phone
serverBus.on(EVENTS.CASH.SYNC_CASH_BY_ORDER_ID, async (data) => {
  cashService.syncCashByOrderId(data);
  sseEmit({ type: 'CASH.LIST' });
});

console.log('✅ Cash listeners registered');
