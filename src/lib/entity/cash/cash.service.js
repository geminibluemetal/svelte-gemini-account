import { fetchAllCash } from "./cash.dal"

export function getAllCash(date) {
  const cash = fetchAllCash(date)
  return cash
}