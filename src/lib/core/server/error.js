export default class AppError extends Error {
  constructor(message) {
    super(message);
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
