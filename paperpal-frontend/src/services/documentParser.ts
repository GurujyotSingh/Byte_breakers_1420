import * as mammoth from 'mammoth';

// Use require for pdf-parse (this works 100% in browser)
import pdfParse from 'pdf-parse';

export interface ParsedDocument {
  title: string;
  authors: string[];
  abstract: string;
  sections: Section[];
  citations: Citation[];
  references: Reference[];
  figures: Figure[];
  tables: Table[];
  metadata: {
    fileName: string;
    fileType: 'pdf' | 'docx' | 'txt';
    pageCount?: number;
    wordCount: number;
  };
}

export interface Section {
  level: number;
  title: string;
  content: string;
  subsections?: Section[];
}

export interface Citation {
  raw: string;
  type: 'author-year' | 'numbered' | 'author-page' | 'unknown';
  authors?: string[];
  year?: number;
  pages?: string;
  position: number;
}

export interface Reference {
  raw: string;
  authors?: string[];
  year?: number;
  title?: string;
  journal?: string;
  doi?: string;
}

export interface Figure {
  caption: string;
  imageUrl?: string;
  position: number;
}

export interface Table {
  caption: string;
  data?: any[][];
  position: number;
}

export class DocumentParser {
  
  async parseDocument(file: File): Promise<ParsedDocument> {
    const fileType = this.detectFileType(file);
    
    try {
      switch(fileType) {
        case 'pdf':
          return await this.parsePDF(file);
        case 'docx':
          return await this.parseDOCX(file);
        case 'txt':
          return await this.parseText(file);
        default:
          throw new Error(`Unsupported file type: ${fileType}`);
      }
    } catch (error) {
      console.error('Parse error:', error);
      throw new Error(`Failed to parse ${fileType} file: ${error.message}`);
    }
  }

  private detectFileType(file: File): string {
    const extension = file.name.split('.').pop()?.toLowerCase();
    const mimeType = file.type;
    
    if (extension === 'pdf' || mimeType === 'application/pdf') {
      return 'pdf';
    } else if (extension === 'docx' || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return 'docx';
    } else {
      return 'txt';
    }
  }

  private async parsePDF(file: File): Promise<ParsedDocument> {
    console.log('📄 Parsing PDF...');
    
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // FIXED: Directly use pdfParse - it's already required at the top
    const data = await pdfParse(buffer);
    const text = data.text;
    
    return this.parseStructureFromText(text, {
      fileName: file.name,
      fileType: 'pdf',
      pageCount: data.numpages,
      wordCount: text.split(/\s+/).length
    });
  }

  private async parseDOCX(file: File): Promise<ParsedDocument> {
    console.log('📘 Parsing DOCX...');
    
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    const text = result.value;
    
    return this.parseStructureFromText(text, {
      fileName: file.name,
      fileType: 'docx',
      wordCount: text.split(/\s+/).length
    });
  }

  private async parseText(file: File): Promise<ParsedDocument> {
    console.log('📃 Parsing Text...');
    
    const text = await file.text();
    
    return this.parseStructureFromText(text, {
      fileName: file.name,
      fileType: 'txt',
      wordCount: text.split(/\s+/).length
    });
  }

  private parseStructureFromText(text: string, metadata: any): ParsedDocument {
    return {
      title: this.extractTitle(text),
      authors: this.extractAuthors(text),
      abstract: this.extractAbstract(text),
      sections: this.extractSections(text),
      citations: this.extractAllCitations(text),
      references: this.extractReferences(text),
      figures: this.extractFigures(text),
      tables: this.extractTables(text),
      metadata
    };
  }

  private extractTitle(text: string): string {
    const lines = text.split('\n').filter(l => l.trim());
    return lines[0] || 'Untitled';
  }

  private extractAuthors(text: string): string[] {
    const authors: string[] = [];
    const authorMatch = text.match(/authors?:?\s*(.+?)(?:\n|$)/i);
    if (authorMatch) {
      authors.push(...authorMatch[1].split(',').map(a => a.trim()));
    }
    return authors;
  }

  private extractAbstract(text: string): string {
    const abstractMatch = text.match(/abstract\s*(.+?)(?:\n\s*\n|$)/is);
    return abstractMatch ? abstractMatch[1].trim() : '';
  }

  private extractSections(text: string): Section[] {
    const sections: Section[] = [];
    const lines = text.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (this.isHeading(line)) {
        sections.push({
          level: this.getHeadingLevel(line),
          title: line,
          content: lines[i + 1] || ''
        });
      }
    }
    return sections;
  }

  private isHeading(line: string): boolean {
    return !!(
      line.match(/^\d+\.\s+[A-Z]/) ||
      line.match(/^[A-Z\s]{5,}$/) ||
      line.match(/^[A-Z][a-z]+:$/) ||
      line.match(/^[A-Z][a-z]+\s+[A-Z][a-z]+$/)
    );
  }

  private getHeadingLevel(line: string): number {
    if (line.match(/^\d+\.\s+[A-Z]/)) return 2;
    if (line.match(/^[A-Z\s]{5,}$/)) return 1;
    return 3;
  }

  private extractAllCitations(text: string): Citation[] {
    const citations: Citation[] = [];
    
    const apaRegex = /\(([A-Za-z]+(?:\s+[A-Za-z]+)?),\s*(\d{4})\)/g;
    this.extractCitationsWithRegex(text, apaRegex, 'author-year', citations);
    
    const ieeeRegex = /\[(\d+)\]/g;
    this.extractCitationsWithRegex(text, ieeeRegex, 'numbered', citations);
    
    return citations;
  }

  private extractCitationsWithRegex(text: string, regex: RegExp, type: 'author-year' | 'numbered', citations: Citation[]) {
    let match;
    while ((match = regex.exec(text)) !== null) {
      citations.push({
        raw: match[0],
        type: type,
        position: match.index
      });
    }
  }

  private extractReferences(text: string): Reference[] {
    const references: Reference[] = [];
    const refMatch = text.match(/references?\s*(.+?)(?:\n\s*\n|$)/is);
    if (refMatch) {
      const refs = refMatch[1].split('\n');
      refs.forEach(ref => {
        if (ref.trim()) {
          references.push({ raw: ref.trim() });
        }
      });
    }
    return references;
  }

  private extractFigures(text: string): Figure[] {
    return [];
  }

  private extractTables(text: string): Table[] {
    return [];
  }
}