import { Request } from 'express';

// Extended Express Request with user info
export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

// User types
export interface User {
  id: number;
  email: string;
  password_hash: string;
  first_name?: string;
  last_name?: string;
  role: string;
  is_verified: boolean;
  preferred_language: string;
  created_at: Date;
  updated_at: Date;
  last_login?: Date;
}

// Region types
export interface Region {
  id: number;
  name_fr: string;
  name_en: string;
  code: string;
  region_type?: string;
  population?: number;
  center_lat?: number;
  center_lng?: number;
}

// Condition types
export interface Condition {
  id: number;
  name_fr: string;
  name_en: string;
  code: string;
  description_fr?: string;
  description_en?: string;
  category?: string;
  is_active: boolean;
}

// Test Result types
export interface TestResult {
  id: number;
  region_id: number;
  condition_id: number;
  test_date: string;
  total_tests: number;
  positive_tests: number;
  positive_rate: number;
  population_tested?: number;
}

// Threshold types
export interface Threshold {
  id: number;
  condition_id: number;
  region_id?: number;
  threshold_type: string;
  threshold_value: number;
  color_code?: string;
}

// Outbreak types
export interface Outbreak {
  region: Region;
  condition: Condition;
  positiveRate: number;
  severity: string;
  colorCode: string;
  trend: string;
  affectedPopulation?: number;
  lastUpdated: string;
}

// Notification types
export interface Notification {
  id: number;
  user_id: number;
  region_id?: number;
  condition_id?: number;
  notification_type: string;
  severity: string;
  title: string;
  message: string;
  sent_at: Date;
  is_read: boolean;
  read_at?: Date;
}

// User Preference types
export interface UserPreference {
  id: number;
  user_id: number;
  condition_id: number;
  region_id: number;
  email_enabled: boolean;
  push_enabled: boolean;
  min_severity: string;
}
