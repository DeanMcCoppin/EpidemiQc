import api from './api';
import { Outbreak, MapRegion, ApiResponse } from '../types';

export const outbreakService = {
  // Get current outbreaks
  getCurrentOutbreaks: async (params?: {
    language?: string;
    severity?: string;
    regionId?: number;
  }): Promise<ApiResponse<{ outbreaks: Outbreak[]; summary: any }>> => {
    const response = await api.get('/outbreaks/current', { params });
    return response.data;
  },

  // Get map data
  getMapData: async (language = 'fr'): Promise<ApiResponse<{ regions: MapRegion[] }>> => {
    const response = await api.get('/outbreaks/map-data', { params: { language } });
    return response.data;
  },
};
