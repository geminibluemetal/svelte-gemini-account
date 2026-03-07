import { sseEmit } from '$lib/core/server/sseBus.js';
import ItemService from '$lib/features/items/ItemService';
import PartyService from '$lib/features/party/PartyService';
import VehicleService from '$lib/features/vehicle/VehicleService';
import TokenService from '$lib/features/token/TokenService';
import { parseDate } from '$lib/utils/dateTimeParser';
import { formDataToObject } from '$lib/utils/form.js';
import { serializeDoc } from '$lib/utils/serializer.js';
import { fail } from '@sveltejs/kit';

export async function load({ depends, url }) {
  depends('DELIVERY.TOKEN.LIST');

  const date = url.searchParams.get('date');
  let formattedDate = date ? parseDate(date) : new Date();

  const tokenService = new TokenService();
  const itemService = new ItemService();
  const partyService = new PartyService();
  const vehicleService = new VehicleService();
  const token = await tokenService.tokenList(formattedDate);
  const item = await itemService.itemList();
  const party = await partyService.partyList();
  const vehicle = await vehicleService.vehicleList();
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
