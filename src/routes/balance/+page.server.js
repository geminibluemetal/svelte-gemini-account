import { getAllBalance } from '$lib/entity/party/party.service.js';

export async function load({ depends, url }) {
  depends('BALANCE.LIST');
  const type = url.searchParams.get('type');
  const balance = await getAllBalance(type);
  return { balance };
}
