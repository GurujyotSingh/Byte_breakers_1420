export type FileType = 'pdf' | 'docx' | 'txt' | 'tex';

export interface Document {
  id: string;
  name: string;
  type: FileType;
  size: number;
  uploadedAt: Date;
  content: string;
  structure?: DocumentStructure;
}

export interface DocumentStructure {
  title?: string;
  authors?: Author[];
  abstract?: string;
  sections: Section[];
  citations: Citation[];
  references: Reference[];
  tables: Table[];
  figures: Figure[];
}

export interface Author {
  name: string;
  affiliation?: string;
  email?: string;
  orcid?: string;
}

export interface Section {
  id: string;
  level: number;
  title: string;
  content: string;
  subsections?: Section[];
}

export interface Citation {
  id: string;
  text: string;
  position: number;
  type: "author-year" | "numeric" | "footnote";
  isValid: boolean;
}

export interface Reference {
  id: string;
  raw: string;
  formatted: string;
  doi?: string;
  citations: string[];
}

export interface Table {
  id: string;
  caption: string;
  content: string;
  position: number;
}

export interface Figure {
  id: string;
  caption: string;
  src?: string;
  position: number;
}