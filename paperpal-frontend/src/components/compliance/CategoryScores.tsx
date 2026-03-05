import React from 'react';
interface Categories {
  citations: number;
  headings: number;
  references: number;
  layout: number;
  figures: number;
  abstract: number;
}

interface CategoryScoresProps {
  categories?: Categories;
}

export const CategoryScores: React.FC<CategoryScoresProps> = ({ categories }) => {
  const categoriesList = [
    { key: 'citations', label: 'Citations', score: categories?.citations },
    { key: 'references', label: 'References', score: categories?.references },
    { key: 'headings', label: 'Headings', score: categories?.headings },
    { key: 'figures', label: 'Figures', score: categories?.figures },
    { key: 'layout', label: 'Layout', score: categories?.layout },
    { key: 'abstract', label: 'Abstract', score: categories?.abstract },
  ];

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Category Scores</h3>
      <div className="space-y-3">
        {categoriesList.map((cat) => (
          <div key={cat.key}>
            <div className="flex justify-between text-sm mb-1">
              <span>{cat.label}</span>
              <span className="font-medium">{cat.score}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 rounded-full h-2 transition-all"
                style={{ width: `${cat.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};