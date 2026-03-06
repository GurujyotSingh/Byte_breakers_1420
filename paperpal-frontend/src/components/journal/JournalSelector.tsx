import React, { useState, useEffect } from 'react';
import { JournalCard } from './JournalCard';
import { JournalFilters } from './JournalFilters';
import { JournalCategories } from './JournalCategories';
import { Journal } from '../../types/journal.types';
import { CitationStyle } from '../../types/formatting.types';

interface JournalSelectorProps {
  onSelect: (journal: Journal) => void;
  loading: boolean;
  selectedFile: File | null;  // Add this line
}

export const JournalSelector: React.FC<JournalSelectorProps> = ({
  onSelect,
  loading,
  selectedFile  // Add this parameter
}) => {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [filteredJournals, setFilteredJournals] = useState<Journal[]>([]);
  const [loadingJournals, setLoadingJournals] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filters, setFilters] = useState({
    publisher: '',
    impactFactor: false,
    openAccess: false
  });

  // Helper function to create citation style
  const createCitationStyle = (type: string, version: string): CitationStyle => ({
    type,
    version,
    inTextFormat: '',
    bibliographyFormat: '',
    rules: {}
  });

  // Categories for filtering
  const categories = [
    { id: 'all', name: 'All Journals', icon: '📚' },
    { id: 'multidisciplinary', name: 'Multidisciplinary', icon: '🔬' },
    { id: 'life-sciences', name: 'Life Sciences', icon: '🧬' },
    { id: 'physical-sciences', name: 'Physical Sciences', icon: '⚛️' },
    { id: 'social-sciences', name: 'Social Sciences', icon: '👥' },
    { id: 'medical', name: 'Medical', icon: '🏥' },
    { id: 'engineering', name: 'Engineering', icon: '⚙️' }
  ];

  // Fetch journals
  useEffect(() => {
  const fetchJournals = async () => {
    setLoadingJournals(true);
    try {
      // Fetch from Supabase instead of using mock data
      const data = await journalService.getAllJournals();
      
      // Transform to match your Journal type if needed
      const transformedJournals: Journal[] = data.map(item => ({
        id: item.id,
        name: item.name,
        publisher: item.publisher || 'Unknown',
        style: item.style_code,
        impactFactor: item.impact_factor,
        categories: item.categories || [],
        openAccess: item.open_access || false,
        rules: {
          journalName: item.name,
          citationStyle: { 
            type: item.style_code, 
            version: '2024', 
            inTextFormat: '', 
            bibliographyFormat: '', 
            rules: {} 
          },
          headingStyles: item.heading_rules || [],
          referenceFormat: { 
            order: item.reference_order || 'alphabetical', 
            hangingIndent: true, 
            lineSpacing: 2 
          },
          documentLayout: item.font_rules || { 
            margins: { top: 1, bottom: 1, left: 1, right: 1 }, 
            font: 'Times New Roman', 
            fontSize: 12, 
            lineSpacing: 2 
          },
          abstractFormat: { structured: false },
          figureTableRules: { captionPosition: 'below', numberingStyle: 'Figure 1' }
        }
      }));
      
      setJournals(transformedJournals);
      setFilteredJournals(transformedJournals);
    } catch (error) {
      console.error('Failed to fetch journals:', error);
    } finally {
      setLoadingJournals(false);
    }
  };

  fetchJournals();
}, []);
  // Filter journals based on search and filters
  useEffect(() => {
    let filtered = journals;

    if (searchTerm) {
      filtered = filtered.filter(journal =>
        journal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        journal.publisher.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(journal =>
        journal.categories?.includes(selectedCategory) || false
      );
    }

    if (filters.publisher) {
      filtered = filtered.filter(journal =>
        journal.publisher.toLowerCase().includes(filters.publisher.toLowerCase())
      );
    }

    if (filters.impactFactor) {
      filtered = [...filtered].sort((a, b) => 
        (b.impactFactor || 0) - (a.impactFactor || 0)
      );
    }

    if (filters.openAccess) {
      filtered = filtered.filter(journal => journal.openAccess);
    }

    setFilteredJournals(filtered);
  }, [journals, searchTerm, selectedCategory, filters]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
        <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-600 border-t-transparent mx-auto"></div>
        <h3 className="text-2xl font-semibold mt-8 mb-2">Formatting Your Manuscript</h3>
        <p className="text-gray-600">File: {selectedFile?.name}</p>
        <div className="max-w-md mx-auto mt-4">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 animate-pulse" style={{ width: '60%' }}></div>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Applying journal styles • Formatting citations • Validating references
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          Select Target Journal
        </h2>
        <p className="text-blue-100">
          Choose from {journals.length} journals with predefined formatting rules
        </p>
        {selectedFile && (
          <p className="text-blue-200 text-sm mt-2">
            File: {selectedFile.name}
          </p>
        )}
      </div>

      <div className="p-8">
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search journals by name or publisher..."
            className="w-full p-4 pl-12 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute left-4 top-4 text-gray-400 text-xl">🔍</span>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>

        <JournalCategories
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        <JournalFilters
          filters={filters}
          onFilterChange={setFilters}
        />

        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              Available Journals ({filteredJournals.length})
            </h3>
          </div>

          {loadingJournals ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading journals...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto p-2">
              {filteredJournals.map((journal) => (
                <JournalCard
                  key={journal.id}
                  journal={journal}
                  onSelect={onSelect}
                  isSelected={false}
                />
              ))}
            </div>
          )}

          {!loadingJournals && filteredJournals.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">😕</div>
              <p className="text-xl text-gray-600">No journals found</p>
              <p className="text-gray-500 mt-2">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};