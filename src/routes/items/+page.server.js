import { sseEmit } from '$lib/core/server/sseBus.js';
import { formDataToObject } from '$lib/utils/form.js';
import { serializeDoc } from '$lib/utils/serializer.js';
import { fail } from '@sveltejs/kit';
import ItemService from '$lib/features/items/ItemService.js';

export async function load({ depends }) {
  depends('ITEMS.LIST');
  const itemService = new ItemService();
  const items = await itemService.itemList();
  return { items: serializeDoc(items) };
}

export const actions = {
  // Create or Update
  form: async ({ request }) => {
    const formData = await request.formData();
    const { editId, ...data } = formDataToObject(formData);
    let result = null;
    const itemService = new ItemService();

    if (editId) {
      result = await itemService.updateItem(editId, data);
    } else {
      result = await itemService.createItem(data);
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
    const itemService = new ItemService();
    const result = await itemService.deleteItem(data?.id);

    if (!result?.ok) {
      return fail(400, { message: result.message });
    }

    sseEmit({ type: 'ITEMS.LIST' });
    return result;
  },
};
