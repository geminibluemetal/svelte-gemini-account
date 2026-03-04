// src\lib\features\cashDescription\cashDescriptionListener.js

import { serverBus } from '$lib/core/server/serverBus';
import { EVENTS } from '$lib/core/server/serverBusEvents';
import CashDescriptionService from './CashDescriptionService';

const cashDescriptionService = new CashDescriptionService();

// find and update phone
serverBus.on(EVENTS.CASH_DESCRIPTION.CREATE_IF_NOT_EXISTS, async (data) => {
  cashDescriptionService.createIfNotExists(data.description);
});

console.log('✅ CashDescription listeners registered');
