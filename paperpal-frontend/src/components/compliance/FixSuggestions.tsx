import React from 'react';

interface FixSuggestionsProps {
  issue: any;
  onApplyFix: (issueId: string) => void;
}

export const FixSuggestions: React.FC<FixSuggestionsProps> =({
  issue,
  onApplyFix
}) => {
  if (!issue) return null;

  return (
    <div className="bg-white border rounded-xl p-6">
      <h3 className="font-semibold text-lg mb-4">Fix Suggestions</h3>
      
      <div className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 font-medium mb-2">Issue:</p>
          <p className="text-gray-700">{issue.message}</p>
        </div>
        
        <div className="space-y-2">
          <p className="font-medium">Suggested fixes:</p>
          <button
            onClick={() => onApplyFix(issue.id)}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Auto-fix this issue
          </button>
          
          <button className="w-full border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition">
            Show me how to fix
          </button>
        </div>
      </div>
    </div>
  );
};