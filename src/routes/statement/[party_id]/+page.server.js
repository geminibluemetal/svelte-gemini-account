import { getPartyStatement, getSingleParty } from '$lib/entity/party/party.service.js';

export async function load({ depends, params }) {
  depends('BALANCE.LIST');
  const { party_id } = params;
  const statement = await getPartyStatement(party_id);
  const party = await getSingleParty(party_id);
  return {
    statement,
    party,
  };
}
