import { error } from '@sveltejs/kit'
import PartyStatementService from '$lib/features/partyStatement/PartyStatementService.js';
import { ObjectId } from 'mongodb';
import PartyService from '$lib/features/party/PartyService.js';
import { serializeDoc } from '$lib/utils/serializer.js';
import { formDataToObject } from '$lib/utils/form';
import { sseEmit } from '$lib/core/server/sseBus';

export async function load({ depends, params }) {
  depends('BALANCE.LIST');
  const { partyId } = params;
  if (!ObjectId.isValid(partyId)) {
    throw error(404, 'Party not found');
  }

  const partyStatement = new PartyStatementService()
  const partyService = new PartyService();
  const party = await partyService.getPartyById(partyId);
  const statement = await partyStatement.getStatementByParty(partyId, party.openingBalance);
  return {
    statement: serializeDoc(statement),
    party: serializeDoc(party),
  };
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

  adjustment: async ({ request }) => {
    const formData = await request.formData();
    const data = formDataToObject(formData);
    const partyStatmentService = new PartyStatementService()
    const result = await partyStatmentService.createPartyStatement(data)
    sseEmit({ type: 'BALANCE.LIST' });
    return result
  },

  amountEdit: async ({ request }) => {
    const formData = await request.formData();
    const { editId, ...data } = formDataToObject(formData);
    data.amount = Number(data.amount)
    if (isNaN(data.amount)) data.amount = 0
    const partyStatmentService = new PartyStatementService()
    const result = await partyStatmentService.updateStatementAmount(editId, data)
    sseEmit({ type: 'BALANCE.LIST' });
    return result
  }
}