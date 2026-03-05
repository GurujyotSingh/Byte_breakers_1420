import React from 'react';

interface JournalFiltersProps {
  filters: {
    publisher: string;
    impactFactor: boolean;
    openAccess: boolean;
  };
  onFilterChange: (filters: any) => void;
}

export const JournalFilters: React.FC<JournalFiltersProps> = ({
  filters,
  onFilterChange
}) => {
  const handleChange = (key: string, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <h3 className="font-medium mb-3">Filters</h3>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Publisher
          </label>
          <input
            type="text"
            value={filters.publisher}
            onChange={(e) => handleChange('publisher', e.target.value)}
            placeholder="Filter by publisher..."
            className="w-full p-2 border rounded-lg text-sm"
          />
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="impactFactor"
            checked={filters.impactFactor}
            onChange={(e) => handleChange('impactFactor', e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="impactFactor" className="text-sm text-gray-600">
            Sort by Impact Factor
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="openAccess"
            checked={filters.openAccess}
            onChange={(e) => handleChange('openAccess', e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="openAccess" className="text-sm text-gray-600">
            Open Access only
          </label>
        </div>
      </div>
    </div>
  );
};