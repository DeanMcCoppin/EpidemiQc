import api from './api';
import { Region, ApiResponse } from '../types';

export const regionService = {
  // Get all regions
  getRegions: async (language = 'fr', search?: string): Promise<ApiResponse<{ regions: Region[] }>> => {
    const response = await api.get('/regions', { params: { language, search } });
    return response.data;
  },

  // Get region by ID
  getRegionById: async (id: number, language = 'fr'): Promise<ApiResponse<{ region: Region }>> => {
    const response = await api.get(`/regions/${id}`, { params: { language } });
    return response.data;
  },

  // Get region trends
  getRegionTrends: async (
    id: number,
    conditionId: number,
    days = 30
  ): Promise<ApiResponse<{ trends: any[] }>> => {
    const response = await api.get(`/regions/${id}/trends`, {
      params: { conditionId, days },
    });
    return response.data;
  },
};
