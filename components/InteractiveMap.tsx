import React, { useRef, useState } from 'react';
import { MapLocation, CategoryConfig, LocationCategory, UserLocation, Language } from '../types';
import MapMarker from './MapMarker';
import { Icon } from './Icon';

interface InteractiveMapProps {
  locations: MapLocation[];
  activeCategory: LocationCategory | null;
  categories: CategoryConfig[];
  isAdminMode: boolean;
  onMapClick?: (x: number, y: number) => void;
  onMarkerClick?: (location: MapLocation) => void;
  highlightedId: string | null;
  mapImage: string;
  userLocation: UserLocation | null;
  onRequestUserLocation: () => void;
  isLocating: boolean;
  t: (key: string) => string;
  language: Language;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ 
  locations, 
  activeCategory, 
  categories, 
  isAdminMode, 
  onMapClick,
  onMarkerClick,
  highlightedId,
  mapImage,
  userLocation,
  onRequestUserLocation,
  isLocating,
  t,
  language
}) => {
  const [scale, setScale] = useState(1);
  const mapRef = useRef<HTMLDivElement>(null);

  // Filter locations
  const filteredLocations = activeCategory 
    ? locations.filter(loc => loc.category === activeCategory)
    : locations;

  // Handle map click for adding new points
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isAdminMode || !onMapClick || !mapRef.current) return;
    
    // Only trigger if we didn't click on a marker (bubbling prevented in Marker)
    const rect = mapRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    onMapClick(x, y);
  };

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.2, 2.5));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.2, 1));

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#e8f5e9]">
      {/* Zoom Controls */}
      <div className="absolute top-24 right-4 z-30 flex flex-col gap-2">
        <button onClick={onRequestUserLocation} className="bg-white p-2 rounded-lg shadow-md hover:bg-gray-50 text-brand-blue font-bold w-10 h-10 flex items-center justify-center">
            {isLocating ? <div className="w-4 h-4 border-2 border-brand-blue border-t-transparent rounded-full animate-spin"></div> : <Icon name="Target" size={20} />}
        </button>
        <div className="h-2"></div>
        <button onClick={handleZoomIn} className="bg-white p-2 rounded-lg shadow-md hover:bg-gray-50 text-gray-700 font-bold w-10 h-10 flex items-center justify-center">+</button>
        <button onClick={handleZoomOut} className="bg-white p-2 rounded-lg shadow-md hover:bg-gray-50 text-gray-700 font-bold w-10 h-10 flex items-center justify-center">-</button>
      </div>

      {/* Admin Mode Indicator */}
      {isAdminMode && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-30 bg-black/75 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm animate-pulse whitespace-nowrap">
          {t('admin_mode')}
        </div>
      )}

      {/* Map Surface */}
      <div 
        className="map-container relative w-full h-full transition-transform duration-300 ease-out origin-center flex items-center justify-center"
        style={{ transform: `scale(${scale})`, cursor: isAdminMode ? 'crosshair' : 'grab' }}
      >
        <div 
            ref={mapRef}
            className="relative w-[150%] md:w-full max-w-[1920px] aspect-[16/9]" 
            onClick={handleMapClick}
        >
            {/* Background Map Image */}
            <img 
                src={mapImage}
                alt="Sapa Market Map" 
                className="w-full h-full object-cover rounded-xl shadow-inner pointer-events-none select-none"
            />
            
            {/* User Location Marker (Blue Dot) */}
            {userLocation && (
              <div 
                className="absolute w-6 h-6 z-10 pointer-events-none"
                style={{ left: `${userLocation.x}%`, top: `${userLocation.y}%`, transform: 'translate(-50%, -50%)' }}
              >
                <div className="w-full h-full bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                <div className="absolute inset-0 bg-blue-500 rounded-full opacity-30 animate-ping"></div>
              </div>
            )}

            {/* Markers */}
            {filteredLocations.map(location => (
            <MapMarker
                key={location.id}
                location={location}
                categoryConfig={categories.find(c => c.id === location.category)}
                onClick={(loc) => {
                  if (onMarkerClick) onMarkerClick(loc);
                }}
                active={highlightedId === location.id}
                language={language}
            />
            ))}
        </div>
      </div>
    </div>
  );
};

export default InteractiveMap;