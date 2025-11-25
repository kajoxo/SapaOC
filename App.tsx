import React, { useState, useEffect } from 'react';
import { CATEGORIES, INITIAL_LOCATIONS, DEFAULT_MAP_IMAGE_URL, TRANSLATIONS, SAPA_BOUNDS } from './constants';
import { LocationCategory, MapLocation, LocationStatus, Language, UserLocation } from './types';
import InteractiveMap from './components/InteractiveMap';
import ListView from './components/ListView';
import BottomNav from './components/BottomNav';
import Header from './components/Header';
import LocationFormModal from './components/LocationModal';

function App() {
  const [activeCategory, setActiveCategory] = useState<LocationCategory | null>(null);
  const [viewMode, setViewMode] = useState<'MAP' | 'LIST'>('MAP');
  const [language, setLanguage] = useState<Language>(Language.CS); // Default Czech
  
  // Security & Admin State
  const [isAdmin, setIsAdmin] = useState(false);
  const [canSwitchAdmin, setCanSwitchAdmin] = useState(false);
  
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  
  // State for Modal & Editing
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [tempCoords, setTempCoords] = useState<{x: number, y: number} | null>(null);
  const [editingLocation, setEditingLocation] = useState<MapLocation | null>(null);
  const [movingLocationId, setMovingLocationId] = useState<string | null>(null);

  // User Location State
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Load locations from local storage or use initial with Error Boundary logic
  const [locations, setLocations] = useState<MapLocation[]>(() => {
    try {
      const saved = localStorage.getItem('sapa_map_locations');
      return saved ? JSON.parse(saved) : INITIAL_LOCATIONS;
    } catch (e) {
      console.error("Failed to parse locations from storage, resetting.", e);
      return INITIAL_LOCATIONS;
    }
  });

  // Load custom map image from local storage
  const [mapImage, setMapImage] = useState<string>(() => {
      try {
        return localStorage.getItem('sapa_map_bg_image') || DEFAULT_MAP_IMAGE_URL;
      } catch (e) {
        return DEFAULT_MAP_IMAGE_URL;
      }
  });

  // Translation Helper
  const t = (key: string): string => {
    return (TRANSLATIONS[language] as Record<string, string>)[key] || key;
  };

  // Check URL for Secret Key
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const secretKey = searchParams.get('secret');
    
    // Example key: ?secret=sapaadmin
    if (secretKey === 'sapaadmin') {
      setCanSwitchAdmin(true);
      setIsAdmin(true); // Auto login if key is present
    }
  }, []);

  // Save to local storage whenever locations change
  useEffect(() => {
    try {
      localStorage.setItem('sapa_map_locations', JSON.stringify(locations));
    } catch (e) {
      console.warn("Storage full or unavailable");
    }
  }, [locations]);

  // Handle Map Image Upload
  const handleMapImageUpload = (file: File) => {
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              const result = reader.result as string;
              setMapImage(result);
              try {
                localStorage.setItem('sapa_map_bg_image', result);
                alert("Đã cập nhật ảnh nền bản đồ thành công!");
              } catch (e) {
                alert("Ảnh quá lớn để lưu vào bộ nhớ trình duyệt. Ảnh sẽ hiển thị ngay bây giờ nhưng có thể mất khi tải lại trang.");
              }
          };
          reader.readAsDataURL(file);
      }
  };

  // Handle locating an item (search or list view)
  const handleLocate = (id: string) => {
    setViewMode('MAP');
    setHighlightedId(id);
    setTimeout(() => setHighlightedId(null), 3000);
  };

  // --- Geolocation Logic ---
  const handleRequestUserLocation = () => {
    if (!navigator.geolocation) {
        alert("Trình duyệt của bạn không hỗ trợ định vị.");
        return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
        (position) => {
            setIsLocating(false);
            const { latitude, longitude } = position.coords;
            
            // Convert Lat/Lng to Map Percentage (X/Y)
            // Linear interpolation based on SAPA_BOUNDS in constants
            const latRange = SAPA_BOUNDS.topLeft.lat - SAPA_BOUNDS.bottomRight.lat;
            const lngRange = SAPA_BOUNDS.bottomRight.lng - SAPA_BOUNDS.topLeft.lng;
            
            // Calculate percentage (0-1)
            const yPct = (SAPA_BOUNDS.topLeft.lat - latitude) / latRange;
            const xPct = (longitude - SAPA_BOUNDS.topLeft.lng) / lngRange;

            // Convert to 0-100 scale
            let x = xPct * 100;
            let y = yPct * 100;

            // Clamp values to keep dot somewhat on screen even if outside bounds
            // x = Math.max(0, Math.min(100, x));
            // y = Math.max(0, Math.min(100, y));

            setUserLocation({ x, y });
            alert(t('location_found'));
        },
        (error) => {
            setIsLocating(false);
            console.error(error);
            alert(t('location_error'));
        },
        { enableHighAccuracy: true }
    );
  };


  // Handle adding OR updating location
  const handleFormSubmit = (data: any) => {
    if (editingLocation) {
      // Update existing
      setLocations(prev => prev.map(loc => 
        loc.id === editingLocation.id ? { ...loc, ...data } : loc
      ));
    } else {
      // Create new
      const newLocation: MapLocation = {
        id: Date.now().toString(),
        ...data,
        status: isAdmin ? LocationStatus.APPROVED : LocationStatus.PENDING,
        rating: 5.0,
      };
      setLocations([...locations, newLocation]);
    }

    setIsFormOpen(false);
    setTempCoords(null);
    setEditingLocation(null);
  };

  // Handle click on map
  const onMapClick = (x: number, y: number) => {
    // If we are in "Moving Mode" (relocating an existing pin)
    if (movingLocationId && isAdmin) {
      setLocations(prev => prev.map(loc => 
        loc.id === movingLocationId ? { ...loc, x, y } : loc
      ));
      setMovingLocationId(null); // Exit move mode
      alert("Đã cập nhật vị trí mới!");
      return;
    }

    // Normal Admin click: Add new point
    if (isAdmin) {
      setTempCoords({ x, y });
      setEditingLocation(null); // Ensure we are adding new, not editing
      setIsFormOpen(true);
    }
  };

  // Handle click on a marker
  const onMarkerClick = (location: MapLocation) => {
    if (isAdmin) {
      // Admin: Open Edit Form
      setEditingLocation(location);
      setTempCoords({ x: location.x, y: location.y });
      setIsFormOpen(true);
    } else {
      // Guest: Just focus/highlight (handled by hover UI mostly)
    }
  };

  // Trigger Move Mode from Modal
  const handleStartMove = (id: string) => {
    setIsFormOpen(false); // Close modal
    setMovingLocationId(id); // Set state to wait for next map click
  };

  const openSuggestForm = () => {
    setTempCoords(null);
    setEditingLocation(null);
    setIsFormOpen(true);
  };

  // Admin actions
  const approveLocation = (id: string) => {
    setLocations(prev => prev.map(loc => loc.id === id ? { ...loc, status: LocationStatus.APPROVED } : loc));
  };

  const deleteLocation = (id: string) => {
    if (window.confirm(t('confirm_delete'))) {
      setLocations(prev => prev.filter(loc => loc.id !== id));
      setIsFormOpen(false);
    }
  };

  // Prepare edit handler for ListView
  const handleEditFromList = (id: string) => {
    const loc = locations.find(l => l.id === id);
    if (loc) {
      onMarkerClick(loc);
    }
  };

  // Filter logic
  const visibleLocations = locations.filter(loc => {
    if (isAdmin) return true;
    return loc.status === LocationStatus.APPROVED;
  });

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gray-100 font-sans flex flex-col">
      
      {/* Top Navigation */}
      <Header 
        viewMode={viewMode} 
        setViewMode={setViewMode} 
        isAdmin={isAdmin} 
        setIsAdmin={setIsAdmin}
        canSwitchAdmin={canSwitchAdmin}
        onSuggestClick={openSuggestForm}
        onUploadImage={handleMapImageUpload}
        language={language}
        setLanguage={setLanguage}
        t={t}
        locations={visibleLocations}
        onLocate={handleLocate}
      />

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden">
        {/* Helper Banner for Moving Mode */}
        {movingLocationId && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[60] bg-blue-600 text-white px-6 py-3 rounded-full shadow-xl animate-bounce font-bold border-2 border-white">
            <span className="mr-2">📍</span> 
            {t('move_instruction')}
            <button 
              onClick={() => setMovingLocationId(null)} 
              className="ml-4 underline text-blue-200 hover:text-white"
            >
              Hủy
            </button>
          </div>
        )}

        {viewMode === 'MAP' ? (
            <InteractiveMap 
                locations={visibleLocations} 
                activeCategory={activeCategory} 
                categories={CATEGORIES}
                isAdminMode={isAdmin}
                onMapClick={onMapClick}
                onMarkerClick={onMarkerClick}
                highlightedId={highlightedId}
                mapImage={mapImage}
                userLocation={userLocation}
                onRequestUserLocation={handleRequestUserLocation}
                isLocating={isLocating}
                t={t}
                language={language}
            />
        ) : (
            <ListView 
                locations={visibleLocations}
                categories={CATEGORIES}
                onLocate={handleLocate}
                isAdmin={isAdmin}
                onApprove={approveLocation}
                onDelete={deleteLocation}
                onEdit={handleEditFromList}
                t={t}
                language={language}
            />
        )}
      </main>

      {/* Bottom Category Filter */}
      {viewMode === 'MAP' && (
        <BottomNav 
            categories={CATEGORIES} 
            activeCategory={activeCategory} 
            onSelectCategory={setActiveCategory} 
            t={t}
            language={language}
        />
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <LocationFormModal 
            categories={CATEGORIES} 
            onClose={() => setIsFormOpen(false)} 
            onSubmit={handleFormSubmit}
            initialCoords={tempCoords}
            initialData={editingLocation}
            onDelete={deleteLocation}
            onStartMove={handleStartMove}
            isAdmin={isAdmin}
            t={t}
            language={language}
        />
      )}
    </div>
  );
}

export default App;