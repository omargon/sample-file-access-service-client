import { randomUUID } from 'node:crypto';
import { store } from '../store';
import { Sample, FileRecord, RegisterSampleResponse, FileSummary, GrantAccessResponse } from '../types';
import { NotFoundError, ForbiddenError } from '../errors';

export class SampleService {
  public createSample(
    ownerId: string,
    sampleName: string,
    fileNames?: string[]
  ): RegisterSampleResponse {
    const sampleId = `sample_${randomUUID()}`;
    const fileIds: string[] = [];
    const filesSummary: FileSummary[] = [];

    const sample: Sample = {
      id: sampleId,
      name: sampleName,
      ownerId,
      fileIds,
      grantedUserIds: new Set<string>(),
    };

    // Save sample first so foreign key constraints on sample_files are satisfied
    store.saveSample(sample);

    if (Array.isArray(fileNames)) {
      for (const fileName of fileNames) {
        const fileId = `file_${randomUUID()}`;
        const fileRecord: FileRecord = {
          id: fileId,
          name: fileName,
          sampleId,
          qcStatus: 'pending',
        };
        store.saveFile(fileRecord);
        fileIds.push(fileId);
        filesSummary.push({
          fileId,
          fileName,
          qcStatus: 'pending',
        });
      }
    }

    return {
      sampleId,
      sampleName,
      files: filesSummary,
    };
  }

  public grantAccess(
    requesterId: string,
    sampleId: string,
    targetUserId: string
  ): GrantAccessResponse {
    const sample = store.getSample(sampleId);
    if (!sample) {
      throw new NotFoundError();
    }

    if (sample.ownerId !== requesterId) {
      throw new ForbiddenError();
    }

    const targetUser = store.getUser(targetUserId);
    if (!targetUser) {
      throw new NotFoundError();
    }

    sample.grantedUserIds.add(targetUserId);
    store.saveSample(sample);

    return {
      userId: targetUserId,
      sampleId,
      message: 'Access granted',
    };
  }
}

export const sampleService = new SampleService();
