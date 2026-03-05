import { FormattingRules } from './formatting.types';

export interface Journal {
  id: string;
  name: string;
  publisher: string;
  style: string;
  rules: FormattingRules;
  impactFactor?: number;
  categories?: string[];
  openAccess?: boolean;
  description?: string;
  website?: string;
}

export interface JournalStyle {
  id: string;
  name: string;
  category: 'citation' | 'heading' | 'reference' | 'layout';
  description: string;
  rules: Record<string, any>;
}

export interface JournalCategory {
  id: string;
  name: string;
  icon?: string;
  journals: Journal[];
}