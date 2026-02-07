import { printOut } from "$lib/core/server/print"
import { formatDateTime, getFormattedTime } from "$lib/utils/dateTime"
import { fetchAllDeliveryByDate, fetchLastSerialByDate, insertDelivery } from "../delivery/delivery.dal"

export async function getAllToken(date = formatDateTime('YY-MM-DD')) {
  return fetchAllDeliveryByDate(date)
}

export async function createToken(data) {
  if (!data.vehicle) return { message: "Vehicle is Required", ok: false }
  if (!data.token_item) return { message: "Item is Required", ok: false }
  if (!data.token_quantity) return { message: "Quantity is Required", ok: false }
  if (data.token_quantity && isNaN(Number(data.token_quantity))) return { message: "Quantity should be a number", ok: false }

  let serial = fetchLastSerialByDate(formatDateTime('YY-MM-DD'))
  serial = Number(serial) + 1

  data.serial = serial
  data.token_time = getFormattedTime()
  const result = insertDelivery(data)
  if (result?.changes) {
    printToken({
      ""
    })
    return { message: `Token created`, ok: true }
  }
}

export async function printToken(data) {
  await printOut((p) => {
    p.reset()
      .beepOn(1, 2)
      .align('center')
      .setTextSize(1, 0)
      .bold(true)
      .line("Single Cash Bill")
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
    p.dashedLine(24)
      .feed(2)
      .cut();
  });
}

// export async function updateVehicle(data, editId) {
//   if (!data.short_number) {
//     return { message: "Short Number is Required", ok: false }
//   }

//   const vehicleExist = checkVehicleShortNameExists(data.short_number, editId)

//   if (vehicleExist) {
//     return { message: `'${data.short_number}' is already exists`, ok: false }
//   }

//   const result = updateVehicleById(data, editId)

//   if (result?.changes) {
//     return { message: `Vehicle updated`, ok: true }
//   }
// }

// export async function deleteVehicle(id) {
//   const result = deleteVehicleById(id)

//   if (result?.changes) {
//     return { message: `Vehicle Deleted`, ok: true }
//   } else {
//     return { message: `Vehicle Not Deleted`, ok: false }
//   }
// }