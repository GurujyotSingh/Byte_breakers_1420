import React from 'react';

export interface Issue {
  id: string;
  severity: 'high' | 'medium' | 'low';
  message: string;
}

interface IssuesListProps {
  issues: Issue[];
  onSelectIssue: (id: string) => void;
  selectedIssue: string | null;
  onFix: (id: string) => void;
}

export const IssuesList: React.FC<IssuesListProps> = ({
  issues,
  onSelectIssue,
  selectedIssue,
  onFix
}) => {
  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg mb-4">Issues Found ({issues.length})</h3>
      {issues.map((issue) => (
        <div
          key={issue.id}
          onClick={() => onSelectIssue(issue.id)}
          className={`
            border rounded-lg p-4 cursor-pointer transition
            ${selectedIssue === issue.id ? 'ring-2 ring-blue-500' : 'hover:shadow-md'}
          `}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-2 ${getSeverityColor(issue.severity)}`}>
                {issue.severity.toUpperCase()}
              </span>
              <p className="text-gray-700">{issue.message}</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFix(issue.id);
              }}
              className="ml-4 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              Fix
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default IssuesList;