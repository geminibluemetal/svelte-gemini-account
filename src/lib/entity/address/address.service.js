import {
  checkAddressNameExists,
  deleteAddressById,
  fetchAllAddress,
  fetchSingleAddressByName,
  insertAddress,
  updateAddressById,
} from './address.dal';

export async function getAllAddress() {
  return await fetchAllAddress();
}

export async function createAddress(data) {
  if (!data.name) return { message: 'Name is Required', ok: false };
  if (data.name.includes('+') && !data.name.includes(' + ')) return { message: 'Add space between +', ok: false };

  const addressExist = await fetchSingleAddressByName(data.name);

  if (addressExist) {
    return { message: `'${data.name}' is already exists`, ok: false };
  }

  data.delivery_025 = parseFloat(data.delivery_025);
  data.delivery_050_100 = parseFloat(data.delivery_050_100);
  data.delivery_max = parseFloat(data.delivery_max);

  const result = await insertAddress(data);

  if (result?.acknowledged) {
    return { message: `Address created`, ok: true };
  }
}

export async function updateAddress(data, editId) {
  if (!data.name) {
    return { message: 'Name is Required', ok: false };
  }

  if (data.name.includes('+') && !data.name.includes(' + ')) {
    return { message: 'Add space between +', ok: false };
  }

  const addressExist = await checkAddressNameExists(data.name, editId);

  if (addressExist) {
    return { message: `'${data.name}' is already exists`, ok: false };
  }

  data.delivery_025 = parseFloat(data.delivery_025);
  data.delivery_050_100 = parseFloat(data.delivery_050_100);
  data.delivery_max = parseFloat(data.delivery_max);

  const result = await updateAddressById(data, editId);

  if (result?.acknowledged) {
    return { message: `Address updated`, ok: true };
  }
}

export async function deleteAddress(id) {
  const result = await deleteAddressById(id);

  if (result?.acknowledged) {
    return { message: `Address Deleted`, ok: true };
  } else {
    return { message: `Address Not Deleted`, ok: false };
  }
}
