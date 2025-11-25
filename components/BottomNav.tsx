import React from 'react';
import { CategoryConfig, LocationCategory, Language } from '../types';
import { Icon } from './Icon';

interface BottomNavProps {
  categories: CategoryConfig[];
  activeCategory: LocationCategory | null;
  onSelectCategory: (id: LocationCategory | null) => void;
  t: (key: string) => string;
  language: Language;
}

const BottomNav: React.FC<BottomNavProps> = ({ categories, activeCategory, onSelectCategory, t, language }) => {
  return (
    <div className="absolute bottom-6 left-4 right-4 z-40 flex justify-center pointer-events-none">
      <div className="bg-white/95 backdrop-blur-md p-2 rounded-2xl shadow-xl border border-white/50 pointer-events-auto overflow-x-auto max-w-full">
        <div className="flex space-x-2 md:space-x-4 min-w-max px-2">
          
          {/* 'All' Button */}
          <button
            onClick={() => onSelectCategory(null)}
            className={`
              flex flex-col items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-xl transition-all duration-200
              ${activeCategory === null 
                ? 'bg-gray-800 text-white shadow-lg -translate-y-2' 
                : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}
            `}
          >
            <Icon name="MapPin" size={24} className="mb-1" />
            <span className="text-[10px] md:text-xs font-bold uppercase">{t('filter_all')}</span>
          </button>

          {/* Category Buttons */}
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(isActive ? null : cat.id)}
                className={`
                   flex flex-col items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-xl transition-all duration-200
                   ${isActive ? 'text-white shadow-lg -translate-y-2' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}
                `}
                style={isActive ? { backgroundColor: getColorHex(cat.id) } : {}}
              >
                <div className={`
                    bg-white/20 rounded-full p-1.5 mb-1 backdrop-blur-sm
                    ${isActive ? 'text-white' : 'text-gray-400'}
                `}>
                    <Icon name={cat.iconName} size={20} />
                </div>
                <span className="text-[10px] md:text-xs font-bold uppercase text-center leading-tight px-1">
                  {cat.label[language]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Helper to map enum ID to actual hex color for dynamic styles
function getColorHex(id: LocationCategory): string {
  switch (id) {
    case LocationCategory.FOOD: return '#ED1C24';
    case LocationCategory.SHOPPING: return '#FFD200';
    case LocationCategory.SERVICE: return '#00AEEF';
    case LocationCategory.WC: return '#9E005D';
    default: return '#888';
  }
}

export default BottomNav;