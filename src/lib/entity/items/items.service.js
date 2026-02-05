import { checkItemNameExists, deleteItemById, fetchAllItems, fetchSingleItemByName, insertItem, updateItemById } from "./items.dal";

export async function getAllItems() {
  return fetchAllItems()
}

export async function createItem(data) {
  if (!data.name) {
    return { message: "Name is Required", ok: false }
  }

  if (data.name.includes('+') && !data.name.includes(' + ')) {
    return { message: "Add space between +", ok: false }
  }

  const itemExist = fetchSingleItemByName(data.name)

  if (itemExist) {
    return { message: `'${data.name}' is already exists`, ok: false }
  }

  data.price_025 = parseFloat(data.price_025)
  data.price_050 = parseFloat(data.price_050)
  data.price_100 = parseFloat(data.price_100)
  data.price_150 = parseFloat(data.price_150)
  data.price_200 = parseFloat(data.price_200)

  const result = insertItem(data)

  if (result?.changes) {
    return { message: `Item created`, ok: true }
  }
}

export async function updateItem(data, editId) {
  if (!data.name) {
    return { message: "Name is Required", ok: false }
  }

  if (data.name.includes('+') && !data.name.includes(' + ')) {
    return { message: "Add space between +", ok: false }
  }

  const itemExist = checkItemNameExists(data.name, editId)

  if (itemExist) {
    return { message: `'${data.name}' is already exists`, ok: false }
  }

  data.price_025 = parseFloat(data.price_025)
  data.price_050 = parseFloat(data.price_050)
  data.price_100 = parseFloat(data.price_100)
  data.price_150 = parseFloat(data.price_150)
  data.price_200 = parseFloat(data.price_200)

  const result = updateItemById(data, editId)

  if (result?.changes) {
    return { message: `Item updated`, ok: true }
  }
}

export async function deleteItem(id) {
  const result = deleteItemById(id)

  if (result?.changes) {
    return { message: `Item Deleted`, ok: true }
  } else {
    return { message: `Item Not Deleted`, ok: false }
  }
}