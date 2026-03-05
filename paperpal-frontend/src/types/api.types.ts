import { ComplianceReport } from "./formatting.types";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  statusCode?: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UploadResponse {
  fileId: string;
  fileName: string;
  fileSize: number;
  uploadDate: Date;
  status: 'processing' | 'completed' | 'failed';
}

export interface FormatRequest {
  fileId: string;
  journalId: string;
  options?: {
    preserveTrackChanges?: boolean;
    generateReport?: boolean;
    validateOnly?: boolean;
  };
}

export interface FormatResponse {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  result?: ComplianceReport;
  downloadUrl?: string;
  error?: string;
}