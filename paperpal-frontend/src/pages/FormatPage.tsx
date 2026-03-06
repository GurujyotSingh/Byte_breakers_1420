import React, { useState } from "react";
import { FileUploader } from "../components/upload/FileUploader";

export const FormatPage: React.FC = () => {
  const [step, setStep] = useState(1);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Format Manuscript</h1>
      
      <div className="flex justify-between mb-8">
        <div className={`flex-1 text-center ${step >= 1 ? "text-blue-600" : "text-gray-400"}`}>
          Step 1: Upload
        </div>
        <div className={`flex-1 text-center ${step >= 2 ? "text-blue-600" : "text-gray-400"}`}>
          Step 2: Select Journal
        </div>
        <div className={`flex-1 text-center ${step >= 3 ? "text-blue-600" : "text-gray-400"}`}>
          Step 3: Review
        </div>
      </div>

      {step === 1 && (
  <FileUploader onDocumentParsed={() => setStep(2)} />
)}
    </div>
  );
};
