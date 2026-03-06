// src\lib\features\partyStatement\partyStatementListener.js

import { serverBus } from '$lib/core/server/serverBus';
import { EVENTS } from '$lib/core/server/serverBusEvents';
import { sseEmit } from '$lib/core/server/sseBus';
import PartyStatementService from './PartyStatementService';

// Remove any existing listeners for this event to prevent duplicates
serverBus.removeAllListeners(EVENTS.PARTY_STATEMENT.UPDATE_PARTY_STATEMENT_BY_DELIVERY);

// find and update phone
serverBus.on(EVENTS.PARTY_STATEMENT.UPDATE_PARTY_STATEMENT_BY_DELIVERY, async (delivery) => {
  const partyStatementService = new PartyStatementService();
  await partyStatementService.updatePartyStatementFromDelivery(delivery);
  sseEmit({ type: 'BALANCE.LIST' });
});

console.log('✅ PartyStatement listeners registered');
