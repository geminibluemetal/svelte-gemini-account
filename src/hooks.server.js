// src\hooks.server.js
// Just importing listeners and they registering themself

import '$lib/features/party/PartyListener';
import '$lib/features/cashDescription/CashDescriptionListener';
import '$lib/features/cash/CashListener';
import '$lib/features/orders/OrderListener';

export async function handle({ event, resolve }) {
  return await resolve(event);
}
