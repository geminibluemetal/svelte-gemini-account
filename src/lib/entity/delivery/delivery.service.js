import { getFormattedTime } from '$lib/utils/dateTime';
import { updateDeliveryAmountById, updateDeliveryById, signDelivery } from './delivery.dal';

export async function updateDelivery(data, id) {
  if (data.vehicle.endsWith('G') && !data.address)
    return { message: 'Address is Missing', ok: false };
  else if (data.vehicle.endsWith('G') && !data.order_number)
    return { message: 'Order Number is Missing', ok: false };
  else if (data.delivery_quantity && isNaN(Number(data.delivery_quantity)))
    return { message: 'Quantity Must be a Number', ok: false };
  else if (data.amount_type_1 == 'AC' && !data.party_name)
    return { message: 'AC type Must have Party Name', ok: false };
  data.delivery_time = getFormattedTime();
  const result = updateDeliveryById(data, id);

  if (result?.success) {
    return { message: 'Delivery Entry Success', ok: true };
  }
}

export async function updateDeliveryAmount(data, id) {
  if (data.amount_2 && isNaN(Number(data.amount_2)))
    return { message: 'Amount 2 Must be a Number', ok: false };
  const result = updateDeliveryAmountById(data, id);

  if (result.changes) {
    return { message: 'Delivery Entry Success', ok: true };
  }
}

export async function signDeliveryById(id, current) {
  const newValue = current == 1 ? 0 : 1;
  signDelivery(id, newValue);
}
