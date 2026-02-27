import { sseEmit } from '$lib/core/server/sseBus.js';
import {
  createItem,
  deleteItem,
  getAllItems,
  updateItem,
} from '$lib/entity/items/items.service.js';
import { formDataToObject } from '$lib/utils/form.js';
import { fail } from '@sveltejs/kit';

export async function load({ depends }) {
  depends('ITEMS.LIST');
  const items = await getAllItems();
  return { items };
}

export const actions = {
  // Create or Update
  form: async ({ request }) => {
    const formData = await request.formData();
    const { editId, ...data } = formDataToObject(formData);
    let result = null;

    if (editId) {
      result = await updateItem(data, editId);
    } else {
      result = await createItem(data);
    }

    if (!result?.ok) {
      return fail(400, { message: result.message });
    }

    sseEmit({ type: 'ITEMS.LIST' });
    return result;
  },

  // Delete
  delete: async ({ request }) => {
    const formData = await request.formData();
    const data = formDataToObject(formData);
    const result = await deleteItem(data?.id);

    if (!result?.ok) {
      return fail(400, { message: result.message });
    }

    sseEmit({ type: 'ITEMS.LIST' });
    return result;
  },
};
