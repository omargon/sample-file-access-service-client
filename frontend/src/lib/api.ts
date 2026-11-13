import {
  User,
  SampleSummary,
  SampleDetail,
  RegisterSampleResponse,
  GrantAccessResponse,
  UpdateQCStatusResponse,
  DownloadRequestResponse,
} from '../types';

// In browser, use /api/backend rewrite; on server, use process.env.BACKEND_URL
const BASE_URL = typeof window !== 'undefined'
  ? '/api/backend'
  : (process.env.BACKEND_URL || 'http://localhost:3001');

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data?.reason || `HTTP error ${res.status}: ${res.statusText}`;
    throw new Error(errorMsg);
  }
  return data as T;
}

export const api = {
  async getUsers(): Promise<User[]> {
    const res = await fetch(`${BASE_URL}/users`, { cache: 'no-store' });
    const data = await handleResponse<{ users: User[] }>(res);
    return data.users;
  },

  async getSamples(apiKey: string): Promise<SampleSummary[]> {
    const res = await fetch(`${BASE_URL}/samples`, {
      headers: {
        'x-api-key': apiKey,
      },
      cache: 'no-store',
    });
    const data = await handleResponse<{ samples: SampleSummary[] }>(res);
    return data.samples;
  },

  async getSample(sampleId: string, apiKey: string): Promise<SampleDetail> {
    const res = await fetch(`${BASE_URL}/sample/${encodeURIComponent(sampleId)}`, {
      headers: {
        'x-api-key': apiKey,
      },
      cache: 'no-store',
    });
    return handleResponse<SampleDetail>(res);
  },

  async createSample(
    apiKey: string,
    sampleName: string,
    files?: string[]
  ): Promise<RegisterSampleResponse> {
    const res = await fetch(`${BASE_URL}/sample`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({ sampleName, files }),
    });
    return handleResponse<RegisterSampleResponse>(res);
  },

  async grantAccess(
    apiKey: string,
    sampleId: string,
    userId: string
  ): Promise<GrantAccessResponse> {
    const res = await fetch(`${BASE_URL}/sample/${encodeURIComponent(sampleId)}/access`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({ userId }),
    });
    return handleResponse<GrantAccessResponse>(res);
  },

  async updateQCStatus(
    apiKey: string,
    fileId: string,
    qcStatus: 'passed' | 'failed'
  ): Promise<UpdateQCStatusResponse> {
    const res = await fetch(`${BASE_URL}/file/${encodeURIComponent(fileId)}/qc`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({ qcStatus }),
    });
    return handleResponse<UpdateQCStatusResponse>(res);
  },

  async requestDownload(
    apiKey: string,
    fileId: string
  ): Promise<DownloadRequestResponse> {
    const res = await fetch(`${BASE_URL}/file/${encodeURIComponent(fileId)}/download-request`, {
      headers: {
        'x-api-key': apiKey,
      },
    });
    return handleResponse<DownloadRequestResponse>(res);
  },

  async resetAndSeed(): Promise<{ message: string }> {
    const res = await fetch(`${BASE_URL}/dev/seed`, {
      method: 'POST',
    });
    return handleResponse<{ message: string }>(res);
  },
};
