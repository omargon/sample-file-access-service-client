import { randomUUID } from 'node:crypto';
import { store } from '../store';
import { QCStatus, UpdateQCStatusResponse, DownloadRequestResponse } from '../types';
import { NotFoundError, BadRequestError, ForbiddenError } from '../errors';

const DEFAULT_EXPIRATION_HOURS = 24;

export class FileService {
  public updateQCStatus(
    fileId: string,
    qcStatus: QCStatus
  ): UpdateQCStatusResponse {
    if (qcStatus !== 'passed' && qcStatus !== 'failed') {
      throw new BadRequestError("qcStatus must be either 'passed' or 'failed'");
    }

    const file = store.getFile(fileId);
    if (!file) {
      throw new NotFoundError();
    }

    file.qcStatus = qcStatus;
    store.saveFile(file);

    return {
      fileId: file.id,
      qcStatus: file.qcStatus,
      message: 'File QC status updated',
    };
  }

  public requestDownload(
    userId: string,
    fileId: string
  ): DownloadRequestResponse {
    const file = store.getFile(fileId);
    if (!file) {
      throw new NotFoundError();
    }

    const sample = store.getSample(file.sampleId);
    if (!sample) {
      throw new NotFoundError();
    }

    const isPermitted =
      sample.ownerId === userId || sample.grantedUserIds.has(userId);

    if (!isPermitted) {
      throw new ForbiddenError();
    }

    if (file.qcStatus !== 'passed') {
      throw new ForbiddenError();
    }

    const expiresAt = new Date(Date.now() + DEFAULT_EXPIRATION_HOURS * 60 * 60 * 1000);
    const expirationTimestamp = expiresAt.toISOString();
    const token = randomUUID();
    const downloadURL = `https://download.example.com/files/${file.id}?token=${token}&expires=${Math.floor(expiresAt.getTime() / 1000)}`;

    return {
      downloadURL,
      fileId: file.id,
      expiration_timestamp: expirationTimestamp,
      message: `DownloadURL will expire in ${DEFAULT_EXPIRATION_HOURS} hours (${expirationTimestamp})`,
    };
  }
}

export const fileService = new FileService();
