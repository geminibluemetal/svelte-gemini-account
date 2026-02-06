import { formatDateTime } from "$lib/utils/dateTime";
import { fetchSinglePartyByName, updatePhoneByPartyName } from "../party/party.dal";
import { fetchSettings, setSettings } from "../settings/settings.dal";
import { fetchAllOrders, insertOrder } from "./order.dal";

export async function getAllOrders() {
  return fetchAllOrders()
}

export async function createOrder(data) {
  if (!data.address) return { message: "Address is required", ok: false }
  if (!data.phone) return { message: "Phone number is required", ok: false }
  if (!data.item) return { message: "Item is required", ok: false }
  if (!data.total_qty) return { message: "Quantity is required", ok: false }
  if (!data.party_name && data.amount_type == 'AC') return { message: "AC type need Party Name", ok: false }
  if (data.amount_type != 'AC' && !data.amount) return { message: "Amount is Required", ok: false }
  if (isNaN(Number(data.total_qty))) return { message: "Quantity should be Number", ok: false }
  if (isNaN(Number(data.amount))) return { message: "Amount should be Number", ok: false }
  if (isNaN(Number(data.advance))) return { message: "Advance should be Number", ok: false }
  if (isNaN(Number(data.discount))) return { message: "Discount should be Number", ok: false }

  // Check party phone number if not exist save it.
  if (data.party_name) {
    const result = fetchSinglePartyByName(data.party_name)
    if (!result.phone && data.phone) {
      updatePhoneByPartyName(result.name, data.phone)
    } else if (result.phone != data.phone) {
      return { message: "Phone number miss match", ok: false }
    }
  }

  // Auto Increment Order Numbers and Reset to 1 after reach 999
  const settings = fetchSettings()
  let currentOrderNumber = settings.last_order_number + 1
  currentOrderNumber = currentOrderNumber < 1000 ? currentOrderNumber : 1

  data.date = formatDateTime('YY-MM-DD')
  data.order_number = currentOrderNumber
  data.balance = Number(data.amount) - Number(data.advance) - Number(data.discount)

  let result = insertOrder(data)

  if (result.changes) {
    result = setSettings({ last_order_number: currentOrderNumber })
    console.log(result)
    if (!result.changes) {
      return { message: "Order Created. but Order Number increment faild", ok: false }
    }
  }

  return { message: "Order Created", ok: true }
}

export async function updateOrder() {

}

export async function deleteOrder() {

}