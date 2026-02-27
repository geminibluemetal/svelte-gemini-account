import { sseEmit } from '$lib/core/server/sseBus.js';
import {
  createParty,
  deleteParty,
  getAllParty,
  updateParty,
} from '$lib/entity/party/party.service.js';
import { formDataToObject } from '$lib/utils/form.js';
import { serializeDoc } from '$lib/utils/serializer.js';
import { fail } from '@sveltejs/kit';

export async function load({ depends }) {
  depends('PARTY.LIST');
  const party = await getAllParty();
  return { party: serializeDoc(party) };
}

export const actions = {
  // Create or Update
  form: async ({ request }) => {
    const formData = await request.formData();
    const { editId, ...data } = formDataToObject(formData);
    let result = null;

    if (editId) {
      result = await updateParty(data, editId);
    } else {
      result = await createParty(data);
    }

    if (!result?.ok) {
      return fail(400, { message: result.message });
    }

    sseEmit({ type: 'PARTY.LIST' });
    return result;
  },

  // Delete
  delete: async ({ request }) => {
    const formData = await request.formData();
    const data = formDataToObject(formData);
    const result = await deleteParty(data?.id);

    if (!result?.ok) {
      return fail(400, { message: result.message });
    }

    sseEmit({ type: 'PARTY.LIST' });
    return result;
  },
};
