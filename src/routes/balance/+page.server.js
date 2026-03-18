import { handleServiceError } from '$lib/core/server/error.js';
import { sseEmit } from '$lib/core/server/sseBus.js';
import PartyService from '$lib/features/party/PartyService.js';
import PartyStatementService from '$lib/features/partyStatement/PartyStatementService.js';
import { formDataToObject } from '$lib/utils/form.js';
import { serializeDoc } from '$lib/utils/serializer.js';

export async function load({ depends, url, locals }) {
  depends('BALANCE.LIST');
  const type = url.searchParams.get('type');
  const partyStatementService = new PartyStatementService();
  const balance = await partyStatementService.getBalance(type);
  return { balance: serializeDoc(balance), isAdmin: locals.isAdmin };
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

  bulkBalanceResetForAll: async ({ locals }) => {
    if (locals.isAdmin) {
      const partyStatementService = new PartyStatementService();
      const result = await partyStatementService.resetBalanceForAllParty()
      sseEmit({ type: 'BALANCE.LIST' });
      return result
    } else {
      return handleServiceError('Admin only can reset')
    }
  }
}