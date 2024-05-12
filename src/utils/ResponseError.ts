export default class ResponseError extends Error {
  public status: string;
  public isOperational: boolean;

  constructor(message: string, public statusCode: number) {
    super(message);
    this.status = statusCode >= 400 && statusCode < 500 ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
