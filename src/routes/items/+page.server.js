import { createItem, getAllItems, updateItem } from "$lib/entity/items/items.service.js";
import { formDataToObject } from "$lib/utils/form.js";
import { fail } from "@sveltejs/kit";

export async function load() {
  const items = await getAllItems()
  return { items }
}

export const actions = {
  form: async ({ request }) => {
    const formData = await request.formData()
    const { editId, ...data } = formDataToObject(formData)
    let result = null;

    if (editId) {
      result = await updateItem(data, editId)
    } else {
      result = await createItem(data)
    }

    if (!result?.ok) {
      return fail(400, { message: result.message })
    }

    return result
  }
}