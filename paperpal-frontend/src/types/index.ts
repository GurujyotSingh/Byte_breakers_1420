export * from "./document.types";
export * from "./journal.types";
export * from "./citation.types";
export * from "./formatting.types";
export * from "./api.types";
export * from "./compliance.types";

// Re-export commonly used types
export type {
  Document,
  DocumentStructure,
  Section,
  Citation,
  Reference,
  Author,
  Table,
  Figure
} from "./document.types";

export type {
  FormattingRules,
  CitationStyle,
  ComplianceReport,
  ComplianceIssue,
  FormattingChange
} from "./formatting.types";

export type {
  Journal,
  JournalStyle
} from "./journal.types";