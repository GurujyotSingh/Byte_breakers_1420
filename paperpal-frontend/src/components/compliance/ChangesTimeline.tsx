import React from 'react';

export interface Change {
  type: string;
  count: number;
  rule: string;
}

interface ChangesTimelineProps {
  changes: Change[];
}

export const ChangesTimeline: React.FC<ChangesTimelineProps> = ({ changes }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Changes Made</h3>
      <div className="space-y-4">
        {changes.map((change, index) => (
          <div key={index} className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
              {index + 1}
            </div>
            <div className="ml-4 flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{change.type}</h4>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                  {change.count} changes
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{change.rule}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChangesTimeline;