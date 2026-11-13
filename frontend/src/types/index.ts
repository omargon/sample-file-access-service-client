export type QCStatus = 'pending' | 'passed' | 'failed';

export interface User {
  id: string;
  name: string;
  apiKey: string;
  isPipeline?: boolean;
}

export interface FileRecord {
  id: string;
  name: string;
  sampleId: string;
  qcStatus: QCStatus;
}

export interface FileDetail {
  fileId: string;
  fileName: string;
  qcStatus: QCStatus;
  canDownload: boolean;
}

export interface SampleSummary {
  id: string;
  name: string;
  ownerId: string;
  ownerName: string;
  fileCount: number;
  grantedUserIds: string[];
  isOwner: boolean;
  hasAccess: boolean;
  files: FileRecord[];
}

export interface SampleDetail {
  sampleId: string;
  sampleName: string;
  ownerId: string;
  ownerName: string;
  grantedUserIds: string[];
  isOwner: boolean;
  hasAccess: boolean;
  files: FileDetail[];
}

export interface RegisterSampleResponse {
  sampleId: string;
  sampleName: string;
  files: Array<{
    fileId: string;
    fileName: string;
    qcStatus: QCStatus;
  }>;
}

export interface GrantAccessResponse {
  userId: string;
  sampleId: string;
  message: string;
}

export interface UpdateQCStatusResponse {
  fileId: string;
  qcStatus: QCStatus;
  message: string;
}

export interface DownloadRequestResponse {
  downloadURL: string;
  fileId: string;
  expiration_timestamp: string;
  message: string;
}

export interface ApiError {
  reason: string;
}
