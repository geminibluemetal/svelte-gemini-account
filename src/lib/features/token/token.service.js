import { printOut } from '$lib/core/server/print';
import { formatDateTime, getFormattedDate, getFormattedTime } from '$lib/utils/dateTime';
import { formatFixed } from '$lib/utils/number';
import {
  deleteTokenById,
  fetchAllDeliveryByDate,
  fetchDeliveryById,
  fetchLastSerialByDate,
  insertToken,
  updateTokenById,
} from '../delivery/delivery.dal';

export async function getAllToken(date = new Date()) {
  return await fetchAllDeliveryByDate(date);
}

export async function createToken(data, takePrint = true) {
  if (!data.vehicle) return { message: 'Vehicle is Required', ok: false };
  if (!data.token_item) return { message: 'Item is Required', ok: false };
  if (!data.token_quantity) return { message: 'Quantity is Required', ok: false };
  if (data.token_quantity && isNaN(Number(data.token_quantity)))
    return { message: 'Quantity should be a number', ok: false };

  let serial = await fetchLastSerialByDate();
  serial = Number(serial) + 1;

  data.serial = serial;
  data.token_quantity = Number(data.token_quantity);
  console.log(data);
  const result = await insertToken(data);

  if (result?.acknowledged) {
    if (takePrint) {
      printToken({
        Token: serial,
        Party: data.party_name,
        Vcle: data.vehicle,
        Item: data.token_item,
        Qty: formatFixed(data.token_quantity),
        Date: getFormattedDate(),
        Time: getFormattedTime(),
      });
    }
    return { message: `Token created`, ok: true, lastInsertRowid: result.lastInsertRowid };
  }
}

export async function printToken(data) {
  await printOut((p) => {
    p.reset()
      .beepOn(3, 1)
      .align('center')
      .setTextSize(1, 0)
      .bold(true)
      .line('Token')
      .bold(false)
      .dashedLine(17)
      .align('left');

    // Dynamically add pairs from data object
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        p.pairs(key, value);
      }
    });

    // Footer
    p.flushPairs().feed(1).cut();
  });
}

export async function updateToken(data, editId, takePrint = true) {
  if (data.delivery_item && data.delivery_quantity)
    return { message: 'Can not modify delivered token', ok: false };
  if (!data.vehicle) return { message: 'Vehicle is Required', ok: false };
  if (!data.token_item) return { message: 'Item is Required', ok: false };
  if (!data.token_quantity) return { message: 'Quantity is Required', ok: false };
  if (data.token_quantity && isNaN(Number(data.token_quantity)))
    return { message: 'Quantity should be a number', ok: false };

  const result = await updateTokenById(data, editId);
  if (result?.acknowledged) {
    if (takePrint) {
      const token = await fetchDeliveryById(editId);
      if (!token.is_cancelled)
        printToken({
          Token: token.serial,
          Party: token.party_name,
          Vcle: token.vehicle,
          Item: token.token_item,
          Qty: formatFixed(token.token_quantity),
          Date: getFormattedDate(),
          Time: getFormattedTime(),
        });
    }
    return { message: `Token updated`, ok: true };
  }
}

export async function deleteToken(id) {
  const token = fetchDeliveryById(id);
  let lastSerial = fetchLastSerialByDate(formatDateTime('YY-MM-DD'));
  if (token.serial != lastSerial) return { message: 'Can only delete last token', ok: false };
  if (token.delivery_item && token.delivery_quantity)
    return { message: "Can't Delete Delivered Token", ok: false };
  if (token.sign) return { message: "Can't Delete Signed Token", ok: false };

  const createdDate = new Date(token.created_at);
  if (getFormattedDate() != getFormattedDate(createdDate))
    return { message: "Can't delete old token", ok: false };

  const result = deleteTokenById(id);
  if (result.acknowledged) {
    return { message: 'Last Token Deleted', ok: true };
  }
}

export async function printTokenById(id) {
  const token = fetchDeliveryById(id);
  if (token) {
    printToken({
      Token: token.serial,
      Party: token.party_name,
      Vcle: token.vehicle,
      Item: token.token_item,
      Qty: formatFixed(token.token_quantity),
      Date: getFormattedDate(),
      Time: getFormattedTime(),
    });
  }
}
