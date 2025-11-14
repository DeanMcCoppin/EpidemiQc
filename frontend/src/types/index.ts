// User types
export interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  preferredLanguage: string;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  preferredLanguage?: string;
}

// Region types
export interface Region {
  id: number;
  code: string;
  name: string;
  population?: number;
  centerLat: number;
  centerLng: number;
}

// Condition types
export interface Condition {
  id: number;
  code: string;
  name: string;
  description?: string;
  category?: string;
  isActive: boolean;
}

// Outbreak types
export interface Outbreak {
  region: Region;
  condition: Condition;
  positiveRate: number;
  totalTests: number;
  positiveTests: number;
  severity: 'normal' | 'warning' | 'alert' | 'critical';
  colorCode: string;
  trend: string;
  affectedPopulation?: number;
  lastUpdated: string;
}

// Map data types
export interface MapRegion extends Region {
  outbreaks: {
    conditionName: string;
    conditionCode: string;
    positiveRate: number;
  }[];
  maxSeverity: string;
  colorCode: string;
}

// Hospital types
export interface Hospital {
  id: number;
  name: string;
  regionId: number;
  regionCode: string;
  regionName: string;
  type: string;
  city: string;
  address?: string;
  postalCode?: string;
  phone?: string;
  latitude: number;
  longitude: number;
  bedCount: number;
  hasEmergency: boolean;
  hasICU: boolean;
  hasLab: boolean;
}

// Preference types
export interface UserPreference {
  id: number;
  condition: Condition;
  region: Region;
  emailEnabled: boolean;
  pushEnabled: boolean;
  minSeverity: string;
}

// Admin types
export interface TestResult {
  id: number;
  regionCode: string;
  regionName: string;
  conditionCode: string;
  conditionName: string;
  testDate: string;
  totalTests: number;
  positiveTests: number;
  positiveRate: number;
}

export interface Threshold {
  id: number;
  conditionCode: string;
  conditionName: string;
  thresholdType: string;
  thresholdValue: number;
  colorCode: string;
}

export interface Analytics {
  totalUsers: number;
  activeUsers: number;
  totalOutbreaks: number;
  criticalOutbreaks: number;
  notificationsSentToday: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    details?: any;
  };
}
