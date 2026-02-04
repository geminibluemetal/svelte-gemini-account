import { fetchAllItems } from "./items.dal";

export async function getAllItems() {
  return fetchAllItems()
}

export async function createItem(data) {
  console.log("item.service.js -> createItem", data)

  if (!data.name) {
    return { message: "Name is Required", ok: false }
  }
}

export async function updateItem(data, editId) {
  console.log("item.service.js -> updateItem", data, editId)
}