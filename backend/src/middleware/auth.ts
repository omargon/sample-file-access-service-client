import { Request, Response, NextFunction } from 'express';
import { User, ErrorResponse } from '../types';
import { store } from '../store';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export function authenticate(
  req: Request,
  res: Response<ErrorResponse>,
  next: NextFunction
): void {
  const apiKeyHeader = req.headers['x-api-key'];
  const apiKey = Array.isArray(apiKeyHeader) ? apiKeyHeader[0] : apiKeyHeader;

  if (!apiKey) {
    res.status(401).json({ reason: 'Authentication is missing or invalid' });
    return;
  }

  const user = store.getUserByApiKey(apiKey);
  if (!user) {
    res.status(401).json({ reason: 'Authentication is missing or invalid' });
    return;
  }

  req.user = user;
  next();
}

export function requirePipeline(
  req: Request,
  res: Response<ErrorResponse>,
  next: NextFunction
): void {
  if (!req.user || !req.user.isPipeline) {
    res.status(403).json({ reason: 'User lacks permission' });
    return;
  }
  next();
}
