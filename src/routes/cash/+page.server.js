import { getAllCash } from '$lib/entity/cash/cash.service.js';
import { getAllDeliveryCash } from '$lib/entity/delivery/delivery.dal.js';
import { getAllOldBalanceCash } from '$lib/entity/party/party.statements.dal.js';
import { formatDateTime } from '$lib/utils/dateTime';

export async function load({ depends, url }) {
  depends('CASH.LIST');

  const date = url.searchParams.get('date');
  let formattedDate = formatDateTime('YY-MM-DD');

  if (Date.parse(date)) {
    formattedDate = formatDateTime('YY-MM-DD', date);
  }

  const directCash = await getAllCash(formattedDate);
  const deliveryCash = await getAllDeliveryCash(formattedDate);
  const oldBalanceCash = await getAllOldBalanceCash(formattedDate);
  return { income: [...directCash, ...deliveryCash, ...oldBalanceCash] };
}