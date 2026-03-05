import React from 'react';

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface JournalCategoriesProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export const JournalCategories: React.FC<JournalCategoriesProps> = ({
  categories,
  selectedCategory,
  onSelectCategory
}) => {
  return (
    <div className="mb-6">
      <h3 className="font-medium mb-3">Categories</h3>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`
              px-4 py-2 rounded-full text-sm font-medium transition
              ${selectedCategory === category.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            <span className="mr-1">{category.icon}</span>
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
};