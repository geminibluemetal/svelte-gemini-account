import { deleteCashByOrderId, fetchAllCash, insertCash, updateCash } from './cash.dal';

export function getAllCash(date) {
  const cash = fetchAllCash(date);
  return cash;
}

export function createIncome(data) {
  const cash = insertCash(data, 'INCOME');
  return cash;
}

export function updateIncome(data, cashId) {
  const result = updateCash(data, 'INCOME', cashId);
  return result;
}

export function deleteIncomIfExist(order_id) {
  const result = deleteCashByOrderId(order_id);
  return result;
}
