import { useState, useCallback } from 'react';
import { Document, DocumentStructure } from '../types/document.types';

export const useDocumentParser = () => {
  const [parsing, setParsing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const parseDocument = useCallback(async (file: File): Promise<DocumentStructure> => {
    setParsing(true);
    setError(null);

    try {
      // Simulate parsing progress
      for (let i = 0; i <= 100; i += 10) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Mock parsing result
      const structure: DocumentStructure = {
        title: "Sample Research Paper",
        authors: [
          { name: "John Doe", affiliation: "University of Science" },
          { name: "Jane Smith", affiliation: "Research Institute" }
        ],
        abstract: "This is a sample abstract...",
        sections: [
          {
            id: "sec1",
            level: 1,
            title: "Introduction",
            content: "Introduction content here...",
            subsections: [
              {
                id: "sec1.1",
                level: 2,
                title: "Background",
                content: "Background content..."
              }
            ]
          }
        ],
        citations: [
          {
            id: "cit1",
            text: "(Doe et al., 2023)",
            position: 150,
            type: "author-year",
            isValid: true
          }
        ],
        references: [
          {
            id: "ref1",
            raw: "Doe, J., Smith, J. (2023). Sample paper. Journal, 1-10.",
            formatted: "",
            citations: ["cit1"]
          }
        ],
        tables: [],
        figures: []
      };

      return structure;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse document');
      throw err;
    } finally {
      setParsing(false);
    }
  }, []);

  return {
    parseDocument,
    parsing,
    progress,
    error
  };
};