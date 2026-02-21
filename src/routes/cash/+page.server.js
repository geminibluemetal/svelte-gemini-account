import { sseEmit } from '$lib/core/server/sseBus.js';
import { createCash, deleteCash, getAllCash, getAllReports, signCash, updateCash } from '$lib/entity/cash/cash.service.js';
import { fetchAllCashDescription } from '$lib/entity/cash/cash_description.dal.js';
import { getAllDeliveryCash } from '$lib/entity/delivery/delivery.dal.js';
import { getAllParty } from '$lib/entity/party/party.service.js';
import { getAllOldBalanceCash } from '$lib/entity/party/party.statements.dal.js';
import { formatDateTime } from '$lib/utils/dateTime';
import { formDataToObject } from '$lib/utils/form';
import { fail } from '@sveltejs/kit';

export async function load({ depends, url }) {
  depends('CASH.LIST');

  const date = url.searchParams.get('date');
  let formattedDate = formatDateTime('YY-MM-DD');

  if (Date.parse(date)) {
    formattedDate = formatDateTime('YY-MM-DD', date);
  }

  const reports = await getAllReports(formattedDate);

  const directCash = await getAllCash(formattedDate);
  const deliveryCash = await getAllDeliveryCash(formattedDate);
  const oldBalanceCash = await getAllOldBalanceCash(formattedDate);

  const cashDescription = fetchAllCashDescription();
  const party = await getAllParty();

  const directCashIncome = directCash.filter(c => c.entry_type == 'INCOME');
  const directCashExpense = directCash.filter(c => c.entry_type == 'EXPENSE');
  return { income: [...directCashIncome, ...deliveryCash, ...oldBalanceCash], cashDescription, party, expense: directCashExpense, reports };
}

export const actions = {
  form: async ({ request }) => {
    const formData = await request.formData();
    const { editId, ...data } = formDataToObject(formData);
    let result
    if (editId) {
      result = await updateCash(data, editId);
    } else {
      result = await createCash(data);
    }

    if (!result?.ok) {
      return fail(400, { message: result.message });
    }

    sseEmit({ type: 'CASH.LIST' });
    return result;
  },

  sign: async ({ request }) => {
    const formData = await request.formData();
    const { id, current } = formDataToObject(formData);
    let result
    if (id) {
      result = await signCash(id, current);
    }

    if (!result?.ok) {
      return fail(400, { message: result.message });
    }

    sseEmit({ type: 'CASH.LIST' });
    return result;
  },

  delete: async ({ request }) => {
    const formData = await request.formData();
    const { id } = formDataToObject(formData);
    let result
    if (id) {
      result = await deleteCash(id);
    }

    if (!result?.ok) {
      return fail(400, { message: result.message });
    }

    sseEmit({ type: 'CASH.LIST' });
    return result;
  }
}
