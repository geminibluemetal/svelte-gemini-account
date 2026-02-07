import { formatDateTime, getFormattedDate, getFormattedTime } from "$lib/utils/dateTime";
import { fetchSinglePartyByName, updatePhoneByPartyName } from "../party/party.dal";
import { fetchSettings, setSettings } from "../settings/settings.dal";
import { deleteOrderById, fetchAllOrders, fetchSingleOrderById, insertOrder, updateOrderById, updateSingleOrderColumn } from "./order.dal";
import { printOut } from "$lib/core/server/print";
import { formatFixed } from "$lib/utils/number";
import { createToken, printToken } from "../token/token.service";
import { fetchDeliveryById } from "../delivery/delivery.dal";

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
  if (data.total_qty && isNaN(Number(data.total_qty))) return { message: "Quantity should be Number", ok: false }
  if (data.amount && isNaN(Number(data.amount))) return { message: "Amount should be Number", ok: false }
  if (data.advance && isNaN(Number(data.advance))) return { message: "Advance should be Number", ok: false }
  if (data.discount && isNaN(Number(data.discount))) return { message: "Discount should be Number", ok: false }

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
  data.balance_qty = Number(data.total_qty) || 0 - Number(data.delivered_qty) || 0

  let result = insertOrder(data)

  if (result.changes) {
    result = setSettings({ last_order_number: currentOrderNumber })
    console.log(result)
    if (!result.changes) {
      return { message: "Order Created. but Order Number increment faild", ok: false }
    }
  }

  // console.log(data)
  // return { message: "OKK", ok: false }
  return { message: "Order Created", ok: true }
}

export async function updateOrder(data, editId) {
  if (!data.address) return { message: "Address is required", ok: false }
  if (!data.phone) return { message: "Phone number is required", ok: false }
  if (!data.item) return { message: "Item is required", ok: false }
  if (!data.total_qty) return { message: "Quantity is required", ok: false }
  if (!data.party_name && data.amount_type == 'AC') return { message: "AC type need Party Name", ok: false }
  if (data.amount_type != 'AC' && !data.amount) return { message: "Amount is Required", ok: false }
  if (data.total_qty && isNaN(Number(data.total_qty))) return { message: "Quantity should be Number", ok: false }
  if (data.amount && isNaN(Number(data.amount))) return { message: "Amount should be Number", ok: false }
  if (data.advance && isNaN(Number(data.advance))) return { message: "Advance should be Number", ok: false }
  if (data.discount && isNaN(Number(data.discount))) return { message: "Discount should be Number", ok: false }

  // Check advance amount changes when signed in
  if (data.advance) {
    const party = fetchSingleOrderById(editId)
    console.log(party, data)
    if (party.advance != data.advance && party.sign == 1) {
      return { message: "Advance amount can't changed after Signed", ok: false }
    }
  }

  // Check party phone number if not exist save it.
  if (data.party_name) {
    const result = fetchSinglePartyByName(data.party_name)
    if (!result.phone && data.phone) {
      updatePhoneByPartyName(result.name, data.phone)
    } else if (result.phone != data.phone) {
      return { message: "Phone number miss match", ok: false }
    }
  }

  data.balance = Number(data.amount) - Number(data.advance) - Number(data.discount)
  data.balance_qty = Number(data.total_qty) || 0 - Number(data.delivered_qty) || 0

  let result = updateOrderById(editId, data)

  if (!result.changes) {
    return { message: "Error, Order Not Updated", ok: false }
  }

  // console.log(data)
  // return { message: "OKK", ok: false }
  return { message: "Order Updated", ok: true }
}

export async function deleteOrder(id) {
  const result = deleteOrderById(id)

  if (result?.changes) {
    return { message: `Order Deleted`, ok: true }
  } else {
    return { message: `Order Not Deleted`, ok: false }
  }
}

export async function orderSinglePrint(data) {
  const order = fetchSingleOrderById(data.id)
  await printOut((p) => {
    p.reset()
      .beepOn(1, 2)
      .align('center')
      .setTextSize(1, 0)
      .bold(true)
      .line("Single Cash Bill")
      .bold(false)
      .dashedLine(17)
      .align('left')

      .pairs('Date', getFormattedDate())
      .pairs('Order', order.order_number)
      .pairs('Party', order.party_name)
      .pairs('Address', order.address)
      .pairs('Phone', order.phone)
      .pairs('Item', order.item)
      .pairs('Qty', formatFixed(data.qty))
      .pairs('Amount', data.amount)
      .pairs('Tip', data.tip)
      .pairs('Total', Number(data.amount) + Number(data.tip))
      .flushPairs()

      .feed(1)
      .cut();
  });
}

export async function orderFullPrint(data) {
  const order = fetchSingleOrderById(data.id)
  await printOut((p) => {
    p.reset()
      .beepOn(2, 2)
      .align('center')
      .setTextSize(1, 0)
      .bold(true)
      .line("Full Cash Bill")
      .bold(false)
      .dashedLine(17)
      .align('left')

      .pairs('Date', getFormattedDate())
      .pairs('Order', order.order_number)
      .pairs('Party', order.party_name)
      .pairs('Address', order.address)
      .pairs('Phone', order.phone)
      .pairs('Item', order.item)
      .pairs('Qty', formatFixed(order.total_qty))
      .pairs('Amount', order.amount)
      .pairs('Advance', order.advance)
      .pairs('Discount', order.discount)
      .pairs('Balance', order.balance)
      .pairs('Tip', data.tip)
      .pairs('Total', Number(order.balance) + Number(data.tip))
      .flushPairs()

      .feed(1)
      .cut();
  });
}

export async function orderPhonePrint(data) {
  const order = fetchSingleOrderById(data.id)
  await printOut((p) => {
    p.reset()
      .beepOn(1, 1)
      .setTextSize(1, 0)
      .align('left')

      // .pairs('Date', getFormattedDate())
      .pairs('Order', order.order_number)
      // .pairs('Party', order.party_name)
      .pairs('Address', order.address)
      .pairs('Phone', order.phone)
      .pairs('Item', order.item)
      .pairs('Qty', formatFixed(order.total_qty))
      // .pairs('Amount', order.amount)
      // .pairs('Advance', order.advance)
      // .pairs('Discount', order.discount)
      // .pairs('Balance', order.balance)
      // .pairs('Tip', data.tip)
      // .pairs('Total', Number(order.balance) + Number(data.tip))
      .flushPairs()

      .feed(1)
      .cut();
  });
}

export async function signOrderById(id, current) {
  updateSingleOrderColumn(id, 'sign', current == 1 ? 0 : 1)
}

export async function createTokenFromOrder(id, data) {
  if (!data.vehicle) return { message: "Vehicle is required", ok: false }
  if (!data.qty) return { message: "Quantity is required", ok: false }
  if (data.qty && isNaN(Number(data.qty))) return { message: "Quantity must be a Number", ok: false }

  const order = fetchSingleOrderById(id)
  const tokenData = {
    party_name: order.party_name,
    vehicle: data.vehicle,
    token_item: order.item,
    token_quantity: data.qty || order.total_qty,
  }
  const result = await createToken(tokenData, false)
  if (result.lastInsertRowid) {
    const token = fetchDeliveryById(result.lastInsertRowid)
    printToken({
      Token: token.serial,
      Party: token.party_name ? token.party_name : ' - ',
      Phone: order.phone || '',
      Vcle: data.vehicle || 'Vehicle',
      Item: token.token_item,
      Qty: formatFixed(data.qty || token.token_quantity),
      Date: getFormattedDate(),
      Time: getFormattedTime()
    });
    return { message: 'Token Created', ok: true }
  }
}