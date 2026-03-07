import { error } from '@sveltejs/kit'
import PartyStatementService from '$lib/features/partyStatement/PartyStatementService.js';
import { ObjectId } from 'mongodb';
import PartyService from '$lib/features/party/PartyService.js';
import { serializeDoc } from '$lib/utils/serializer.js';

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
