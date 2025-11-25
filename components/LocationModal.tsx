import React, { useState, useRef, useEffect } from 'react';
import { CategoryConfig, LocationCategory, MapLocation, Language } from '../types';
import { Icon } from './Icon';

interface LocationFormModalProps {
  categories: CategoryConfig[];
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialCoords?: { x: number, y: number } | null;
  initialData?: MapLocation | null;
  onDelete?: (id: string) => void;
  onStartMove?: (id: string) => void;
  isAdmin?: boolean;
  t: (key: string) => string;
  language: Language;
}

const LocationFormModal: React.FC<LocationFormModalProps> = ({ 
    categories, 
    onClose, 
    onSubmit, 
    initialCoords,
    initialData,
    onDelete,
    onStartMove,
    isAdmin,
    t,
    language
}) => {
  const [formData, setFormData] = useState({
    title: '',
    category: LocationCategory.FOOD,
    description: '',
    phoneNumber: '',
    image: '',
    openHours: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        category: initialData.category,
        description: initialData.description,
        phoneNumber: initialData.phoneNumber || '',
        image: initialData.image || '',
        openHours: initialData.openHours || ''
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
        ...formData,
        x: initialData ? initialData.x : (initialCoords ? initialCoords.x : 50),
        y: initialData ? initialData.y : (initialCoords ? initialCoords.y : 50),
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const isEditMode = !!initialData;

  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-up flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h2 className="text-lg font-bold text-gray-800">
                {isEditMode ? t('form_edit_title') : t('form_add_title')}
            </h2>
            <button onClick={onClose} className="p-2 bg-white rounded-full text-gray-500 hover:text-gray-800 shadow-sm">
                <Icon name="X" size={18} />
            </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
            {/* Coordinate Info or Move Button */}
            <div className="flex justify-between items-center bg-blue-50 p-2 rounded border border-blue-100">
               <div className="text-xs text-gray-500">
                  {isEditMode 
                    ? `${t('form_coords')}: ${initialData?.x.toFixed(1)}%, ${initialData?.y.toFixed(1)}%`
                    : initialCoords 
                        ? `${t('form_coords')}: ${initialCoords.x.toFixed(1)}%, ${initialCoords.y.toFixed(1)}%`
                        : `${t('form_coords')}: N/A`
                  }
               </div>
               {isEditMode && isAdmin && onStartMove && initialData && (
                 <button 
                   type="button"
                   onClick={() => onStartMove(initialData.id)}
                   className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold hover:bg-blue-200"
                 >
                   {t('form_move')}
                 </button>
               )}
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{t('form_name')}</label>
                <input 
                    required
                    type="text" 
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none"
                    placeholder="..."
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">{t('form_category')}</label>
                    <select 
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-blue outline-none"
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value as LocationCategory})}
                    >
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.label[language]}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">{t('form_phone')}</label>
                    <input 
                        type="text" 
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-blue outline-none"
                        placeholder="0912..."
                        value={formData.phoneNumber}
                        onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{t('form_desc')}</label>
                <textarea 
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-blue outline-none resize-none"
                    placeholder="..."
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                />
            </div>

            {/* Image Upload Section */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{t('form_image')}</label>
                
                <div className="flex items-center space-x-3">
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 font-medium transition-colors flex items-center"
                  >
                    <Icon name="Plus" size={16} className="mr-2" />
                    {t('form_upload')}
                  </button>
                  <span className="text-xs text-gray-400 italic">
                    {formData.image ? '✓ OK' : ''}
                  </span>
                </div>
                
                <input 
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                />

                {formData.image && (
                  <div className="mt-2 relative w-full h-32 rounded-lg overflow-hidden border border-gray-200 group">
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, image: ''})}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Icon name="X" size={14} />
                    </button>
                  </div>
                )}
            </div>

            <div className="flex gap-3 pt-2">
                {isEditMode && isAdmin && onDelete && initialData && (
                  <button 
                    type="button"
                    onClick={() => onDelete(initialData.id)}
                    className="px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-colors"
                  >
                    {t('delete')}
                  </button>
                )}
                <button 
                    type="submit"
                    className="flex-1 bg-brand-green hover:bg-[#7ab332] text-white font-bold py-3 rounded-xl shadow-lg transition-transform hover:scale-[1.02] active:scale-95"
                >
                    {isEditMode ? t('form_update') : (isAdmin ? t('form_create') : t('form_submit'))}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default LocationFormModal;