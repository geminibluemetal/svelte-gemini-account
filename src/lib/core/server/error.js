import { serializeDoc } from '$lib/utils/serializer';

export default class AppError extends Error {
  constructor(message) {
    super(message);
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function schemaError(parsed) {
  const fieldErrors = parsed.error.flatten().fieldErrors;
  // Object.values gives arrays, flat() merges them, [0] picks the first
  const firstError = Object.values(fieldErrors).flat()[0];
  if (firstError) {
    throw new AppError(firstError, 400);
  }
}

export function handleServiceError(error) {
  if (error instanceof AppError) {
    return { ok: false, message: error.message };
  } else if (error instanceof Error) {
    console.log(error);
    return { ok: false, message: 'Something Went Wrong' };
  } else if (typeof error == 'string') {
    console.log(error);
    return { ok: false, message: error };
  } else {
    console.log(error);
    return { ok: false, message: 'Something Went Wrong' };
  }
}

export function handleSuccess(message, data) {
  return { ok: true, message: message ? message : 'Operation Success', data: serializeDoc(data) };
}
