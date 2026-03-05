import { ComplianceIssue, FormattingChange } from './formatting.types';

export interface ComplianceCategory {
  name: string;
  score: number;
  weight: number;
  maxScore: number;
  issues: ComplianceIssue[];
}

export interface ComplianceSummary {
  totalIssues: number;
  criticalIssues: number;
  warningIssues: number;
  infoIssues: number;
  autoFixable: number;
}

export interface ComplianceHistory {
  date: Date;
  score: number;
  changes: number;
}

export interface ComplianceThreshold {
  category: string;
  minimum: number;
  recommended: number;
  excellent: number;
}

export interface ComplianceExport {
  format: 'pdf' | 'json' | 'csv';
  includeDetails: boolean;
  includeSuggestions: boolean;
}