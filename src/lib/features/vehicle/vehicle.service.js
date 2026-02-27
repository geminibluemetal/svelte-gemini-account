import {
  checkVehicleShortNameExists,
  deleteVehicleById,
  fetchAllVehicle,
  fetchSingleVehicleByShortName,
  insertVehicle,
  updateVehicleById,
} from './vehicle.dal';

export async function getAllVehicle() {
  return fetchAllVehicle();
}

export async function createVehicle(data) {
  if (!data.short_number) {
    return { message: 'Short Name is Required', ok: false };
  }

  const vehicleExist = await fetchSingleVehicleByShortName(data.short_number);

  if (vehicleExist) {
    return { message: `'${data.short_number}' is already exists`, ok: false };
  }

  const result = await insertVehicle(data);

  if (result?.acknowledged) {
    return { message: `Vehicle created`, ok: true };
  }
}

export async function updateVehicle(data, editId) {
  if (!data.short_number) {
    return { message: 'Short Number is Required', ok: false };
  }

  const vehicleExist = await checkVehicleShortNameExists(data.short_number, editId);

  if (vehicleExist) {
    return { message: `'${data.short_number}' is already exists`, ok: false };
  }

  const result = await updateVehicleById(data, editId);

  if (result?.acknowledged) {
    return { message: `Vehicle updated`, ok: true };
  }
}

export async function deleteVehicle(id) {
  const result = await deleteVehicleById(id);

  if (result?.acknowledged) {
    return { message: `Vehicle Deleted`, ok: true };
  } else {
    return { message: `Vehicle Not Deleted`, ok: false };
  }
}
