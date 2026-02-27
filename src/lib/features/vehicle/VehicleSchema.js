import { z } from 'zod';

const indianVehicleRegex = /^(?:[A-Z]{2}\d{2}[A-Z]{1,3}\d{4}|[A-Z]{2}\d{2}\s\d{4})$/; // TN12BX9898

export const vehicleSchema = z.object({
  fullNumber: z
    .string()
    .toUpperCase()
    .regex(indianVehicleRegex, {
      message: 'Invalid Indian vehicle number format. Example: KA01AB1234 or KA01 1234',
    })
    .nullable(),
  shortNumber: z.string().min(2),
  isCompanyVehicle: z.boolean().default(false),
  bodyCapacity: z.array(z.number()).default([]),
  createdAt: z.date().optional().nullable(),
  updatedAt: z.date().optional().nullable(),
});
