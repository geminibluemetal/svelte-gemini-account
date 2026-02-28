import { sseEmit } from '$lib/core/server/sseBus.js';
import AddressService from '$lib/features/address/AddressService.js';
import { formDataToObject } from '$lib/utils/form.js';
import { serializeDoc } from '$lib/utils/serializer.js';
import { fail } from '@sveltejs/kit';

export async function load({ depends }) {
  depends('ADDRESS.LIST');
  const addressService = new AddressService();
  const address = await addressService.addressList();
  return { address: serializeDoc(address) };
}

export const actions = {
  // Create or Update
  form: async ({ request }) => {
    const formData = await request.formData();
    const { editId, ...data } = formDataToObject(formData);
    let result = null;
    const addressService = new AddressService();

    if (editId) {
      result = await addressService.updateAddress(editId, data);
    } else {
      result = await addressService.createAddress(data);
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
    const addressService = new AddressService();
    const result = await addressService.deleteAddress(data?.id);

    if (!result?.ok) {
      return fail(400, { message: result.message });
    }

    sseEmit({ type: 'ADDRESS.LIST' });
    return result;
  },
};
