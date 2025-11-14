import api from './api';
import { Condition, ApiResponse } from '../types';

export const conditionService = {
  // Get all conditions
  getConditions: async (language = 'fr'): Promise<ApiResponse<{ conditions: Condition[] }>> => {
    const response = await api.get('/conditions', {
      params: { language, active: true },
    });
    return response.data;
  },

  // Get condition by ID
  getConditionById: async (id: number, language = 'fr'): Promise<ApiResponse<{ condition: Condition }>> => {
    const response = await api.get(`/conditions/${id}`, { params: { language } });
    return response.data;
  },
};
