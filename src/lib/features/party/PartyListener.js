// src\lib\features\party\partyListener.js

import { serverBus } from '$lib/core/server/serverBus';
import { EVENTS } from '$lib/core/server/serverBusEvents';
import PartyService from './PartyService';

// Remove any existing listeners for this event to prevent duplicates
serverBus.removeAllListeners(EVENTS.PARTY.FIND_AND_UPDATE_PHONE);

// find and update phone
serverBus.on(EVENTS.PARTY.FIND_AND_UPDATE_PHONE, async (data) => {
  const partyService = new PartyService();
  partyService.findAndUpdatePhone(data.partyName, data.phone);
});

console.log('✅ Party listeners registered');
