import { sseEmit } from '$lib/core/server/sseBus.js';
import { getAllItems } from '$lib/entity/items/items.service.js';
import { getAllParty } from '$lib/entity/party/party.service.js';
import { getAllVehicle } from '$lib/entity/vehicle/vehicle.service.js';
import TokenService from '$lib/features/token/TokenService';
import { formatDateTime } from '$lib/utils/dateTime';
import { formDataToObject } from '$lib/utils/form.js';
import { serializeDoc } from '$lib/utils/serializer.js';
import { fail } from '@sveltejs/kit';

export async function load({ depends, url }) {
  depends('DELIVERY.TOKEN.LIST');

  const date = url.searchParams.get('date');
  let formattedDate = formatDateTime('YY-MM-DD');

  if (Date.parse(date)) {
    formattedDate = formatDateTime('YY-MM-DD', date);
  }

  const tokenService = new TokenService();
  const token = await tokenService.tokenList(formattedDate);
  const party = await getAllParty();
  const vehicle = await getAllVehicle();
  const item = await getAllItems();
  return {
    token: serializeDoc(token),
    party: serializeDoc(party),
    vehicle: serializeDoc(vehicle),
    item: serializeDoc(item),
  };
}

export const actions = {
  // Create or Update
  form: async ({ request }) => {
    const formData = await request.formData();
    const { editId, ...data } = formDataToObject(formData);
    let result = null;
    const tokenService = new TokenService();

    if (editId) {
      result = await tokenService.updateToken(editId, data);
    } else {
      result = await tokenService.createToken(data);
    }

    if (!result?.ok) {
      return fail(400, { message: result.message });
    }

    sseEmit({ type: 'DELIVERY.TOKEN.LIST' });
    return result;
  },

  // Delete
  delete: async ({ request }) => {
    const formData = await request.formData();
    const data = formDataToObject(formData);
    const tokenService = new TokenService();
    const result = await tokenService.deleteToken(data?.id);

    if (!result?.ok) {
      return fail(400, { message: result.message });
    }

    sseEmit({ type: 'DELIVERY.TOKEN.LIST' });
    return result;
  },

  // Print
  print: async ({ request }) => {
    const formData = await request.formData();
    const data = formDataToObject(formData);
    const tokenService = new TokenService();
    tokenService.printToken(data.id);
  },
};
