import { getAllBalance } from "$lib/entity/party/party.service.js"

export async function load({ depends }) {
  depends('BALANCE.LIST');
  const balance = await getAllBalance();
  return { balance };
}