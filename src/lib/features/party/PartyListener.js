// src\lib\features\party\partyListener.js

import { serverBus } from '$lib/core/server/serverBus';
import { EVENTS } from '$lib/core/server/serverBusEvents';
import { sseEmit } from '$lib/core/server/sseBus';
import PartyService from './PartyService';

// Remove any existing listeners for this event to prevent duplicates
serverBus.removeAllListeners(EVENTS.PARTY.FIND_AND_UPDATE_PHONE);

// find and update phone
serverBus.on(EVENTS.PARTY.FIND_AND_UPDATE_PHONE, async (data) => {
  const partyService = new PartyService();
  await partyService.findAndUpdatePhone(data.partyName, data.phone);
  sseEmit({ type: 'PARTY.LIST' });
});

console.log('✅ Party listeners registered');
