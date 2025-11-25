import React from 'react';
import { 
  Utensils, 
  ShoppingBag, 
  Info, 
  Bath, 
  MapPin, 
  X, 
  Navigation, 
  Clock, 
  Star,
  Menu,
  Phone,
  Search,
  ChevronUp,
  List,
  Plus,
  Map,
  Check,
  Eye,
  Globe,
  Target,
  Smartphone,
  RotateCw
} from 'lucide-react';

interface IconProps {
  name: string;
  size?: number;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({ name, size = 24, className = '' }) => {
  const icons: Record<string, React.ElementType> = {
    Utensils,
    ShoppingBag,
    Info,
    Bath,
    MapPin,
    X,
    Navigation,
    Clock,
    Star,
    Menu,
    Phone,
    Search,
    ChevronUp,
    List,
    Plus,
    Map,
    Check,
    Eye,
    Globe,
    Target,
    Smartphone,
    RotateCw
  };

  const IconComponent = icons[name] || MapPin;

  return <IconComponent size={size} className={className} />;
};