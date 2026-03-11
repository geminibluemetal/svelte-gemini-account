import { sseEmit } from '$lib/core/server/sseBus';
import { getReadingStatus } from '$lib/core/server/weighment';
import WeighmentService from '$lib/features/weighment/WeighmentService';

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
    await weighmentService.weighmentSwitch();
    sseEmit({ type: 'WEIGHMENT.LIST' });
  },
};
