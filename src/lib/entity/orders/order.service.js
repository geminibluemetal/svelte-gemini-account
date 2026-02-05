import { fetchSinglePartyByName, updatePhoneByPartyName } from "../party/party.dal";
import { fetchAllOrders, insertOrder } from "./order.dal";

export async function getAllOrders() {
  return fetchAllOrders()
}

export async function createOrder(data) {
  if (!data.address) return { message: "Address is required", ok: false }
  if (!data.phone) return { message: "Phone number is required", ok: false }
  if (!data.item) return { message: "Item is required", ok: false }
  if (!data.total_qty) return { message: "Quantity is required", ok: false }
  if (!data.party && data.amount_type == 'AC') return { message: "AC type need Party Name", ok: false }
  if (data.amount_type != 'AC' && !data.amount) return { message: "Amount is Required", ok: false }

  // Check party phone number if not exist save it.
  if (data.party) {
    const result = fetchSinglePartyByName(data.party)
    if (!result.phone && data.phone) {
      updatePhoneByPartyName(result.name, data.phone)
    } else if (result.phone != data.phone) {
      return { message: "Phone number miss match", ok: false }
    }
  }

  // TODO: get last_order_number from settings table and increment each time after saved

  const result = insertOrder(data)
}

export async function updateOrder() {

}

export async function deleteOrder() {

}