import express, { Request, Response, NextFunction } from 'express';
import { sampleRouter } from './routes/sample.routes';
import { fileRouter } from './routes/file.routes';
import { AppError } from './errors';
import { ErrorResponse } from './types';
import { store } from './store';

const app = express();

// Enable CORS for client
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-api-key');
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});

app.use(express.json());

// Auto-seed initial demo dataset on startup
store.seedInitialData();

// Routes
app.use(sampleRouter);
app.use(fileRouter);

// 404 handler for unknown endpoints
app.use((_req: Request, res: Response<ErrorResponse>) => {
  res.status(404).json({ reason: 'The requested endpoint or resource ID does not exist' });
});

// Global error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: Request, res: Response<ErrorResponse>, _next: NextFunction) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ reason: err.reason });
    return;
  }
  res.status(500).json({ reason: 'Internal service error, please try again' });
});

export { app };
