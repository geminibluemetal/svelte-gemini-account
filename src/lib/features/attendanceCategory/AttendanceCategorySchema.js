// src\lib\features\attendanceCategory\AttendanceCategorySchema.js
import { z } from 'zod';

// 1. Schema for the individual objects inside the 'fields' array
const fieldSchema = z.object({
  id: z.string().min(1, "ID is required"),
  shortName: z.string().min(1, "Short name is required"),
  longName: z.string().min(1, "Long name is required"),
  amount: z.coerce.number().nonnegative("Amount must be a positive number or zero"),
  isHidden: z.coerce.boolean().default(false)
});

const calculationRuleSchema = z.object({
  id: z.string().min(1, "ID is required"),
  name: z.string().min(1, "Name is required"),
  key: z.string().min(1, "Kame is required"),
  rule: z.string().min(1, "Rule is required"),
});

// 2. Schema for the main category object
export const attendanceCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  fields: z.array(fieldSchema).default([]),
  calculationRule: z.array(calculationRuleSchema).default([]),
});