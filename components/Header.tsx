import React, { useState, useRef, useEffect } from 'react';
import { Icon } from './Icon';
import { Language, MapLocation } from '../types';

interface HeaderProps {
    viewMode: 'MAP' | 'LIST';
    setViewMode: (mode: 'MAP' | 'LIST') => void;
    isAdmin: boolean;
    setIsAdmin: (val: boolean) => void;
    canSwitchAdmin: boolean;
    onSuggestClick: () => void;
    onUploadImage: (file: File) => void;
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
    locations: MapLocation[];
    onLocate: (id: string) => void;
}

const Header: React.FC<HeaderProps> = ({ 
    viewMode, 
    setViewMode, 
    isAdmin, 
    setIsAdmin, 
    canSwitchAdmin,
    onSuggestClick,
    onUploadImage,
    language,
    setLanguage,
    t,
    locations,
    onLocate
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        onUploadImage(e.target.files[0]);
    }
  };

  const filteredLocations = searchQuery.length > 0 
    ? locations.filter(loc => loc.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const handleSearchResultClick = (id: string) => {
    onLocate(id);
    setShowSearchResults(false);
    setSearchQuery('');
  };

  const getLanguageFlag = (lang: Language) => {
      switch(lang) {
          case Language.VI: return '🇻🇳';
          case Language.CS: return '🇨🇿';
          case Language.DE: return '🇩🇪';
      }
  };

  return (
    <header className="absolute top-0 left-0 right-0 z-50 px-4 py-3 pointer-events-none">
      <div className="max-w-7xl mx-auto bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 flex flex-wrap items-center justify-between p-2 pl-4 pr-2 pointer-events-auto">
        
        {/* Logo Area */}
        <div className="flex items-center space-x-2 mr-4">
          <div className="w-8 h-8 bg-brand-red rounded-lg flex items-center justify-center text-white font-bold shadow-md">
            S
          </div>
          <div className="leading-none hidden lg:block">
             <div className="font-bold text-gray-800 text-sm">SAPA</div>
             <div className="text-[10px] text-brand-red font-bold tracking-wider">PRAHA</div>
          </div>
        </div>

        {/* Search & View Controls */}
        <div className="flex-1 flex items-center space-x-2 mr-2">
            
            <div className="flex items-center bg-gray-100 p-1 rounded-xl shrink-0">
                <button 
                    onClick={() => setViewMode('MAP')}
                    className={`flex items-center px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'MAP' ? 'bg-white text-brand-blue shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <Icon name="Map" size={14} className="mr-1 md:mr-1" />
                    <span className="hidden md:inline">{t('map')}</span>
                </button>
                <button 
                    onClick={() => setViewMode('LIST')}
                    className={`flex items-center px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'LIST' ? 'bg-white text-brand-blue shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <Icon name="List" size={14} className="mr-1 md:mr-1" />
                    <span className="hidden md:inline">{t('list')}</span>
                </button>
            </div>

            <div className="relative flex-1 max-w-xs" ref={searchRef}>
                <div className="flex items-center bg-gray-100 rounded-xl px-3 py-1.5 border border-transparent focus-within:border-brand-blue focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                    <Icon name="Search" size={14} className="text-gray-400 mr-2" />
                    <input 
                        type="text"
                        className="bg-transparent border-none outline-none text-sm w-full text-gray-700 placeholder-gray-400"
                        placeholder={t('search_placeholder')}
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setShowSearchResults(true);
                        }}
                        onFocus={() => setShowSearchResults(true)}
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600">
                            <Icon name="X" size={12} />
                        </button>
                    )}
                </div>

                {showSearchResults && searchQuery && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 max-h-60 overflow-y-auto z-[60]">
                        {filteredLocations.length > 0 ? (
                            filteredLocations.map(loc => (
                                <button 
                                    key={loc.id}
                                    onClick={() => handleSearchResultClick(loc.id)}
                                    className="w-full flex items-center p-2 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0"
                                >
                                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-200 shrink-0 mr-3">
                                        <img src={loc.image} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-800 line-clamp-1">{loc.title}</div>
                                        <div className="text-[10px] text-gray-500">{t('view')}</div>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="p-3 text-center text-gray-400 text-xs">
                                {t('no_results')}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <input 
             type="file" 
             ref={fileInputRef} 
             className="hidden" 
             accept="image/*" 
             onChange={handleFileChange}
          />

          <div className="flex items-center bg-gray-100 rounded-full p-1">
              {[Language.CS, Language.VI, Language.DE].map(lang => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`w-7 h-7 flex items-center justify-center rounded-full text-sm transition-all ${language === lang ? 'bg-white shadow-sm scale-110' : 'opacity-50 hover:opacity-100'}`}
                    title={lang}
                  >
                      {getLanguageFlag(lang)}
                  </button>
              ))}
          </div>
          
          {isAdmin && (
             <button 
                onClick={() => fileInputRef.current?.click()}
                className="hidden lg:flex items-center px-3 py-1.5 rounded-full bg-blue-50 text-brand-blue text-xs font-bold hover:bg-blue-100 transition-colors border border-blue-200"
             >
                 <Icon name="Map" size={14} className="mr-1" />
                 {t('change_bg')}
             </button>
          )}

          {canSwitchAdmin && (
            <button 
                onClick={() => setIsAdmin(!isAdmin)}
                className={`hidden lg:flex items-center px-3 py-1.5 rounded-full text-xs font-bold border ${isAdmin ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-500 border-gray-200'}`}
            >
                {isAdmin ? 'Admin' : 'Guest'}
            </button>
          )}

          <button 
             onClick={onSuggestClick}
             className="hidden lg:flex items-center px-3 py-1.5 rounded-full bg-brand-green text-white text-xs font-bold shadow hover:bg-[#7ab332] transition-colors"
          >
             <Icon name="Plus" size={14} className="mr-1" />
             {t('add_location')}
          </button>
          
          <button 
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-800"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Icon name={isMenuOpen ? "X" : "Menu"} size={18} />
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="absolute top-full left-4 right-4 mt-2 bg-white rounded-2xl shadow-xl p-2 flex flex-col space-y-1 pointer-events-auto animate-fade-in lg:hidden origin-top z-50">
           <button 
             onClick={onSuggestClick}
             className="w-full text-left px-4 py-3 rounded-xl text-brand-green font-bold hover:bg-green-50 flex items-center"
           >
              <Icon name="Plus" size={16} className="mr-2" />
              {t('add_location')}
           </button>
           
           {canSwitchAdmin && (
             <button 
               onClick={() => { setIsAdmin(!isAdmin); setIsMenuOpen(false); }}
               className="w-full text-left px-4 py-3 rounded-xl text-gray-600 font-medium hover:bg-gray-50 flex items-center"
             >
                <Icon name="Eye" size={16} className="mr-2" />
                {isAdmin ? t('admin_mode') : t('guest_mode')}
             </button>
           )}

           {isAdmin && (
             <button 
                onClick={() => { fileInputRef.current?.click(); setIsMenuOpen(false); }}
                className="w-full text-left px-4 py-3 rounded-xl text-brand-blue font-bold hover:bg-blue-50 flex items-center"
             >
                 <Icon name="Map" size={16} className="mr-2" />
                 {t('change_bg')}
             </button>
           )}
        </div>
      )}
    </header>
  );
};

export default Header;