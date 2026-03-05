import React, { useState } from 'react';
import { FileUploader } from './components/upload/FileUploader';
import { JournalSelector } from './components/journal/JournalSelector';
import ComplianceDashboard from './components/compliance/ComplianceDashboard';  // Remove curly braces
import { Journal } from './types/journal.types';
// Mock data for journals
const MOCK_JOURNALS: Journal[] = [
  { 
    id: 'apa-7', 
    name: 'APA 7th Edition', 
    publisher: 'American Psychological Association',
    style: 'APA',
    rules: {
      journalName: 'APA 7th',
      citationStyle: { type: 'APA', version: '7th', inTextFormat: '', bibliographyFormat: '', rules: {} },
      headingStyles: [],
      referenceFormat: { order: 'alphabetical', hangingIndent: true, lineSpacing: 2 },
      documentLayout: { margins: { top: 1, bottom: 1, left: 1, right: 1 }, font: 'Times New Roman', fontSize: 12, lineSpacing: 2 },
      abstractFormat: { structured: false },
      figureTableRules: { captionPosition: 'below', numberingStyle: 'Figure 1' }
    }
  },
  { 
    id: 'mla-9', 
    name: 'MLA 9th Edition', 
    publisher: 'Modern Language Association',
    style: 'MLA',
    rules: {
      journalName: 'MLA 9th',
      citationStyle: { type: 'MLA', version: '9th', inTextFormat: '', bibliographyFormat: '', rules: {} },
      headingStyles: [],
      referenceFormat: { order: 'alphabetical', hangingIndent: true, lineSpacing: 2 },
      documentLayout: { margins: { top: 1, bottom: 1, left: 1, right: 1 }, font: 'Times New Roman', fontSize: 12, lineSpacing: 2 },
      abstractFormat: { structured: false },
      figureTableRules: { captionPosition: 'below', numberingStyle: 'Figure 1' }
    }
  },
  { 
    id: 'ieee', 
    name: 'IEEE', 
    publisher: 'Institute of Electrical and Electronics Engineers',
    style: 'IEEE',
    rules: {
      journalName: 'IEEE',
      citationStyle: { type: 'IEEE', version: '2024', inTextFormat: '', bibliographyFormat: '', rules: {} },
      headingStyles: [],
      referenceFormat: { order: 'numeric', hangingIndent: true, lineSpacing: 1 },
      documentLayout: { margins: { top: 1, bottom: 1, left: 1, right: 1 }, font: 'Times New Roman', fontSize: 10, lineSpacing: 1 },
      abstractFormat: { structured: false },
      figureTableRules: { captionPosition: 'below', numberingStyle: 'Fig. 1' }
    }
  },
  { 
    id: 'chicago-17', 
    name: 'Chicago 17th Edition', 
    publisher: 'University of Chicago Press',
    style: 'Chicago',
    rules: {
      journalName: 'Chicago 17th',
      citationStyle: { type: 'Chicago', version: '17th', inTextFormat: '', bibliographyFormat: '', rules: {} },
      headingStyles: [],
      referenceFormat: { order: 'alphabetical', hangingIndent: true, lineSpacing: 2 },
      documentLayout: { margins: { top: 1, bottom: 1, left: 1, right: 1 }, font: 'Times New Roman', fontSize: 12, lineSpacing: 2 },
      abstractFormat: { structured: false },
      figureTableRules: { captionPosition: 'below', numberingStyle: 'Figure 1' }
    }
  },
  { 
    id: 'vancouver', 
    name: 'Vancouver', 
    publisher: 'International Committee of Medical Journal Editors',
    style: 'Vancouver',
    rules: {
      journalName: 'Vancouver',
      citationStyle: { type: 'Vancouver', version: '2024', inTextFormat: '', bibliographyFormat: '', rules: {} },
      headingStyles: [],
      referenceFormat: { order: 'numeric', hangingIndent: true, lineSpacing: 2 },
      documentLayout: { margins: { top: 1, bottom: 1, left: 1, right: 1 }, font: 'Times New Roman', fontSize: 12, lineSpacing: 2 },
      abstractFormat: { structured: false },
      figureTableRules: { captionPosition: 'below', numberingStyle: 'Figure 1' }
    }
  }
];

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedJournal, setSelectedJournal] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [formattingResult, setFormattingResult] = useState<any>(null);
  const [fileMetadata, setFileMetadata] = useState<any>(null);

  const handleFileUpload = (file: File, metadata: any) => {
    setSelectedFile(file);
    setFileMetadata(metadata);
    setCurrentStep(2);
  };

  const handleJournalSelect = (journal: Journal) => {
    setSelectedJournal(journal.id);
    handleFormatDocument();
  };

  const handleFormatDocument = async () => {
    setIsProcessing(true);
    
    // Simulate API call with realistic delays
    setTimeout(() => {
      setFormattingResult({
        compliance_score: 87,
        categories: {
          citations: 92,
          headings: 78,
          references: 85,
          layout: 95,
          figures: 88,
          abstract: 82
        },
        changes_made: [
          { type: 'Citations', count: 24, rule: 'APA 7th §8.17 - Author-date format' },
          { type: 'Headings', count: 8, rule: 'Heading hierarchy and capitalization' },
          { type: 'References', count: 42, rule: 'Hanging indent and alphabetical order' },
          { type: 'Spacing', count: 15, rule: 'Double spacing throughout' },
          { type: 'Margins', count: 4, rule: '1-inch margins all around' },
          { type: 'Page Numbers', count: 12, rule: 'Top right corner, consecutive' }
        ],
        issues: [
          { id: '1', severity: 'high', message: 'Missing DOI in 3 references' },
          { id: '2', severity: 'high', message: '2 citations missing page numbers' },
          { id: '3', severity: 'medium', message: '5 citations use incorrect format' },
          { id: '4', severity: 'medium', message: 'Running head missing on title page' },
          { id: '5', severity: 'low', message: '2 headings use inconsistent capitalization' },
          { id: '6', severity: 'low', message: 'Figure captions not italicized' }
        ],
        journalName: MOCK_JOURNALS.find(j => j.id === selectedJournal)?.name
      });
      setIsProcessing(false);
      setCurrentStep(3);
    }, 4000); // 4 second delay to simulate processing
  };

  const handleReset = () => {
    setSelectedFile(null);
    setSelectedJournal('');
    setFormattingResult(null);
    setFileMetadata(null);
    setCurrentStep(1);
  };

  const handleDownload = () => {
    if (!formattingResult) return;
    
    const journal = MOCK_JOURNALS.find(j => j.id === selectedJournal);
    
    const content = `FORMATTED MANUSCRIPT
================================
Journal: ${journal?.name}
Original File: ${selectedFile?.name}
Formatting Date: ${new Date().toLocaleString()}
Compliance Score: ${formattingResult.compliance_score}%

DOCUMENT METADATA
================================
${fileMetadata ? `
Title: ${fileMetadata.title || 'Not provided'}
Authors: ${fileMetadata.authors || 'Not provided'}
Keywords: ${fileMetadata.keywords || 'Not provided'}
` : 'No metadata provided'}

CHANGES MADE
================================
${formattingResult.changes_made.map((c: any) => 
  `• ${c.type}: ${c.count} changes\n  ${c.rule}`
).join('\n\n')}

ISSUES TO REVIEW
================================
${formattingResult.issues.map((i: any) => 
  `• [${i.severity.toUpperCase()}] ${i.message}`
).join('\n')}

CATEGORY SCORES
================================
Citations: ${formattingResult.categories.citations}%
Headings: ${formattingResult.categories.headings}%
References: ${formattingResult.categories.references}%
Layout: ${formattingResult.categories.layout}%
Figures: ${formattingResult.categories.figures}%
Abstract: ${formattingResult.categories.abstract}%

================================
Generated by Agent Paperpal - HackaMined 2026
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `formatted-${selectedFile?.name?.replace(/\.[^/.]+$/, '') || 'document'}.txt`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExport = (format: string) => {
    console.log(`Exporting as ${format}...`);
    alert(`Export as ${format} feature coming soon!`);
  };

  const handleFix = (issueId: string) => {
    console.log(`Fixing issue: ${issueId}`);
    alert(`Auto-fix feature coming soon! Issue ID: ${issueId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-4xl">📝</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Agent Paperpal
                </h1>
                <p className="text-sm text-gray-600">
                  AI-powered manuscript formatting
                </p>
              </div>
            </div>
            {currentStep > 1 && (
              <button 
                onClick={handleReset}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition flex items-center"
              >
                <span className="mr-2">↺</span>
                Start Over
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            <div className="flex-1">
              <div className={`h-2 rounded-full transition-all ${
                currentStep >= 1 ? 'bg-blue-600' : 'bg-gray-200'
              }`} style={{ width: currentStep >= 1 ? '100%' : '0%' }} />
            </div>
            <div className="w-8 text-center text-gray-400">→</div>
            <div className="flex-1">
              <div className={`h-2 rounded-full transition-all ${
                currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'
              }`} style={{ width: currentStep >= 2 ? '100%' : '0%' }} />
            </div>
            <div className="w-8 text-center text-gray-400">→</div>
            <div className="flex-1">
              <div className={`h-2 rounded-full transition-all ${
                currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'
              }`} style={{ width: currentStep >= 3 ? '100%' : '0%' }} />
            </div>
          </div>
          <div className="flex items-center justify-between max-w-3xl mx-auto mt-2">
            <span className={`text-sm font-medium ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              📄 Upload
            </span>
            <span className={`text-sm font-medium ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              📚 Journal
            </span>
            <span className={`text-sm font-medium ${currentStep >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
              ✨ Review
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Step 1: Upload */}
          {currentStep === 1 && (
            <div className="animate-fadeIn">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Upload Your Manuscript
              </h2>
              <FileUploader 
                onUpload={handleFileUpload} 
                maxSize={10} 
                acceptedTypes={['pdf', 'docx', 'txt']} 
              />
            </div>
          )}

          {/* Step 2: Select Journal */}
          {currentStep === 2 && (
            <div className="animate-fadeIn">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Select Target Journal
              </h2>
              <JournalSelector
                onSelect={handleJournalSelect}
                loading={isProcessing}
                selectedFile={selectedFile}
              />
            </div>
          )}

          {/* Step 3: Review Results */}
          {currentStep === 3 && formattingResult && (
            <div className="animate-fadeIn">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Formatting Results
              </h2>
              <ComplianceDashboard
                result={formattingResult}
                onDownload={handleDownload}
                onExport={handleExport}
                onFix={handleFix}
              />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          <p>Built for HackaMined 2026 | Paperpal Track | AI-Powered Manuscript Formatting</p>
        </div>
      </footer>
    </div>
  );
}

export default App;