import React from 'react';

interface ComplianceScoreProps {
  score: number;
}

export const ComplianceScore: React.FC<ComplianceScoreProps> = ({ score }) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-100';
    if (score >= 70) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className={`${getScoreBgColor(score)} rounded-xl p-6 text-center`}>
      <div className={`text-5xl font-bold ${getScoreColor(score)}`}>
        {score}%
      </div>
      <p className="text-gray-600 mt-2">Compliance Score</p>
    </div>
  );
};