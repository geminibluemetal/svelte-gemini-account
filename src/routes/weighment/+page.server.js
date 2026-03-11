import { sseEmit } from '$lib/core/server/sseBus';
import { getReadingStatus } from '$lib/core/server/weighment';
import WeighmentService from '$lib/features/weighment/WeighmentService';
import { fail } from '@sveltejs/kit';

export function load({ depends }) {
  depends('WEIGHMENT.LIST');
  const status = getReadingStatus();
  const data = {
    isScaleOpen: status.isReading && status.isOpen,
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
};
