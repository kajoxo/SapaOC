import React, { useState } from 'react';
import { MapLocation, CategoryConfig, LocationCategory, Language } from '../types';
import { Icon } from './Icon';

interface MapMarkerProps {
  location: MapLocation;
  categoryConfig?: CategoryConfig;
  onClick: (location: MapLocation) => void;
  active: boolean;
  language: Language;
}

const MapMarker: React.FC<MapMarkerProps> = ({ location, categoryConfig, onClick, active, language }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Default color if config not found
  const bgColor = categoryConfig?.color || 'bg-gray-500';
  
  // Icon selection logic
  const getIconName = () => {
    if (location.category === LocationCategory.FOOD) return 'Utensils';
    if (location.category === LocationCategory.SHOPPING) return 'ShoppingBag';
    if (location.category === LocationCategory.WC) return 'Bath';
    if (location.category === LocationCategory.SERVICE) return 'Info';
    if (location.category === LocationCategory.HOTEL) return 'Bed';
    return 'MapPin';
  };

  const categoryLabel = categoryConfig ? categoryConfig.label[language] : location.category;

  return (
    <div
      className={`absolute cursor-pointer transform transition-all duration-300 ${active || isHovered ? 'z-50' : 'z-20'}`}
      style={{ left: `${location.x}%`, top: `${location.y}%` }}
      onClick={(e) => {
        e.stopPropagation();
        onClick(location);
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Mini Card Popover (Hover State) */}
      <div 
        className={`
          absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-64 bg-white rounded-xl shadow-2xl 
          transition-all duration-300 origin-bottom border border-gray-100 overflow-hidden
          ${isHovered || active ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-4 pointer-events-none'}
        `}
      >
        <div className="relative h-24 w-full bg-gray-100">
             {location.image ? (
                <img src={location.image} alt={location.title} className="w-full h-full object-cover" />
             ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Icon name="MapPin" size={30} />
                </div>
             )}
             <div className={`absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase ${bgColor}`}>
                 {categoryLabel}
             </div>
        </div>
        
        <div className="p-3">
            <h3 className="font-bold text-gray-800 text-sm leading-tight mb-1">{location.title}</h3>
            {location.phoneNumber && (
                <div className="flex items-center text-gray-500 text-xs mb-1">
                    <Icon name="Phone" size={12} className="mr-1" />
                    <span>{location.phoneNumber}</span>
                </div>
            )}
            {location.openHours && (
                <div className="flex items-center text-gray-500 text-xs">
                    <Icon name="Clock" size={12} className="mr-1" />
                    <span>{location.openHours}</span>
                </div>
            )}
        </div>
        
        {/* Triangle pointer */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-8 border-transparent border-t-white"></div>
      </div>

      {/* The Pin Icon */}
      <div className={`
        relative flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full shadow-lg border-2 border-white
        ${bgColor} text-white transition-transform duration-200
        ${isHovered ? 'scale-125' : 'animate-bounce-slight'}
      `}>
        <Icon name={getIconName()} size={18} />
        {active && <div className="absolute inset-0 rounded-full animate-ping bg-white opacity-30"></div>}
      </div>
      
      {/* Shadow */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-1.5 bg-black/20 rounded-full blur-[1px]"></div>
    </div>
  );
};

export default MapMarker;