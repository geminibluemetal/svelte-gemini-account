import { sseEmit } from '$lib/core/server/sseBus.js';
import PartyService from '$lib/features/party/PartyService.js';
import PartyStatementService from '$lib/features/partyStatement/PartyStatementService.js';
import { formDataToObject } from '$lib/utils/form.js';
import { serializeDoc } from '$lib/utils/serializer.js';

export async function load({ depends, url }) {
  depends('BALANCE.LIST');
  const type = url.searchParams.get('type');
  const partyStatementService = new PartyStatementService();
  const balance = await partyStatementService.getBalance(type);
  return { balance: serializeDoc(balance) };
}

export const actions = {
  balanceReset: async ({ request }) => {
    const formData = await request.formData();
    const { id } = formDataToObject(formData);
    const partyService = new PartyService()
    const updateResult = await partyService.resetBalance(id)
    sseEmit({ type: 'BALANCE.LIST' });
    return updateResult
  },

  balanceNil: async ({ request }) => {
    const formData = await request.formData();
    const { id } = formDataToObject(formData);
    const partyService = new PartyService()
    const updateResult = await partyService.nilBalance(id)
    sseEmit({ type: 'BALANCE.LIST' });
    return updateResult
  },
}