import { calculateAmount } from '$lib/core/helper';
import { getFormattedTime } from '$lib/utils/dateTime';
import {
  updateDeliveryAmountById,
  updateDeliveryById,
  signDelivery,
  markDeliveryById,
} from './delivery.dal';

export async function updateDelivery(data, id) {
  if (Number(data.sign)) return { message: 'Can not edit Signed Delivery Record', ok: false };
  if (!data.is_cancelled && data.delivery_quantity && data.delivery_item) {
    if (data.vehicle.endsWith('G') && !data.address)
      return { message: 'Address is Missing', ok: false };
    else if (data.vehicle.endsWith('G') && !data.order_number)
      return { message: 'Order Number is Missing', ok: false };
    else if (data.delivery_quantity && isNaN(Number(data.delivery_quantity)))
      return { message: 'Quantity Must be a Number', ok: false };
    else if (data.amount_type_1 == 'AC' && !data.party_name)
      return { message: 'AC type Must have Party Name', ok: false };
    else if (data.amount_type_1 == 'AC' && data.amount_type_2 == 'AC')
      return { message: `Both amount type can't be AC`, ok: false };
  }

  const priceResult = calculateAmount(data.address, data.delivery_item, data.delivery_quantity);
  if (!priceResult.success) {
    return { message: priceResult?.message, ok: false };
  }

  data.delivery_time = getFormattedTime();
  const result = updateDeliveryById(data, id);

  if (result?.success) {
    return { message: 'Delivery Entry Success', ok: true };
  } else {
    return { message: result?.message, ok: false };
  }
}

export async function updateDeliveryAmount(data, id) {
  if (Number(data.sign)) return { message: 'Can not edit Signed Delivery Record', ok: false };
  if (data.amount_2 && isNaN(Number(data.amount_2)))
    return { message: 'Amount 2 Must be a Number', ok: false };
  if (data.amount_type_1 == 'AC' && data.amount_type_2 == 'AC')
    return { message: `Both amount type can't be AC`, ok: false };

  const priceResult = calculateAmount(data.address, data.delivery_item, data.delivery_quantity);
  if (!priceResult.success) {
    return { message: priceResult?.message, ok: false };
  }

  const result = updateDeliveryAmountById(data, id);

  if (result?.success) {
    return { message: 'Delivery Entry Success', ok: true };
  } else {
    return { message: result?.message, ok: false };
  }
}

export async function signDeliveryById(id, current) {
  const newValue = current == 1 ? 0 : 1;
  signDelivery(id, newValue);
}

export async function markDelivery(id, current) {
  const newValue = current == 1 ? 0 : 1;
  markDeliveryById(id, newValue);
}
