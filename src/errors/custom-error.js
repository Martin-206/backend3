export class CustomError extends Error {
  constructor({ code, statusCode, message }, details = null) {
    super(message);
    this.name = 'CustomError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace?.(this, CustomError);
  }

  static create(errorDefinition, details = null) {
    return new CustomError(errorDefinition, details);
  }
}
