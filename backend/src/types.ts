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

export interface Sample {
  id: string;
  name: string;
  ownerId: string;
  fileIds: string[];
  grantedUserIds: Set<string>;
}

export interface ErrorResponse {
  reason: string;
}

export interface RegisterSampleRequest {
  sampleName: string;
  files?: string[];
}

export interface FileSummary {
  fileId: string;
  fileName: string;
  qcStatus: QCStatus;
}

export interface RegisterSampleResponse {
  sampleId: string;
  sampleName: string;
  files: FileSummary[];
}

export interface GrantAccessRequest {
  userId: string;
  sampleId?: string;
}

export interface GrantAccessResponse {
  userId: string;
  sampleId: string;
  message: string;
}

export interface UpdateQCStatusRequest {
  fileId?: string;
  qcStatus: QCStatus;
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
