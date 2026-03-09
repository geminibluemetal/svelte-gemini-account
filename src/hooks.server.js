// src\hooks.server.js
// Just importing listeners and they registering themself

import '$lib/features/party/PartyListener';
import '$lib/features/cashDescription/CashDescriptionListener';
import '$lib/features/cash/CashListener';
import '$lib/features/orders/OrderListener';
import '$lib/features/partyStatement/PartyStatementListener';
import FingerprintService from '$lib/features/fingerprint/FingerprintService';

export async function handle({ event, resolve }) {
  const visitorId = event.cookies.get('visitorId');
  const fingerprintService = new FingerprintService();
  fingerprintService.entryFingerprint(visitorId)
  return await resolve(event);
}