import { calculateAmount } from '$lib/core/helper';
import { connectDB } from '$lib/core/server/mongodb';
import { ObjectId } from 'mongodb';
import { fetchSingleAddressByName } from '../address/address.dal';
import { fetchSingleItemByName } from '../items/items.dal';
import { examineStatusByQuantity } from '../orders/order.service';

const collectionName = 'delivery'; // Token also uses delivery table

export async function fetchAllDeliveryByDate(date) {
  const selectedDate = new Date(date);
  // Start of day (00:00:00.000)
  const startingDay = new Date(selectedDate);
  startingDay.setHours(0, 0, 0, 0);
  // End of day (23:59:59.999)
  const endingDay = new Date(selectedDate);
  endingDay.setHours(23, 59, 59, 999);

  const db = await connectDB();
  const result = await db
    .collection(collectionName)
    .find({ created_at: { $gte: startingDay, $lte: endingDay } })
    .toArray();
  return result;
}

export async function fetchDeliveryById(id) {
  const db = await connectDB();
  const result = await db.collection(collectionName).findOne({ _id: new ObjectId(id) });
  return result;
}

export async function fetchLastSerialByDate(date = new Date()) {
  const selectedDate = new Date(date);
  // Start of day
  const startingDay = new Date(selectedDate);
  startingDay.setHours(0, 0, 0, 0);
  // End of day
  const endingDay = new Date(selectedDate);
  endingDay.setHours(23, 59, 59, 999);

  const db = await connectDB();
  const result = await db
    .collection(collectionName)
    .find({ created_at: { $gte: startingDay, $lte: endingDay } })
    .sort({ serial: -1 }) // highest serial first
    .limit(1)
    .toArray();
  return result.length > 0 ? result[0].serial : 0;
}

export async function insertToken(data) {
  const db = await connectDB();
  const document = {
    party_name: data.party_name ?? null,
    vehicle: data.vehicle ?? '',
    token_item: data.token_item ?? '',
    tokenQuantity: data.tokenQuantity ? Number(data.tokenQuantity) : 0,
    is_cancelled: data.is_cancelled ?? false,
    serial: data.serial ?? 0,
    tokenTime: data.tokenTime ?? null,
    created_at: new Date(), // recommended
  };
  const result = await db.collection(collectionName).insertOne(document);
  return result;
}

export async function updateTokenById(data, id) {
  const db = await connectDB();
  const document = {
    party_name: data.party_name ?? null,
    vehicle: data.vehicle ?? '',
    token_item: data.token_item ?? '',
    tokenQuantity: data.tokenQuantity ? Number(data.tokenQuantity) : 0,
    is_cancelled: data.is_cancelled ? Boolean(data.is_cancelled) : false,
    tokenTime: data.tokenTime ?? null,
  };
  const result = await db
    .collection(collectionName)
    .updateOne({ _id: new ObjectId(id) }, { $set: document });
  return result;
}

export async function syncOrderFromDelivery(oldDelivery, newDelivery) {
  const db = await connectDB();
  const ordersCollection = db.collection('orders');

  const num = (val) => Number(val) || 0;

  // 🔹 UPDATE OLD ORDER (subtract)
  if (oldDelivery?.order_number) {
    const oldOrder = await ordersCollection.findOne({
      order_number: oldDelivery.order_number,
    });

    if (oldOrder) {
      const deliveredQty = num(oldOrder.deliveredQty) - num(oldDelivery.deliveryQuantity);
      const balanceQty = num(oldOrder.totalQty) - deliveredQty;
      const status = examineStatusByQuantity(num(oldOrder.totalQty), deliveredQty, balanceQty);

      const delivery_sheet_verified = oldDelivery.sign
        ? num(oldOrder.delivery_sheet_verified) - 1
        : num(oldOrder.delivery_sheet_verified);

      await ordersCollection.updateOne(
        { order_number: oldOrder.order_number },
        {
          $set: {
            deliveredQty,
            balanceQty,
            status,
            delivery_sheet_verified,
          },
        },
      );
    }
  }

  // 🔹 UPDATE NEW ORDER (add)
  if (newDelivery?.order_number) {
    const newOrder = await ordersCollection.findOne({
      order_number: newDelivery.order_number,
    });

    if (newOrder) {
      const deliveredQty = num(newOrder.deliveredQty) + num(newDelivery.deliveryQuantity);

      const balanceQty = num(newOrder.totalQty) - deliveredQty;

      const status = examineStatusByQuantity(num(newOrder.totalQty), deliveredQty, balanceQty);

      const delivery_sheet_verified = newDelivery.sign
        ? num(newOrder.delivery_sheet_verified) + 1
        : num(newOrder.delivery_sheet_verified);

      await ordersCollection.updateOne(
        { order_number: newOrder.order_number },
        {
          $set: {
            deliveredQty,
            balanceQty,
            status,
            delivery_sheet_verified,
          },
        },
      );
    }
  }
}

export async function syncLedgerFromDelivery(delivery) {
  const db = await connectDB();
  const statements = db.collection('party_statements');
  const parties = db.collection('parties');

  const num = (val) => Number(val) || 0;

  const isAc = delivery.amountType1 === 'AC' || delivery.amountType2 === 'AC';
  const party_name = delivery.party_name;
  const isCancelled = delivery.is_cancelled;

  let amount =
    (delivery.amountType1 === 'AC' ? num(delivery.amount1) : 0) +
    (delivery.amountType2 === 'AC' ? num(delivery.amount2) : 0);

  // 🔹 Calculate fallback amount
  if (!amount) {
    const address = await fetchSingleAddressByName(delivery.address);
    const item = await fetchSingleItemByName(delivery.delivery_item);
    const amountResult = calculateAmount(address, item, delivery.deliveryQuantity);
    if (!amountResult.success) {
      return amountResult;
    }
    amount = amountResult.data;
  }

  // 🔹 DELETE existing statement for this delivery
  await statements.deleteMany({
    delivery_id: new ObjectId(delivery._id),
  });

  // 🔹 Stop if cancelled / not AC / no party
  if (isCancelled || !isAc || !party_name) {
    return { success: true };
  }

  // 🔹 Get Party
  const party = await parties.findOne({ name: party_name });

  if (!party) {
    return { success: false, message: 'Party not found' };
  }

  // 🔹 CREATE new statement
  const document = {
    party_id: party._id,
    delivery_id: new ObjectId(delivery._id),
    amountType: null,
    entryType: 'DEBIT',
    amount: amount,
    item: delivery.delivery_item ?? null,
    qty: num(delivery.deliveryQuantity),
    vehicle: delivery.vehicle ?? null,
    address: delivery.address ?? null,
    created_at: new Date(delivery.delivered_aT),
    sign: delivery.sign ? 1 : 0,
  };

  const result = await statements.insertOne(document);
  if (result.insertedId) {
    return { success: true };
  }
  return { success: false };
}

export async function updateDeliveryById(data, id) {
  const db = await connectDB();
  const delivery = db.collection('delivery');

  // 🔹 Get old delivery
  const oldDelivery = await delivery.findOne({
    _id: new ObjectId(id),
  });

  if (!oldDelivery) {
    return { message: 'Delivery Not Found', ok: false };
  }

  const updateFields = {
    order_number: data.order_number ?? null,
    party_name: data.party_name ?? null,
    address: data.address ?? null,
    delivered_aT: data.delivered_aT
      ? new Date(data.delivered_aT)
      : (oldDelivery.delivered_aT ?? null),
    delivery_item: data.delivery_item ?? null,
    deliveryQuantity: data.deliveryQuantity !== undefined ? Number(data.deliveryQuantity) || 0 : 0,
    amountType1: data.amountType1 ?? null,
    amount1: data.amount1 !== undefined ? Number(data.amount1) || 0 : 0,
    is_cancelled: data.is_cancelled !== undefined ? Boolean(data.is_cancelled) : false,
  };

  // 🔹 Update Delivery (overwrite all fields)
  const result = await delivery.updateOne({ _id: new ObjectId(id) }, { $set: updateFields });

  if (!result.modifiedCount) {
    return { message: 'Delivery Not Updated', ok: false };
  }

  // 🔹 Get updated delivery
  const newDelivery = await delivery.findOne({
    _id: new ObjectId(id),
  });

  // 🔹 Sync Related Systems
  await syncOrderFromDelivery(oldDelivery, newDelivery);
  const syncResult = await syncLedgerFromDelivery(newDelivery);

  return syncResult;
}

export async function updateDeliveryAmountById(data, id) {
  const db = await connectDB();
  const delivery = db.collection('delivery');

  const hasAmount = data.amount1 || data.amountType1 || data.amount2 || data.amountType2;

  const updateFields = {
    amountTime: hasAmount ? new Date() : null,
    amountType1: data.amountType1 ?? null,
    amount1: data.amount1 !== undefined ? Number(data.amount1) || 0 : 0,
    amountType2: data.amountType2 ?? null,
    amount2: data.amount2 !== undefined ? Number(data.amount2) || 0 : 0,
  };

  const result = await delivery.updateOne({ _id: new ObjectId(id) }, { $set: updateFields });

  if (!result.modifiedCount) {
    return { message: 'Delivery Amount not Updated', ok: false };
  }

  const newDelivery = await delivery.findOne({
    _id: new ObjectId(id),
  });

  return await syncLedgerFromDelivery(newDelivery);
}

export async function signDelivery(id, newValue) {
  const db = await connectDB();
  const session = db.client.startSession();

  try {
    await session.withTransaction(async () => {
      const delivery = db.collection('delivery');
      const orders = db.collection('orders');
      const statements = db.collection('party_statements');

      const currnetDelivery = await delivery.findOne({ _id: new ObjectId(id) }, { session });

      if (!currnetDelivery) {
        throw new Error('Delivery not found');
      }

      const adjustment = newValue ? 1 : -1;

      // Update order counter
      await orders.updateOne(
        { order_number: currnetDelivery.order_number },
        { $inc: { delivery_sheet_verified: adjustment } },
        { session },
      );

      // Update statement sign
      await statements.updateMany(
        { delivery_id: currnetDelivery._id },
        { $set: { sign: newValue ? 1 : 0 } },
        { session },
      );

      // Update currnetDelivery sign
      await currnetDelivery.updateOne(
        { _id: currnetDelivery._id },
        { $set: { sign: newValue ? 1 : 0 } },
        { session },
      );
    });

    return { ok: true };
  } finally {
    await session.endSession();
  }
}

export async function markDeliveryById(id, value) {
  const db = await connectDB();
  return await db
    .collection('delivery')
    .updateOne({ _id: new ObjectId(id) }, { $set: { has_mark: Boolean(value) } });
}

export async function deleteTokenById(id) {
  const db = await connectDB();
  const delivery = db.collection('delivery');
  const deliveryId = new ObjectId(id);
  return await delivery.deleteOne({ _id: deliveryId });
}

export async function getAllDeliveryCash(date) {
  const db = await connectDB();
  const delivery = db.collection('delivery');
  const selectedDate = new Date(date);
  const start = new Date(selectedDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(selectedDate);
  end.setHours(23, 59, 59, 999);

  return await delivery
    .aggregate([
      {
        $match: {
          amountTime: { $gte: start, $lte: end },
          $or: [
            { amountType1: 'CP', amount1: { $ne: 0 } },
            { amountType2: 'CP', amount2: { $ne: 0 } },
          ],
        },
      },
      {
        $addFields: {
          serial: { $concat: ['DS-', { $toString: '$serial' }] },
          description: {
            $trim: {
              input: {
                $concat: [{ $ifNull: ['$party_name', ''] }, ', ', { $ifNull: ['$address', ''] }],
              },
            },
          },
          amount: {
            $add: [
              {
                $cond: [{ $eq: ['$amountType1', 'CP'] }, '$amount1', 0],
              },
              {
                $cond: [{ $eq: ['$amountType2', 'CP'] }, '$amount2', 0],
              },
            ],
          },
          source: 'DELIVERY',
        },
      },
      {
        $project: {
          id: '$_id',
          serial: 1,
          time: '$amountTime',
          description: 1,
          amount: 1,
          sign: 1,
          created_at: 1,
          source: 1,
        },
      },
    ])
    .toArray();
}
