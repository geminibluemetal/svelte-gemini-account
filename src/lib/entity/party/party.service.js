import {
  checkPartyNameExists,
  deletePartyById,
  fetchAllParty,
  fetchSinglePartyById,
  fetchSinglePartyByName,
  insertParty,
  updatePartyById,
} from './party.dal';
import {
  deletePartyStatementById,
  fetchAllBalanceForParty,
  fetchAllOldBalanceByDate,
  fetchPartyStatementByPartyId,
  insertPartyOldBalance,
  signOldBalance,
  updatePartyOldBalance,
} from './party.statements.dal';

export async function getAllParty() {
  return await fetchAllParty();
}

export async function getSingleParty(id) {
  return await fetchSinglePartyById(id);
}

export async function createParty(data) {
  if (!data.name) {
    return { message: 'Name is Required', ok: false };
  }

  if (data.name.includes('+') && !data.name.includes(' + ')) {
    return { message: 'Add space between +', ok: false };
  }

  const partyExist = await fetchSinglePartyByName(data.name);

  if (partyExist) {
    return { message: `'${data.name}' is already exists`, ok: false };
  }

  const result = await insertParty(data);

  if (result?.acknowledged) {
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

  const partyExist = await checkPartyNameExists(data.name, editId);

  if (partyExist) {
    return { message: `'${data.name}' is already exists`, ok: false };
  }

  const result = await updatePartyById(data, editId);

  if (result?.acknowledged) {
    return { message: `Party updated`, ok: true };
  }
}

export async function deleteParty(id) {
  const result = await deletePartyById(id);

  if (result?.acknowledged) {
    return { message: `Party Deleted`, ok: true };
  } else {
    return { message: `Party Not Deleted`, ok: false };
  }
}

export async function createOldBalance(data) {
  if (!data.party_id) return { message: 'Party is required', ok: false };
  if (!data.amount_type) return { message: 'Amount Type is required', ok: false };
  if (!data.amount) return { message: 'Amount is required', ok: false };
  if (!data.entry_type) return { message: 'Entry Type Missing', ok: false };
  if (data.amount && isNaN(Number(data.amount)))
    return { message: 'Amount should be number', ok: false };

  const result = await insertPartyOldBalance(data);
  if (result?.acknowledged) {
    return { message: `Old Balance Added`, ok: true };
  } else {
    return { message: `Old Balance Not Added`, ok: false };
  }
}

export async function updateOldBalance(data, id) {
  if (Number(data.sign)) return { message: 'Can not edit Signed Old Balance', ok: false };
  if (!data.party_id) return { message: 'Party is required', ok: false };
  if (!data.amount_type) return { message: 'Amount Type is required', ok: false };
  if (!data.amount) return { message: 'Amount is required', ok: false };
  if (!data.entry_type) return { message: 'Entry Type Missing', ok: false };
  if (data.amount && isNaN(Number(data.amount)))
    return { message: 'Amount should be number', ok: false };

  const result = await updatePartyOldBalance(data, id);
  if (result?.acknowledged) {
    return { message: `Old Balance Added`, ok: true };
  } else {
    return { message: `Old Balance Not Added`, ok: false };
  }
}

export async function getAllOldBalance(date) {
  return await fetchAllOldBalanceByDate(date);
}

export async function signOldBalanceById(id, current) {
  const newValue = current == 1 ? 0 : 1;
  return await signOldBalance(id, newValue);
}

export async function deleteOldBalance(id) {
  deletePartyStatementById(id);
}

export async function getAllBalance(type) {
  return await fetchAllBalanceForParty(type);
}

export async function getPartyStatement(id) {
  return await fetchPartyStatementByPartyId(id);
}
