import React, { useState } from 'react';
import { Line, Pie, Bar } from 'react-chartjs-2';
import { ComplianceScore } from './ComplianceScore';
import IssuesList from './IssuesList';
import ChangesTimeline from './ChangesTimeline';
import { CategoryScores } from './CategoryScores';
import { RuleExplainer } from './RuleExplainer';
import { FixSuggestions } from './FixSuggestions';

interface ComplianceDashboardProps {
  result: any;
  onDownload: () => void;
  onExport: (format: string) => void;
  onFix: (issueId: string) => void;
}

export const ComplianceDashboard: React.FC<ComplianceDashboardProps> = ({
  result,
  onDownload,
  onExport,
  onFix
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);

  // Chart data for compliance trends
  const trendData = {
    labels: ['Abstract', 'Citations', 'References', 'Headings', 'Figures', 'Tables'],
    datasets: [
      {
        label: 'Compliance Score',
        data: [92, 78, 85, 95, 88, 82],
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: '#3b82f6',
        borderWidth: 2
      }
    ]
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      }
    }
  };

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
          <ComplianceScore score={result.compliance_score} />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 mt-8">
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-sm text-blue-600">Changes Made</p>
            <p className="text-2xl font-bold text-blue-700">142</p>
          </div>
          <div className="bg-yellow-50 rounded-xl p-4">
            <p className="text-sm text-yellow-600">Issues Found</p>
            <p className="text-2xl font-bold text-yellow-700">23</p>
          </div>
          <div className="bg-green-50 rounded-xl p-4">
            <p className="text-sm text-green-600">Auto-fixed</p>
            <p className="text-2xl font-bold text-green-700">118</p>
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
              { id: 'preview', label: 'Preview', icon: '👁️' },
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
              <div className="grid grid-cols-2 gap-6">
                {/* Category Scores */}
                <CategoryScores categories={result.categories} />
                
                {/* Compliance Chart */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Category Breakdown</h3>
                  <Bar data={trendData} options={chartOptions} />
                </div>
              </div>

              {/* Recent Changes Timeline */}
              <ChangesTimeline changes={result.changes_made} />
            </div>
          )}

          {/* Issues Tab */}
          {activeTab === 'issues' && (
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2">
                <IssuesList
                  issues={result.issues}
                  onSelectIssue={setSelectedIssue}
                  selectedIssue={selectedIssue}
                  onFix={onFix}
                />
              </div>
              <div>
                {selectedIssue && (
                  <FixSuggestions
                    issue={result.issues.find((i: any) => i.id === selectedIssue)}
                    onApplyFix={onFix}
                  />
                )}
              </div>
            </div>
          )}

          {/* Changes Tab */}
          {activeTab === 'changes' && (
            <div className="space-y-4">
              {result.changes_made.map((change: any, index: number) => (
                <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{change.type}</h4>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      {change.count} changes
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{change.rule}</p>
                  <div className="bg-gray-100 rounded p-3 text-sm">
                    <div className="text-red-500 line-through">Original: {change.original}</div>
                    <div className="text-green-600">Formatted: {change.formatted}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Preview Tab */}
          {activeTab === 'preview' && (
            <div className="space-y-4">
              <div className="flex justify-end space-x-2">
                <button className="px-4 py-2 bg-gray-100 rounded-lg">Original</button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">Formatted</button>
                <button className="px-4 py-2 bg-gray-100 rounded-lg">Diff</button>
              </div>
              <div className="border rounded-lg p-6 font-serif">
                <h1 className="text-2xl font-bold mb-4">Sample Title</h1>
                <p className="mb-4">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                  Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
                <p>
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
                  <span className="bg-yellow-100 px-1">(Smith et al., 2023)</span>
                </p>
              </div>
            </div>
          )}

          {/* Rules Tab */}
          {activeTab === 'rules' && (
            <RuleExplainer journalName={result.journalName} />
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
        <button
          onClick={() => onExport('tex')}
          className="px-8 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-semibold text-lg"
        >
          📄 Export as LaTeX
        </button>
      </div>

      {/* Share Options */}
      <div className="bg-gray-50 rounded-xl p-4">
        <p className="text-sm text-gray-600 mb-2">Share your results:</p>
        <div className="flex space-x-2">
          <button className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <span className="sr-only">Twitter</span> 🐦
          </button>
          <button className="p-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900">
            <span className="sr-only">LinkedIn</span> 🔗
          </button>
          <button className="p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900">
            <span className="sr-only">Email</span> 📧
          </button>
          <button className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            <span className="sr-only">Copy Link</span> 🔗
          </button>
        </div>
      </div>
    </div>
  );
};