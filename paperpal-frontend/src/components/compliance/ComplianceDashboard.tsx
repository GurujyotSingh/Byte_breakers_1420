import React, { useState } from 'react';
import { ComplianceScore } from './ComplianceScore';
import IssuesList from './IssuesList';
import ChangesTimeline from './ChangesTimeline';
import { CategoryScores } from './CategoryScores';  // Change to curly braces
import { RuleExplainer } from './RuleExplainer';    // Change to curly braces
import { FixSuggestions } from './FixSuggestions';  // Change to curly braces

interface ComplianceDashboardProps {
  result: any;
  onDownload: () => void;
  onExport: (format: string) => void;
  onFix: (issueId: string) => void;
}

const ComplianceDashboard: React.FC<ComplianceDashboardProps> = ({
  result,
  onDownload,
  onExport,
  onFix
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);

  // Safe access with defaults
  const complianceScore = result?.compliance_score || 0;
  const changes = result?.changes_made || [];
  const issues = result?.issues || [];
  const categories = result?.categories;

  // Calculate total changes
  const totalChanges = changes.reduce((acc: number, curr: any) => acc + (curr.count || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header with Score */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Formatting Complete! 🎉
            </h2>
            <p className="text-gray-600">
              Your manuscript has been formatted successfully
            </p>
          </div>
          <ComplianceScore score={complianceScore} />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 mt-8">
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-sm text-blue-600">Changes Made</p>
            <p className="text-2xl font-bold text-blue-700">{totalChanges}</p>
          </div>
          <div className="bg-yellow-50 rounded-xl p-4">
            <p className="text-sm text-yellow-600">Issues Found</p>
            <p className="text-2xl font-bold text-yellow-700">{issues.length}</p>
          </div>
          <div className="bg-green-50 rounded-xl p-4">
            <p className="text-sm text-green-600">Compliance</p>
            <p className="text-2xl font-bold text-green-700">{complianceScore}%</p>
          </div>
          <div className="bg-purple-50 rounded-xl p-4">
            <p className="text-sm text-purple-600">Processing Time</p>
            <p className="text-2xl font-bold text-purple-700">3.2s</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="border-b">
          <nav className="flex">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'issues', label: 'Issues', icon: '⚠️' },
              { id: 'changes', label: 'Changes', icon: '📝' },
              { id: 'rules', label: 'Style Guide', icon: '📚' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center px-6 py-4 text-sm font-medium
                  ${activeTab === tab.id
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                  }
                `}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <CategoryScores categories={categories} />
            </div>
          )}

          {/* Issues Tab */}
          {activeTab === 'issues' && (
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2">
                <IssuesList
                  issues={issues}
                  onSelectIssue={setSelectedIssue}
                  selectedIssue={selectedIssue}
                  onFix={onFix}
                />
              </div>
              <div>
                {selectedIssue && (
                  <FixSuggestions
                    issue={issues.find((i: any) => i.id === selectedIssue)}
                    onApplyFix={onFix}
                  />
                )}
              </div>
            </div>
          )}

          {/* Changes Tab */}
          {activeTab === 'changes' && (
            <ChangesTimeline changes={changes} />
          )}

          {/* Rules Tab */}
          {activeTab === 'rules' && (
            <RuleExplainer />
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={onDownload}
          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl hover:from-green-700 hover:to-emerald-700 transition font-semibold text-lg"
        >
          📥 Download Formatted Document
        </button>
        <button
          onClick={() => onExport('pdf')}
          className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition font-semibold text-lg"
        >
          📊 Export Compliance Report
        </button>
      </div>
    </div>
  );
};

export default ComplianceDashboard;  // Keep default export at the end