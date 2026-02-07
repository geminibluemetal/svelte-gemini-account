import {
  checkPartyNameExists,
  deletePartyById,
  fetchAllParty,
  fetchSinglePartyByName,
  insertParty,
  updatePartyById
} from './party.dal';

export async function getAllParty() {
  return fetchAllParty();
}

export async function createParty(data) {
  if (!data.name) {
    return { message: 'Name is Required', ok: false };
  }

  if (data.name.includes('+') && !data.name.includes(' + ')) {
    return { message: 'Add space between +', ok: false };
  }

  const partyExist = fetchSinglePartyByName(data.name);

  if (partyExist) {
    return { message: `'${data.name}' is already exists`, ok: false };
  }

  data.delivery_025 = parseFloat(data.delivery_025);
  data.delivery_050_100 = parseFloat(data.delivery_050_100);
  data.delivery_max = parseFloat(data.delivery_max);

  const result = insertParty(data);

  if (result?.changes) {
    return { message: `Party created`, ok: true };
  }
}

export async function updateParty(data, editId) {
  if (!data.name) {
    return { message: 'Name is Required', ok: false };
  }

  if (data.name.includes('+') && !data.name.includes(' + ')) {
    return { message: 'Add space between +', ok: false };
  }

  const partyExist = checkPartyNameExists(data.name, editId);

  if (partyExist) {
    return { message: `'${data.name}' is already exists`, ok: false };
  }

  data.delivery_025 = parseFloat(data.delivery_025);
  data.delivery_050_100 = parseFloat(data.delivery_050_100);
  data.delivery_max = parseFloat(data.delivery_max);

  const result = updatePartyById(data, editId);

  if (result?.changes) {
    return { message: `Party updated`, ok: true };
  }
}

export async function deleteParty(id) {
  const result = deletePartyById(id);

  if (result?.changes) {
    return { message: `Party Deleted`, ok: true };
  } else {
    return { message: `Party Not Deleted`, ok: false };
  }
}
