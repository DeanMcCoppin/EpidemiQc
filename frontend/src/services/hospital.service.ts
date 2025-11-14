import api from './api';
import { Hospital, ApiResponse } from '../types';

export const hospitalService = {
  // Get all hospitals
  getHospitals: async (params?: {
    language?: string;
    regionId?: number;
    hasLab?: boolean;
  }): Promise<ApiResponse<{ hospitals: Hospital[] }>> => {
    const response = await api.get('/hospitals', { params });
    return response.data;
  },

  // Get hospital by ID
  getHospitalById: async (
    id: number,
    language = 'fr'
  ): Promise<ApiResponse<{ hospital: Hospital }>> => {
    const response = await api.get(`/hospitals/${id}`, { params: { language } });
    return response.data;
  },
};
