import { sseEmit } from '$lib/core/server/sseBus';
import { getReadingStatus } from '$lib/core/server/weighment';
import SettingsService from '$lib/features/settings/SettingsService';
import WeighmentService from '$lib/features/weighment/WeighmentService';
import WeighmentEmptyService from '$lib/features/weighmentEmpty/WeighmentEmptyService.js';
import { formDataToObject } from '$lib/utils/form.js';
import { serializeDoc } from '$lib/utils/serializer.js';
import { fail } from '@sveltejs/kit';

export async function load({ depends }) {
  depends('WEIGHMENT.LIST');

  const settingsService = new SettingsService();
  const settings = await settingsService.getSettings();
  const weighmentEmptyService = new WeighmentEmptyService();
  const emptyData = await weighmentEmptyService.weighmentEmptyList();
  const weighmentService = new WeighmentService();
  const weighData = await weighmentService.weighmentList()

  const status = getReadingStatus();
  const data = {
    weighData: serializeDoc(weighData),
    isScaleOpen: status.isReading && status.isOpen,
    settings: settings?.weighment || {},
    emptyData: serializeDoc(emptyData)
  };
  return data;
}

export const actions = {
  switchWeighment: async () => {
    const weighmentService = new WeighmentService();
    const result = await weighmentService.weighmentSwitch();

    if (!result?.ok) {
      return fail(400, { message: result.message });
    }

    sseEmit({ type: 'WEIGHMENT.LIST' });
    return result;
  },

  wighmentSettings: async ({ request }) => {
    const formData = await request.formData();
    const data = formDataToObject(formData)
    const weighmentService = new WeighmentService();
    const result = await weighmentService.updateSettings(data);

    if (!result?.ok) {
      return fail(400, { message: result.message });
    }

    sseEmit({ type: 'WEIGHMENT.LIST' });
    return result;
  },

  emptyWeightUpdate: async ({ request }) => {
    const formData = await request.formData();
    const { data } = formDataToObject(formData)
    const weighmentEmptyService = new WeighmentEmptyService();
    const result = await weighmentEmptyService.saveEmptyWeight(data);

    if (!result?.ok) {
      return fail(400, { message: result.message });
    }

    sseEmit({ type: 'WEIGHMENT.LIST' });
    return result;
  },

  weightment: async ({ request }) => {
    const formData = await request.formData();
    const { editId, ...data } = formDataToObject(formData)
    const weighmentService = new WeighmentService();
    let result

    if (editId) {
      result = await weighmentService.completeSecondWeight(data);
    } else {
      result = await weighmentService.saveFirstWeight(data);
    }

    if (!result?.ok) {
      return fail(400, { message: result.message });
    }

    sseEmit({ type: 'WEIGHMENT.LIST' });
    return result;
  }
};
