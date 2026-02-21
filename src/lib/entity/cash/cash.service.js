import { formatDateTime } from '$lib/utils/dateTime';
import { deleteCashById, deleteCashByOrderId, fetchAllCash, fetchSingleCashById, insertCash, signCashById, updateCash as UpdateCashInDal } from './cash.dal';
import { checkDescriptionExist, insertCashDescription } from './cash_description.dal';
import { fetchAllReportsByDate } from './cash_reports.dal';

export function getAllCash(date) {
  const cash = fetchAllCash(date);
  return cash;
}

export function createIncome(data) {
  const cash = insertCash(data, 'INCOME');
  return cash;
}

export function createExpense(data) {
  const cash = insertCash(data, 'EXPENSE');
  return cash;
}

export function updateIncome(data, cashId) {
  const result = UpdateCashInDal(data, 'INCOME', cashId);
  return result;
}

export function updateExpense(data, cashId) {
  const result = UpdateCashInDal(data, 'EXPENSE', cashId);
  return result;
}

export function deleteIncomIfExist(order_id) {
  const result = deleteCashByOrderId(order_id);
  return result;
}

export function createCash(data) {
  if (!data.description) return { message: 'Description is required', ok: false }
  if (!data.amount) return { message: 'Amount is required', ok: false }
  if (data.amount && isNaN(Number(data.amount))) return { message: 'Amount should be Number', ok: false }

  const isExist = checkDescriptionExist(data.description)
  if (!isExist) {
    const result = insertCashDescription(data.description)
    if (!result?.changes) return { message: 'New Description not saved', ok: false }
  }

  let result;
  if (data.entry_type == 'INCOME') result = createIncome(data)
  if (data.entry_type == 'EXPENSE') result = createExpense(data)

  if (result?.changes) return { message: 'Created', ok: true }
}

export function updateCash(data, id) {
  if (!data.description) return { message: 'Description is required', ok: false }
  if (!data.amount) return { message: 'Amount is required', ok: false }
  if (data.amount && isNaN(Number(data.amount))) return { message: 'Amount should be Number', ok: false }

  const isExist = checkDescriptionExist(data.description)
  if (!isExist) {
    const result = insertCashDescription(data.description)
    if (!result?.changes) return { message: 'New Description not saved', ok: false }
  }

  let result;
  if (data.entry_type == 'INCOME') result = updateIncome(data, id)
  if (data.entry_type == 'EXPENSE') result = updateExpense(data, id)

  if (result?.changes) return { message: 'Created', ok: true }
}

export function signCash(id, current) {
  const newValue = Number(current) ? 0 : 1
  const result = signCashById(id, newValue)
  if (result?.changes) return { message: 'Signed', ok: true }
  else return { message: 'Not Signed', ok: false }
}

export function deleteCash(id) {
  const cash = fetchSingleCashById(id)
  if (cash?.sign) return { message: 'Can not delete signed cash', ok: false }
  const result = deleteCashById(id)
  if (result?.changes) return { message: 'Deleted', ok: true }
  else return { message: 'Not Deleted', ok: false }
}

export function getAllReports(date = formatDateTime('YY-MM-DD')) {
  return fetchAllReportsByDate(date)
}

// export function fetchAllDeliveryByDate(date) {
//   const query = `SELECT * FROM ${tableName} WHERE DATE(created_at) = '${date}';`;
//   const stat = db.prepare(query);
//   db.pragma('wal_checkpoint(TRUNCATE)');
//   return stat.all();
// }