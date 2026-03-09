// src\hooks.server.js
// Just importing listeners and they registering themself

import '$lib/features/party/PartyListener';
import '$lib/features/cashDescription/CashDescriptionListener';
import '$lib/features/cash/CashListener';
import '$lib/features/orders/OrderListener';
import '$lib/features/partyStatement/PartyStatementListener';

export async function handle({ event, resolve }) {
  const isAdmin = event.cookies.get('isAdmin') == 'true';
  event.locals.isAdmin = isAdmin;
  return await resolve(event);
}
