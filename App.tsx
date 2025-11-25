import React, { useState, useEffect } from 'react';
import { CATEGORIES, INITIAL_LOCATIONS, SAPA_BOUNDS, TRANSLATIONS } from './constants';
import { LocationCategory, MapLocation, LocationStatus, Language, UserLocation } from './types';
import InteractiveMap from './components/InteractiveMap';
import ListView from './components/ListView';
import BottomNav from './components/BottomNav';
import Header from './components/Header';
import LocationFormModal from './components/LocationModal';
import { api } from './services/api';

function App() {
  const [activeCategory, setActiveCategory] = useState<LocationCategory | null>(null);
  const [viewMode, setViewMode] = useState<'MAP' | 'LIST'>('MAP');
  const [language, setLanguage] = useState<Language>(Language.CS);
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [canSwitchAdmin, setCanSwitchAdmin] = useState(false);
  
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [tempCoords, setTempCoords] = useState<{x: number, y: number} | null>(null);
  const [editingLocation, setEditingLocation] = useState<MapLocation | null>(null);
  const [movingLocationId, setMovingLocationId] = useState<string | null>(null);

  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Initialize with empty array, fetch on mount
  const [locations, setLocations] = useState<MapLocation[]>(INITIAL_LOCATIONS);
  const [mapImage, setMapImage] = useState<string>("");

  // Translation Helper
  const t = (key: string): string => {
    return (TRANSLATIONS[language] as Record<string, string>)[key] || key;
  };

  // 1. Check URL for Admin Secret
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const secretKey = searchParams.get('secret');
    if (secretKey === 'sapaadmin') {
      setCanSwitchAdmin(true);
      setIsAdmin(true);
    }
  }, []);

  // 2. Fetch Data from Server (or LocalStorage fallback)
  useEffect(() => {
    const loadData = async () => {
       const [fetchedLocations, fetchedMapBg] = await Promise.all([
          api.getLocations(),
          api.getMapImage()
       ]);
       
       if (fetchedLocations && fetchedLocations.length > 0) {
           setLocations(fetchedLocations);
       }
       setMapImage(fetchedMapBg);
    };
    loadData();
  }, []);

  // 3. Save to Server whenever locations change
  // We use a debounce or direct call. Here direct call for simplicity.
  const updateLocations = async (newLocations: MapLocation[]) => {
      setLocations(newLocations); // Optimistic UI update
      await api.saveLocations(newLocations); // Background save
  };

  const handleMapImageUpload = async (file: File) => {
      if (file) {
          try {
             // Upload image to server/photos
             const url = await api.uploadImage(file);
             setMapImage(url);
             api.saveMapImage(url);
             alert("Đã cập nhật ảnh nền bản đồ thành công!");
          } catch (e) {
             alert("Lỗi tải ảnh nền.");
          }
      }
  };

  const handleLocate = (id: string) => {
    setViewMode('MAP');
    setHighlightedId(id);
    setTimeout(() => setHighlightedId(null), 3000);
  };

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
            const latRange = SAPA_BOUNDS.topLeft.lat - SAPA_BOUNDS.bottomRight.lat;
            const lngRange = SAPA_BOUNDS.bottomRight.lng - SAPA_BOUNDS.topLeft.lng;
            const yPct = (SAPA_BOUNDS.topLeft.lat - latitude) / latRange;
            const xPct = (longitude - SAPA_BOUNDS.topLeft.lng) / lngRange;
            setUserLocation({ x: xPct * 100, y: yPct * 100 });
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

  const handleFormSubmit = (data: any) => {
    let newLocations = [...locations];
    
    if (editingLocation) {
      newLocations = newLocations.map(loc => 
        loc.id === editingLocation.id ? { ...loc, ...data } : loc
      );
    } else {
      const newLocation: MapLocation = {
        id: Date.now().toString(),
        ...data,
        status: isAdmin ? LocationStatus.APPROVED : LocationStatus.PENDING,
        rating: 5.0,
      };
      newLocations.push(newLocation);
    }

    updateLocations(newLocations);
    setIsFormOpen(false);
    setTempCoords(null);
    setEditingLocation(null);
  };

  const onMapClick = (x: number, y: number) => {
    if (movingLocationId && isAdmin) {
      const newLocations = locations.map(loc => 
        loc.id === movingLocationId ? { ...loc, x, y } : loc
      );
      updateLocations(newLocations);
      setMovingLocationId(null);
      alert("Đã cập nhật vị trí mới!");
      return;
    }

    if (isAdmin) {
      setTempCoords({ x, y });
      setEditingLocation(null);
      setIsFormOpen(true);
    }
  };

  const onMarkerClick = (location: MapLocation) => {
    if (isAdmin) {
      setEditingLocation(location);
      setTempCoords({ x: location.x, y: location.y });
      setIsFormOpen(true);
    }
  };

  const handleStartMove = (id: string) => {
    setIsFormOpen(false);
    setMovingLocationId(id);
  };

  const openSuggestForm = () => {
    setTempCoords(null);
    setEditingLocation(null);
    setIsFormOpen(true);
  };

  const approveLocation = (id: string) => {
    const newLocations = locations.map(loc => loc.id === id ? { ...loc, status: LocationStatus.APPROVED } : loc);
    updateLocations(newLocations);
  };

  const deleteLocation = (id: string) => {
    if (window.confirm(t('confirm_delete'))) {
      const newLocations = locations.filter(loc => loc.id !== id);
      updateLocations(newLocations);
      setIsFormOpen(false);
    }
  };

  const handleEditFromList = (id: string) => {
    const loc = locations.find(l => l.id === id);
    if (loc) onMarkerClick(loc);
  };

  const visibleLocations = locations.filter(loc => {
    if (isAdmin) return true;
    return loc.status === LocationStatus.APPROVED;
  });

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gray-100 font-sans flex flex-col">
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

      <main className="flex-1 relative overflow-hidden">
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

      {viewMode === 'MAP' && (
        <BottomNav 
            categories={CATEGORIES} 
            activeCategory={activeCategory} 
            onSelectCategory={setActiveCategory} 
            t={t}
            language={language}
        />
      )}

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