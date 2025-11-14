import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { adminService } from '../services/admin.service';
import { regionService } from '../services/region.service';
import { conditionService } from '../services/condition.service';
import { Analytics, TestResult, Region, Condition } from '../types';
import { Users, Activity, AlertTriangle, Bell, Plus } from 'lucide-react';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState({
    regionId: 0,
    conditionId: 0,
    testDate: new Date().toISOString().split('T')[0],
    totalTests: '',
    positiveTests: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [analyticsRes, resultsRes, regionsRes, conditionsRes] = await Promise.all([
        adminService.getAnalyticsOverview(),
        adminService.getTestResults({ limit: 10 }),
        regionService.getRegions(),
        conditionService.getConditions(),
      ]);

      if (analyticsRes.success && analyticsRes.data) setAnalytics(analyticsRes.data);
      if (resultsRes.success && resultsRes.data) setTestResults(resultsRes.data.results);
      if (regionsRes.success && regionsRes.data) setRegions(regionsRes.data.regions);
      if (conditionsRes.success && conditionsRes.data) setConditions(conditionsRes.data.conditions);
    } catch (error) {
      toast.error('Error loading admin data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTestResult = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      formData.regionId === 0 ||
      formData.conditionId === 0 ||
      !formData.totalTests ||
      !formData.positiveTests
    ) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      await adminService.createTestResult({
        regionId: formData.regionId,
        conditionId: formData.conditionId,
        testDate: formData.testDate,
        totalTests: parseInt(formData.totalTests),
        positiveTests: parseInt(formData.positiveTests),
      });
      toast.success('Test result added successfully');
      setShowAddForm(false);
      setFormData({
        regionId: 0,
        conditionId: 0,
        testDate: new Date().toISOString().split('T')[0],
        totalTests: '',
        positiveTests: '',
      });
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Error adding test result');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">{t('admin.title')}</h1>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <Users className="h-10 w-10 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{t('admin.totalUsers')}</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.totalUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <Activity className="h-10 w-10 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{t('admin.activeUsers')}</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.activeUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <AlertTriangle className="h-10 w-10 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{t('admin.totalOutbreaks')}</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.totalOutbreaks}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <AlertTriangle className="h-10 w-10 text-red-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{t('admin.criticalOutbreaks')}</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.criticalOutbreaks}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <Bell className="h-10 w-10 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{t('admin.notificationsSent')}</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.notificationsSentToday}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Data Management Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">{t('admin.dataManagement')}</h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center space-x-2 px-4 py-2 bg-quebec-blue text-white rounded-lg hover:bg-quebec-blue-dark transition"
            >
              <Plus size={20} />
              <span>{t('admin.addTestResult')}</span>
            </button>
          </div>

          {/* Add Test Result Form */}
          {showAddForm && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <form onSubmit={handleAddTestResult} className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.region')}</label>
                  <select
                    value={formData.regionId}
                    onChange={(e) => setFormData({ ...formData, regionId: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-quebec-blue focus:border-quebec-blue"
                    required
                  >
                    <option value={0}>-- Select --</option>
                    {regions.map((region) => (
                      <option key={region.id} value={region.id}>
                        {region.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.condition')}</label>
                  <select
                    value={formData.conditionId}
                    onChange={(e) => setFormData({ ...formData, conditionId: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-quebec-blue focus:border-quebec-blue"
                    required
                  >
                    <option value={0}>-- Select --</option>
                    {conditions.map((condition) => (
                      <option key={condition.id} value={condition.id}>
                        {condition.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.date')}</label>
                  <input
                    type="date"
                    value={formData.testDate}
                    onChange={(e) => setFormData({ ...formData, testDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-quebec-blue focus:border-quebec-blue"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.totalTests')}</label>
                  <input
                    type="number"
                    value={formData.totalTests}
                    onChange={(e) => setFormData({ ...formData, totalTests: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-quebec-blue focus:border-quebec-blue"
                    required
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.positiveTests')}</label>
                  <input
                    type="number"
                    value={formData.positiveTests}
                    onChange={(e) => setFormData({ ...formData, positiveTests: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-quebec-blue focus:border-quebec-blue"
                    required
                    min="0"
                  />
                </div>

                <div className="md:col-span-5 flex space-x-3">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-quebec-blue text-white rounded hover:bg-quebec-blue-dark transition"
                  >
                    {t('admin.save')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
                  >
                    {t('admin.cancel')}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Recent Test Results Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.region')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.condition')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.date')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.totalTests')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.positiveTests')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.positiveRate')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {testResults.map((result) => (
                  <tr key={result.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {result.regionName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {result.conditionName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(result.testDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {result.totalTests}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {result.positiveTests}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 rounded ${
                          result.positiveRate >= 20
                            ? 'bg-red-100 text-red-800'
                            : result.positiveRate >= 10
                            ? 'bg-orange-100 text-orange-800'
                            : result.positiveRate >= 5
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {result.positiveRate.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
