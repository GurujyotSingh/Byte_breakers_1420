export interface FormattingRules {
  journalName: string;
  citationStyle: CitationStyle;
  headingStyles: HeadingStyle[];
  referenceFormat: ReferenceFormat;
  documentLayout: DocumentLayout;
  abstractFormat: AbstractFormat;
  figureTableRules: FigureTableRules;
}

export interface CitationStyle {
  type: string;  // Changed from union type to string
  version: string;
  inTextFormat: string;
  bibliographyFormat: string;
  rules: Record<string, any>;
}

export interface HeadingStyle {
  level: number;
  font: string;
  size: number;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  alignment: "left" | "center" | "right";
  case?: "uppercase" | "lowercase" | "capitalize";
}

export interface ReferenceFormat {
  order: "alphabetical" | "numeric" | "order-of-appearance";
  hangingIndent: boolean;
  lineSpacing: number;
  font?: string;
  fontSize?: number;
}

export interface DocumentLayout {
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  font: string;
  fontSize: number;
  lineSpacing: number;
  pageNumbers?: {
    position: "top" | "bottom";
    alignment: "left" | "center" | "right";
  };
}

export interface AbstractFormat {
  structured: boolean;
  wordLimit?: number;
  sections?: string[];
  keywords?: boolean;
}

export interface FigureTableRules {
  captionPosition: "above" | "below";
  numberingStyle: string;
  font?: string;
  fontSize?: number;
}

export interface ComplianceReport {
  overallScore: number;
  categories: {
    citations: number;
    headings: number;
    references: number;
    layout: number;
    figures: number;
    abstract: number;
  };
  issues: ComplianceIssue[];
  changes: FormattingChange[];
  journalName?: string;
}

export interface ComplianceIssue {
  id: string;
  type: string;
  severity: "high" | "medium" | "low";
  location: string;
  description: string;
  suggestion: string;
  rule: string;
  message?: string;
}
export interface FormattingChange {
  id: string;
  type: string;
  original: string;
  new: string;
  location: string;
  rule: string;
  confidence: number;
  timestamp?: Date;
  // Remove these duplicates:
  // original?: string;
  // formatted?: string;
}