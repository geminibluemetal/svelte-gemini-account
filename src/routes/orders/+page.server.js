import { sseEmit } from '$lib/core/server/sseBus.js'
import { getAllAddress } from '$lib/entity/address/address.service.js'
import { getAllItems } from '$lib/entity/items/items.service.js'
import { createOrder, deleteOrder, getAllOrders, updateOrder } from '$lib/entity/orders/order.service.js'
import { getAllParty } from '$lib/entity/party/party.service.js'
import { formDataToObject } from '$lib/utils/form'
import { fail } from '@sveltejs/kit'

export async function load({ depends }) {
  depends('ORDERS.LIST')
  const orders = await getAllOrders()
  const party = await getAllParty()
  const address = await getAllAddress()
  const items = await getAllItems()
  return { orders, party, address, items }
}

export const actions = {
  // Create or Update
  form: async ({ request }) => {
    const formData = await request.formData()
    const { editId, ...data } = formDataToObject(formData)
    let result = null;

    if (editId) {
      result = await updateOrder(data, editId)
    } else {
      result = await createOrder(data)
    }

    if (!result?.ok) {
      return fail(400, { message: result.message })
    }

    sseEmit({ type: 'ORDERS.LIST' })
    return result
  },

  // Delete
  delete: async ({ request }) => {
    const formData = await request.formData()
    const data = formDataToObject(formData)
    const result = await deleteOrder(data?.id)

    if (!result?.ok) {
      return fail(400, { message: result.message })
    }

    sseEmit({ type: 'ORDERS.LIST' })
    return result
  }
}