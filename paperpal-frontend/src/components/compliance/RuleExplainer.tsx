import React from 'react';

interface RuleExplainerProps {
  journalName?: string;
}

export const RuleExplainer: React.FC<RuleExplainerProps> = ({ journalName }) => {
  const rules = [
    {
      category: 'Citations',
      rules: [
        'Use author-date citations in parentheses',
        'Multiple authors: use "&" for 2, "et al." for 3+',
        'Page numbers required for direct quotes'
      ]
    },
    {
      category: 'References',
      rules: [
        'Alphabetical order by author surname',
        'Hanging indent of 0.5 inches',
        'DOIs should be included when available'
      ]
    },
    {
      category: 'Headings',
      rules: [
        'Level 1: Centered, Bold, Title Case',
        'Level 2: Left-aligned, Bold, Title Case',
        'Level 3: Indented, Bold, Sentence case'
      ]
    },
    {
      category: 'Formatting',
      rules: [
        'Double-spaced throughout',
        '1-inch margins on all sides',
        '12pt Times New Roman font'
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">
        {journalName ? `${journalName} Style Guide` : 'Style Guide Rules'}
      </h3>
      
      {rules.map((section, idx) => (
        <div key={idx} className="border-l-4 border-blue-500 pl-4">
          <h4 className="font-medium text-blue-700 mb-2">{section.category}</h4>
          <ul className="space-y-2">
            {section.rules.map((rule, ruleIdx) => (
              <li key={ruleIdx} className="text-sm text-gray-600 flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                {rule}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};