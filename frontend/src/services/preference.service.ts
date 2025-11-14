import api from './api';
import { UserPreference, ApiResponse } from '../types';

export const preferenceService = {
  // Get user preferences
  getPreferences: async (language = 'fr'): Promise<ApiResponse<{ preferences: UserPreference[] }>> => {
    const response = await api.get('/preferences', { params: { language } });
    return response.data;
  },

  // Create preference
  createPreference: async (data: {
    conditionId: number;
    regionId: number;
    emailEnabled?: boolean;
    pushEnabled?: boolean;
    minSeverity?: string;
  }): Promise<ApiResponse<any>> => {
    const response = await api.post('/preferences', data);
    return response.data;
  },

  // Update preference
  updatePreference: async (
    id: number,
    data: {
      emailEnabled?: boolean;
      pushEnabled?: boolean;
      minSeverity?: string;
    }
  ): Promise<ApiResponse<any>> => {
    const response = await api.put(`/preferences/${id}`, data);
    return response.data;
  },

  // Delete preference
  deletePreference: async (id: number): Promise<ApiResponse<any>> => {
    const response = await api.delete(`/preferences/${id}`);
    return response.data;
  },
};
