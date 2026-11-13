export class AppError extends Error {
  public readonly statusCode: number;
  public readonly reason: string;

  constructor(statusCode: number, reason: string) {
    super(reason);
    this.statusCode = statusCode;
    this.reason = reason;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(reason = 'The requested endpoint or resource ID does not exist') {
    super(404, reason);
  }
}

export class ForbiddenError extends AppError {
  constructor(reason = 'User lacks permission') {
    super(403, reason);
  }
}

export class BadRequestError extends AppError {
  constructor(reason: string) {
    super(400, reason);
  }
}

export class UnauthorizedError extends AppError {
  constructor(reason = 'Authentication is missing or invalid') {
    super(401, reason);
  }
}
