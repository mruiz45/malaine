'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface CategoryFilterProps {
  selectedCategory: 'all' | 'clothing' | 'accessories';
  onCategoryChange: (category: 'all' | 'clothing' | 'accessories') => void;
  itemCounts: {
    all: number;
    clothing: number;
    accessories: number;
  };
}

export default function CategoryFilter({ selectedCategory, onCategoryChange, itemCounts }: CategoryFilterProps) {
  const { t } = useTranslation();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const categories = [
    { key: 'all' as const, label: isClient ? t('pattern_wizard_all') : 'All', count: itemCounts.all },
    { key: 'clothing' as const, label: isClient ? t('pattern_wizard_clothing') : 'Clothing', count: itemCounts.clothing },
    { key: 'accessories' as const, label: isClient ? t('pattern_wizard_accessories') : 'Accessories', count: itemCounts.accessories },
  ];

  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.key}
            onClick={() => onCategoryChange(category.key)}
            className={`
              inline-flex items-center rounded-lg border px-4 py-2 text-sm font-medium transition-colors
              ${selectedCategory === category.key
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              }
            `}
          >
            {category.label}
            <span className={`ml-2 rounded-full px-2 py-0.5 text-xs
              ${selectedCategory === category.key
                ? 'bg-blue-200 text-blue-800'
                : 'bg-gray-100 text-gray-600'
              }
            `}>
              {category.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
} 