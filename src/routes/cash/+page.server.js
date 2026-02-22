import { sseEmit } from '$lib/core/server/sseBus.js';
import { createCash, createNewCashReport, deleteCash, deleteCashReport, getAllCash, getAllReports, signCash, updateCash } from '$lib/entity/cash/cash.service.js';
import { fetchAllCashDescription } from '$lib/entity/cash/cash_description.dal.js';
import { getAllDeliveryCash } from '$lib/entity/delivery/delivery.dal.js';
import { getAllParty } from '$lib/entity/party/party.service.js';
import { getAllOldBalanceCash } from '$lib/entity/party/party.statements.dal.js';
import { formatDateTime } from '$lib/utils/dateTime';
import { formDataToObject } from '$lib/utils/form';
import { fail } from '@sveltejs/kit';

export async function load({ depends, url }) {
  depends('CASH.LIST');

  // 1. Parse Params & Dates
  const dateParam = url.searchParams.get('date');
  const reportIndex = parseInt(url.searchParams.get('report') || '0', 10);

  // Use passed date if valid, otherwise default to today
  const formattedDate = Date.parse(dateParam)
    ? formatDateTime('YY-MM-DD', dateParam)
    : formatDateTime('YY-MM-DD');

  // 2. Fetch all data in parallel (Avoiding Waterfalls)
  const [reports, directCash, deliveryCash, oldBalanceCash, cashDescription, party] = await Promise.all([
    getAllReports(formattedDate),
    getAllCash(formattedDate),
    getAllDeliveryCash(formattedDate),
    getAllOldBalanceCash(formattedDate),
    fetchAllCashDescription(),
    getAllParty()
  ]);

  // 3. Determine Report Time Boundaries
  const { fromDate, toDate } = getReportBoundaries(reports, reportIndex);

  // 4. Filter and Categorize Data
  // Pre-filter helper to keep things DRY
  const isWithinReport = (item) => {
    const created = new Date(item.created_at);
    return created > fromDate && created < toDate;
  };

  const income = [...directCash, ...deliveryCash, ...oldBalanceCash]
    .filter(c => c.entry_type !== 'EXPENSE' && isWithinReport(c));

  const expense = directCash
    .filter(c => c.entry_type === 'EXPENSE' && isWithinReport(c));

  return {
    income,
    expense,
    reports,
    party,
    cashDescription
  };
}

/**
 * Helper to calculate report start and end times
 */
function getReportBoundaries(reports, index) {
  const todayStart = new Date().setHours(0, 0, 0, 0);
  const todayEnd = new Date().setHours(23, 59, 59, 999);

  if (!reports || reports.length === 0) {
    return { fromDate: new Date(todayStart), toDate: new Date(todayEnd) };
  }

  const previousReport = reports[index - 1];
  const currentReport = reports[index];

  return {
    fromDate: previousReport ? new Date(previousReport.created_at) : new Date(todayStart),
    toDate: currentReport?.created_at ? new Date(currentReport.created_at) : new Date(todayEnd)
  };
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
  },

  newReport: async () => {
    const result = await createNewCashReport();
    if (!result?.ok) {
      return fail(400, { message: result.message });
    }

    sseEmit({ type: 'CASH.LIST' });
    return result;
  },

  deleteReport: async ({ request }) => {
    const formData = await request.formData();
    const { id } = formDataToObject(formData);
    let result
    if (id) {
      result = await deleteCashReport(id);
    }

    if (!result?.ok) {
      return fail(400, { message: result.message });
    }

    sseEmit({ type: 'CASH.LIST' });
    return result;
  },
}
