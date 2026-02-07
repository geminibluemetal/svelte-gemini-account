import { sseEmit } from '$lib/core/server/sseBus.js';
import {
  createAddress,
  deleteAddress,
  getAllAddress,
  updateAddress
} from '$lib/entity/address/address.service.js';
import { formDataToObject } from '$lib/utils/form.js';
import { fail } from '@sveltejs/kit';

export async function load({ depends }) {
  depends('ADDRESS.LIST');
  const address = await getAllAddress();
  return { address };
}

export const actions = {
  // Create or Update
  form: async ({ request }) => {
    const formData = await request.formData();
    const { editId, ...data } = formDataToObject(formData);
    let result = null;

    if (editId) {
      result = await updateAddress(data, editId);
    } else {
      result = await createAddress(data);
    }

    if (!result?.ok) {
      return fail(400, { message: result.message });
    }

    sseEmit({ type: 'ADDRESS.LIST' });
    return result;
  },

  // Delete
  delete: async ({ request }) => {
    const formData = await request.formData();
    const data = formDataToObject(formData);
    const result = await deleteAddress(data?.id);

    if (!result?.ok) {
      return fail(400, { message: result.message });
    }

    sseEmit({ type: 'ADDRESS.LIST' });
    return result;
  }
};
