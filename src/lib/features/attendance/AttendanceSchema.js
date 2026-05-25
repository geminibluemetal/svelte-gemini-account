// src/lib/features/attendance/AttendanceSchema.js
import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

// Dynamic object value transformer
const dynamicValueSchema = z.string().transform((val) => {
  const num = Number(val);

  // If it's not a valid number string, return null or keep as is.
  if (isNaN(num)) return val;

  // Business rule: if it's -1, transform to null
  if (num === -1) return null;

  // Otherwise, return the parsed number (handles 0, positive numbers, etc.)
  return num;
});

export const attendanceSchema = z.object({
  date: z.coerce.date({
    required_error: 'Date is required',
    invalid_type_error: 'Invalid date format',
  }),

  nameId: z
    .string({ required_error: 'Name is Required' })
    .regex(objectIdRegex, { message: 'Invalid Name ID format' }),
  fields: z.record(z.string(), dynamicValueSchema),
});
