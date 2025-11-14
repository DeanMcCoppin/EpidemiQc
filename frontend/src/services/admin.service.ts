import api from './api';
import { TestResult, Threshold, Analytics, ApiResponse } from '../types';

export const adminService = {
  // Test Results
  getTestResults: async (params?: {
    regionId?: number;
    conditionId?: number;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ results: TestResult[]; pagination: any }>> => {
    const response = await api.get('/admin/test-results', { params });
    return response.data;
  },

  createTestResult: async (data: {
    regionId: number;
    conditionId: number;
    testDate: string;
    totalTests: number;
    positiveTests: number;
  }): Promise<ApiResponse<any>> => {
    const response = await api.post('/admin/test-results', data);
    return response.data;
  },

  // Analytics
  getAnalyticsOverview: async (): Promise<ApiResponse<Analytics>> => {
    const response = await api.get('/admin/analytics/overview');
    return response.data;
  },

  // Thresholds
  getThresholds: async (conditionId?: number): Promise<ApiResponse<{ thresholds: Threshold[] }>> => {
    const response = await api.get('/admin/thresholds', {
      params: { conditionId },
    });
    return response.data;
  },

  updateThreshold: async (
    id: number,
    data: {
      thresholdValue?: number;
      colorCode?: string;
    }
  ): Promise<ApiResponse<any>> => {
    const response = await api.put(`/admin/thresholds/${id}`, data);
    return response.data;
  },
};
