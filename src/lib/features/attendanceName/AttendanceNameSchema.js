// src\lib\features\attendanceName\AttendanceNameSchema.js
import { z } from 'zod';

// Helper regex to validate a 24-character hex string (MongoDB ObjectId)
const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const attendanceNameSchema = z.object({
  name: z.string().min(1, "Name is required"),

  categoryId: z
    .preprocess((val) => (val === "" ? null : val), z.string().nullable())
    .nullable()
    .refine((val) => val === null || objectIdRegex.test(val), {
      message: "Category selection is invalid",
    }),

  overallAdvance: z.coerce.number().nonnegative("Amount must be a positive number or zero"),

  dayFee: z.coerce.number().nonnegative("Amount must be a positive number or zero"),
});
