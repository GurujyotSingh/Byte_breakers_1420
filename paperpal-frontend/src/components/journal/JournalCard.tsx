import React from 'react';
import { Journal } from '../../types/journal.types';

interface JournalCardProps {
  journal: Journal;
  onSelect: (journal: Journal) => void;
  isSelected: boolean;
}

export const JournalCard: React.FC<JournalCardProps> = ({
  journal,
  onSelect,
  isSelected
}) => {
  return (
    <div
      onClick={() => onSelect(journal)}
      className={`
        border-2 rounded-xl p-5 cursor-pointer transition-all
        ${isSelected 
          ? 'border-blue-500 bg-blue-50 shadow-lg' 
          : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
        }
      `}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-lg">{journal.name}</h3>
        {journal.openAccess && (
          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
            Open Access
          </span>
        )}
      </div>
      
      <p className="text-sm text-gray-600 mb-2">{journal.publisher}</p>
      
      {journal.impactFactor && (
        <p className="text-sm">
          <span className="font-medium">Impact Factor:</span> {journal.impactFactor}
        </p>
      )}
      
      <div className="flex flex-wrap gap-1 mt-3">
        {journal.categories?.map((category, index) => (
          <span 
            key={index}
            className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
          >
            {category}
          </span>
        ))}
      </div>
    </div>
  );
};