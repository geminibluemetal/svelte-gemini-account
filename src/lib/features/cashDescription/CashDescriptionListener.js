// src\lib\features\cashDescription\cashDescriptionListener.js

import { serverBus } from '$lib/core/server/serverBus';
import { EVENTS } from '$lib/core/server/serverBusEvents';
import CashDescriptionService from './CashDescriptionService';

// Remove any existing listeners for this event to prevent duplicates
serverBus.removeAllListeners(EVENTS.CASH_DESCRIPTION.CREATE_IF_NOT_EXISTS);

// find and update phone
serverBus.on(EVENTS.CASH_DESCRIPTION.CREATE_IF_NOT_EXISTS, async (data) => {
  const cashDescriptionService = new CashDescriptionService();
  cashDescriptionService.createIfNotExists(data.description);
});

console.log('✅ CashDescription listeners registered');
