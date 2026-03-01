// Just importing listeners and they registering themself

import '$lib/features/party/PartyListener';

export async function handle({ event, resolve }) {
  return await resolve(event);
}
