import { fetchAllCash, insertCash } from "./cash.dal"

export function getAllCash(date) {
  const cash = fetchAllCash(date)
  return cash
}

export function createIncome(data) {
  const cash = insertCash(data, 'INCOME')
  return cash
}