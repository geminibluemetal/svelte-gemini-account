import { sseEmit } from '$lib/core/server/sseBus.js';
import PartyService from '$lib/features/party/PartyService.js';
import { formDataToObject } from '$lib/utils/form.js';
import { serializeDoc } from '$lib/utils/serializer.js';
import { fail } from '@sveltejs/kit';

export async function load({ depends }) {
  depends('PARTY.LIST');
  const partyService = new PartyService();
  const party = await partyService.partyList();
  return { party: serializeDoc(party) };
}

export const actions = {
  // Create or Update
  form: async ({ request }) => {
    const formData = await request.formData();
    const { editId, ...data } = formDataToObject(formData);
    let result = null;
    const partyService = new PartyService();

    if (editId) {
      result = await partyService.updateParty(editId, data);
    } else {
      result = await partyService.createParty(data);
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
    const partyService = new PartyService();
    const result = await partyService.deleteParty(data?.id);

    if (!result?.ok) {
      return fail(400, { message: result.message });
    }

    sseEmit({ type: 'PARTY.LIST' });
    return result;
  },
};
