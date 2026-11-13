import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';
import { sampleService } from '../services/sample.service';
import { store } from '../store';
import {
  RegisterSampleRequest,
  RegisterSampleResponse,
  GrantAccessRequest,
  GrantAccessResponse,
  ErrorResponse,
} from '../types';

const router = Router();

router.get('/users', (_req: Request, res: Response) => {
  res.status(200).json({ users: store.listUsers() });
});

router.post('/dev/seed', (_req: Request, res: Response) => {
  store.forceSeedData();
  res.status(200).json({ message: 'Database reset and seeded successfully' });
});

router.get('/samples', authenticate, (req: Request, res: Response) => {
  const currentUserId = req.user!.id;
  const samples = store.listSamples().map((s) => ({
    id: s.id,
    name: s.name,
    ownerId: s.ownerId,
    ownerName: s.ownerName,
    fileCount: s.files.length,
    grantedUserIds: Array.from(s.grantedUserIds),
    isOwner: s.ownerId === currentUserId,
    hasAccess: s.ownerId === currentUserId || s.grantedUserIds.has(currentUserId),
    files: s.files,
  }));
  res.status(200).json({ samples });
});

router.get('/sample/:id', authenticate, (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const sample = store.getSample(req.params.id);
    if (!sample) {
      res.status(404).json({ reason: 'The requested endpoint or resource ID does not exist' });
      return;
    }
    const currentUserId = req.user!.id;
    const isOwner = sample.ownerId === currentUserId;
    const hasAccess = isOwner || sample.grantedUserIds.has(currentUserId);
    const owner = store.getUser(sample.ownerId);
    const files = store.getFilesForSample(sample.id).map((f) => ({
      fileId: f.id,
      fileName: f.name,
      qcStatus: f.qcStatus,
      canDownload: hasAccess && f.qcStatus === 'passed',
    }));

    res.status(200).json({
      sampleId: sample.id,
      sampleName: sample.name,
      ownerId: sample.ownerId,
      ownerName: owner ? owner.name : sample.ownerId,
      grantedUserIds: Array.from(sample.grantedUserIds),
      isOwner,
      hasAccess,
      files,
    });
  } catch (err) {
    next(err);
  }
});

router.post(
  '/sample',
  authenticate,
  (
    req: Request<object, RegisterSampleResponse | ErrorResponse, RegisterSampleRequest>,
    res: Response<RegisterSampleResponse | ErrorResponse>,
    next: NextFunction
  ) => {
    try {
      const { sampleName, files } = req.body;

      if (!sampleName || typeof sampleName !== 'string' || !sampleName.trim()) {
        res.status(400).json({ reason: 'sampleName is required and must be a non-empty string' });
        return;
      }

      if (files !== undefined && (!Array.isArray(files) || files.some((f) => typeof f !== 'string'))) {
        res.status(400).json({ reason: 'files must be an array of file name strings' });
        return;
      }

      const result = sampleService.createSample(
        req.user!.id,
        sampleName.trim(),
        files
      );

      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/sample/:id/access',
  authenticate,
  (
    req: Request<{ id: string }, GrantAccessResponse | ErrorResponse, GrantAccessRequest>,
    res: Response<GrantAccessResponse | ErrorResponse>,
    next: NextFunction
  ) => {
    try {
      const sampleId = req.params.id;
      const { userId } = req.body;

      if (!userId || typeof userId !== 'string' || !userId.trim()) {
        res.status(400).json({ reason: 'userId is required and must be a non-empty string' });
        return;
      }

      const result = sampleService.grantAccess(req.user!.id, sampleId, userId.trim());
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
);

export { router as sampleRouter };
