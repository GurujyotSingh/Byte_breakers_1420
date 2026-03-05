import { Citation } from './document.types';

export interface CitationValidation {
  id: string;
  citationId: string;
  valid: boolean;
  issues: string[];
  suggestions?: string[];
}

export interface CitationFormat {
  style: string;
  template: string;
  examples: string[];
}

export interface ReferenceValidation {
  id: string;
  referenceId: string;
  valid: boolean;
  missing: string[];
  suggestions: string[];
  doi?: string;
}

export interface CitationStyleGuide {
  name: string;
  inText: {
    authorYear: string;
    multipleAuthors: string;
    etAl: string;
    pageNumbers: string;
  };
  bibliography: {
    book: string;
    article: string;
    website: string;
    conference: string;
  };
}