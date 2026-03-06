import React, { useState } from 'react';
import { FileUploader } from './components/upload/FileUploader';
import { JournalSelector } from './components/journal/JournalSelector';
import ComplianceDashboard from './components/compliance/ComplianceDashboard';
import { DocumentParser, ParsedDocument } from './services/documentParser';
import { FormattingEngine, FormattingResult } from './services/formattingEngine';
import { Journal } from './types/journal.types';
import { sessionManager } from './utils/sessionManager';
import { historyService } from './services/historyService';

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [parsedDoc, setParsedDoc] = useState<ParsedDocument | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formattingResult, setFormattingResult] = useState<FormattingResult | null>(null);
  
  const parser = new DocumentParser();
  const formattingEngine = new FormattingEngine();
  const sessionId = sessionManager.getSessionId();

  const handleDocumentParsed = (doc: ParsedDocument, file: File) => {
    setParsedDoc(doc);
    setSelectedFile(file);
    setCurrentStep(2);
    console.log('✅ Document parsed:', doc);
  };

  const handleJournalSelect = async (journal: Journal) => {
    setSelectedJournal(journal);
    setIsProcessing(true);
    
    try {
      if (!parsedDoc) throw new Error('No document parsed');
      
      // Format the document
      const result = await formattingEngine.formatDocument(parsedDoc, journal);
      setFormattingResult(result);
      
      // Save to history
      await historyService.saveToHistory({
        session_id: sessionId,
        file_name: selectedFile?.name || 'unknown',
        journal_style: journal.style,
        compliance_score: result.compliance_score,
        changes_made: result.changes_made
      });
      
      setCurrentStep(3);
    } catch (error) {
      console.error('Formatting failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setParsedDoc(null);
    setSelectedFile(null);
    setSelectedJournal(null);
    setFormattingResult(null);
    setCurrentStep(1);
  };

  const handleDownload = () => {
    alert('Download feature coming soon!');
  };

  const handleExport = (format: string) => {
    console.log('Export as:', format);
  };

  const handleFix = (issueId: string) => {
    console.log('Fix issue:', issueId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">📝 Agent Paperpal</h1>
            {currentStep > 1 && (
              <button onClick={handleReset} className="text-gray-600 hover:text-gray-900">
                Start Over
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between max-w-3xl mx-auto">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex-1 text-center">
                <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center
                  ${currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                  {step}
                </div>
                <p className={`mt-2 text-sm ${currentStep >= step ? 'text-blue-600' : 'text-gray-400'}`}>
                  {step === 1 ? 'Upload' : step === 2 ? 'Select Journal' : 'Review'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {currentStep === 1 && (
            <FileUploader onDocumentParsed={handleDocumentParsed} />
          )}

          {currentStep === 2 && parsedDoc && (
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
              onExport={handleExport}
              onFix={handleFix}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;