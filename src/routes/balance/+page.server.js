import PartyStatementService from '$lib/features/partyStatement/PartyStatementService.js';
import { serializeDoc } from '$lib/utils/serializer.js';

export async function load({ depends, url }) {
  depends('BALANCE.LIST');
  const type = url.searchParams.get('type');
  const partyStatementService = new PartyStatementService();
  const balance = await partyStatementService.getBalance(type);
  return { balance: serializeDoc(balance) };
}
