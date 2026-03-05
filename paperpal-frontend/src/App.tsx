import React, { useState } from 'react';
import { FileUploader } from './components/upload/FileUploader';
import { JournalSelector } from './components/journal/JournalSelector';
import { ComplianceDashboard } from './components/compliance/ComplianceDashboard';
import { Journal } from './types/journal.types';

// Mock data for journals
const MOCK_JOURNALS = [
  { id: 'apa-7', name: 'APA 7th Edition', publisher: 'American Psychological Association' },
  { id: 'mla-9', name: 'MLA 9th Edition', publisher: 'Modern Language Association' },
  { id: 'ieee', name: 'IEEE', publisher: 'Institute of Electrical and Electronics Engineers' },
  { id: 'vancouver', name: 'Vancouver', publisher: 'International Committee of Medical Journal Editors' },
  { id: 'chicago-17', name: 'Chicago 17th Edition', publisher: 'University of Chicago Press' },
  { id: 'ama-11', name: 'AMA 11th Edition', publisher: 'American Medical Association' },
  { id: 'harvard', name: 'Harvard', publisher: 'Harvard University' },
  { id: 'acs', name: 'ACS', publisher: 'American Chemical Society' },
];

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedJournal, setSelectedJournal] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [formattingResult, setFormattingResult] = useState<any>(null);

  const handleFileUpload = (file: File) => {
    setSelectedFile(file);
    setCurrentStep(2);
  };
// Fix the handleJournalSelect function
const handleJournalSelect = (journal: Journal) => {
  setSelectedJournal(journal.id);
  handleFormatDocument();
};


  const handleFormatDocument = async () => {
  setIsProcessing(true);
  
  // Simulate API call
  setTimeout(() => {
    setFormattingResult({
      compliance_score: 87,
      categories: {  // Make sure this is included
        citations: 92,
        headings: 78,
        references: 85,
        layout: 95,
        figures: 88,
        abstract: 82
      },
      changes_made: [
        { type: 'Citations', count: 24, rule: 'APA 7th §8.17' },
        { type: 'Headings', count: 8, rule: 'Heading hierarchy' },
        { type: 'References', count: 42, rule: 'Hanging indent' },
        { type: 'Spacing', count: 15, rule: 'Double spacing' },
        { type: 'Margins', count: 4, rule: '1-inch margins' },
      ],
      issues: [
        { id: '1', severity: 'high', message: 'Missing DOI in 3 references' },
        { id: '2', severity: 'medium', message: '5 citations need page numbers' },
        { id: '3', severity: 'low', message: '2 headings use inconsistent capitalization' },
      ]
    });
    setIsProcessing(false);
    setCurrentStep(3);
  }, 3000);
};
const handleDownload = () => {
  if (!formattingResult) return;
  
  // Create a sample formatted document
  const content = `Formatted Document
Journal: ${MOCK_JOURNALS.find(j => j.id === selectedJournal)?.name}
Original File: ${selectedFile?.name}
Formatting Date: ${new Date().toLocaleString()}

Changes Made:
${formattingResult.changes_made.map((c: any) => 
  `- ${c.type}: ${c.count} changes (${c.rule})`
).join('\n')}

Compliance Score: ${formattingResult.compliance_score}%
`;

  const blob = new Blob([content], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `formatted-${selectedFile?.name || 'document'}.txt`;
  link.click();
  window.URL.revokeObjectURL(url);
};
  const handleReset = () => {
    setSelectedFile(null);
    setSelectedJournal('');
    setFormattingResult(null);
    setCurrentStep(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                📝 Agent Paperpal
              </h1>
              <p className="text-gray-600 mt-1">
                AI-powered manuscript formatting for academic journals
              </p>
            </div>
            <button 
              onClick={handleReset}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              Reset
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Progress Steps */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="flex items-center justify-between">
            {[
              { number: 1, label: 'Upload Manuscript' },
              { number: 2, label: 'Select Journal' },
              { number: 3, label: 'Review & Download' }
            ].map((step) => (
              <div key={step.number} className="flex-1 text-center relative">
                <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center text-lg font-semibold
                  ${currentStep >= step.number 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'}`}>
                  {currentStep > step.number ? '✓' : step.number}
                </div>
                <div className={`mt-2 text-sm font-medium
                  ${currentStep >= step.number ? 'text-blue-600' : 'text-gray-500'}`}>
                  {step.label}
                </div>
                {step.number < 3 && (
                  <div className={`absolute top-6 left-[60%] w-[80%] h-0.5
                    ${currentStep > step.number ? 'bg-blue-600' : 'bg-gray-200'}`}>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-4xl mx-auto">
          {currentStep === 1 && (
            <FileUploader onUpload={handleFileUpload} />
          )}

          {currentStep === 2 && (
  <JournalSelector 
  onSelect={handleJournalSelect}
  loading={isProcessing}
  selectedFile={selectedFile}
/>
          )}

          
{currentStep === 3 && formattingResult && (
  <ComplianceDashboard
    result={formattingResult}
    onDownload={handleDownload}
    onExport={(format) => console.log('Export as:', format)}
    onFix={(issueId) => console.log('Fix issue:', issueId)}
  />
)}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto py-6">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>Built for HackaMined 2026 | Paperpal Track</p>
        </div>
      </footer>
    </div>
  );
}

export default App;