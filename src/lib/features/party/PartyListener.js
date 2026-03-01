// src\lib\features\party\partyListener.js

import { serverBus } from '$lib/core/server/serverBus';
import { EVENTS } from '$lib/core/server/serverBusEvents';
import PartyService from './PartyService';

const partyService = new PartyService();

// find and update phone
serverBus.on(EVENTS.PARTY.FIND_AND_UPDATE_PHONE, async (data) => {
  partyService.findAndUpdatePhone(data.partyName, data.phone);
});

console.log('✅ Party listeners registered');
