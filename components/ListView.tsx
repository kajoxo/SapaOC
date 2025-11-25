import React from 'react';
import { MapLocation, CategoryConfig, LocationStatus, Language } from '../types';
import { Icon } from './Icon';

interface ListViewProps {
  locations: MapLocation[];
  categories: CategoryConfig[];
  onLocate: (id: string) => void;
  isAdmin: boolean;
  onApprove?: (id: string) => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  t: (key: string) => string;
  language: Language;
}

const ListView: React.FC<ListViewProps> = ({ locations, categories, onLocate, isAdmin, onApprove, onDelete, onEdit, t, language }) => {
  return (
    <div className="w-full h-full bg-gray-50 overflow-y-auto pb-32 pt-20 px-4">
      <div className="max-w-3xl mx-auto space-y-4">
        {locations.length === 0 ? (
           <div className="text-center py-20 text-gray-400">
               <Icon name="Search" size={48} className="mx-auto mb-4 opacity-50" />
               <p>{t('empty_list')}</p>
           </div>
        ) : (
            locations.map(location => {
            const catConfig = categories.find(c => c.id === location.category);
            // Safety check: ensure label exists for language, otherwise fallback to ID
            const categoryLabel = catConfig && catConfig.label && catConfig.label[language] 
                ? catConfig.label[language] 
                : location.category;

            return (
                <div key={location.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col sm:flex-row hover:shadow-md transition-shadow relative">
                
                {/* Status Badge for Admin */}
                {isAdmin && location.status === LocationStatus.PENDING && (
                    <div className="absolute top-2 left-2 z-10 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm animate-pulse">
                        {t('pending')}
                    </div>
                )}

                {/* Image */}
                <div className="sm:w-1/3 h-48 sm:h-auto relative group">
                    <img 
                    src={location.image || 'https://via.placeholder.com/400x300?text=No+Image'} 
                    alt={location.title}
                    className="w-full h-full object-cover"
                    />
                    <div className={`absolute bottom-2 left-2 px-2 py-1 rounded text-xs font-bold text-white uppercase ${catConfig?.color || 'bg-gray-500'}`}>
                    {categoryLabel}
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start">
                            <h3 className="text-xl font-bold text-gray-800 mb-1">{location.title}</h3>
                            {location.rating && (
                                <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-1 rounded flex items-center">
                                    <Icon name="Star" size={12} className="mr-1 fill-current" />
                                    {location.rating}
                                </span>
                            )}
                        </div>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{location.description}</p>
                        
                        <div className="space-y-1">
                            {location.phoneNumber && (
                                <div className="flex items-center text-gray-500 text-sm">
                                    <Icon name="Phone" size={14} className="mr-2" />
                                    {location.phoneNumber}
                                </div>
                            )}
                            {location.openHours && (
                                <div className="flex items-center text-gray-500 text-sm">
                                    <Icon name="Clock" size={14} className="mr-2" />
                                    {location.openHours}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                        <button 
                            onClick={() => onLocate(location.id)}
                            className="flex items-center text-sm font-semibold text-brand-blue bg-blue-50 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                            <Icon name="MapPin" size={16} className="mr-2" />
                            {t('view')}
                        </button>

                        {isAdmin && (
                            <>
                                {location.status === LocationStatus.PENDING && onApprove && (
                                    <button 
                                        onClick={() => onApprove(location.id)}
                                        className="flex items-center text-sm font-semibold text-white bg-green-500 px-3 py-2 rounded-lg hover:bg-green-600 transition-colors"
                                    >
                                        <Icon name="Check" size={16} className="mr-2" />
                                        {t('approve')}
                                    </button>
                                )}
                                
                                {onEdit && (
                                     <button 
                                        onClick={() => onEdit(location.id)}
                                        className="flex items-center text-sm font-semibold text-gray-700 bg-gray-100 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        {t('edit')}
                                    </button>
                                )}

                                {onDelete && (
                                     <button 
                                        onClick={() => onDelete(location.id)}
                                        className="flex items-center text-sm font-semibold text-red-500 bg-red-50 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors"
                                    >
                                        {t('delete')}
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
                </div>
            );
            })
        )}
      </div>
    </div>
  );
};

export default ListView;