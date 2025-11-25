export enum LocationCategory {
  FOOD = 'FOOD',
  SHOPPING = 'SHOPPING',
  SERVICE = 'SERVICE',
  WC = 'WC',
  ENTRANCE = 'ENTRANCE',
}

export enum LocationStatus {
  APPROVED = 'APPROVED',
  PENDING = 'PENDING',
}

export enum Language {
  VI = 'VI',
  CS = 'CS',
  DE = 'DE',
}

export interface MapLocation {
  id: string;
  title: string;
  description: string;
  category: LocationCategory;
  x: number; // Percentage from left (0-100)
  y: number; // Percentage from top (0-100)
  image?: string;
  rating?: number;
  openHours?: string;
  phoneNumber?: string;
  status: LocationStatus;
}

export interface CategoryConfig {
  id: LocationCategory;
  label: Record<Language, string>; // Localized label
  color: string;
  iconName: string; 
}

export interface UserLocation {
  x: number;
  y: number;
}