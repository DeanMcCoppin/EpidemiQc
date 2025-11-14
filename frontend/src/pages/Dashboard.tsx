import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { outbreakService } from '../services/outbreak.service';
import { Outbreak } from '../types';
import toast from 'react-hot-toast';
import { AlertTriangle, TrendingUp, Users } from 'lucide-react';

const Dashboard = () => {
  const { t, i18n } = useTranslation();
  const [outbreaks, setOutbreaks] = useState<Outbreak[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadOutbreaks();
  }, [i18n.language, filter]);

  const loadOutbreaks = async () => {
    try {
      const params: any = { language: i18n.language };
      if (filter !== 'all') {
        params.severity = filter;
      }
      const response = await outbreakService.getCurrentOutbreaks(params);
      if (response.success && response.data) {
        setOutbreaks(response.data.outbreaks);
        setSummary(response.data.summary);
      }
    } catch (error) {
      toast.error('Error loading outbreaks');
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    const colors: any = {
      critical: 'bg-red-100 text-red-800 border-red-300',
      alert: 'bg-orange-100 text-orange-800 border-orange-300',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      normal: 'bg-green-100 text-green-800 border-green-300',
    };
    return colors[severity] || colors.normal;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">{t('dashboard.title')}</h1>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-8 w-8 text-blue-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{t('dashboard.currentOutbreaks')}</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-red-500 rounded-full"></div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{t('severity.critical')}</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.bySeverity.critical}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-orange-500 rounded-full"></div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{t('severity.alert')}</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.bySeverity.alert}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-yellow-500 rounded-full"></div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{t('severity.warning')}</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.bySeverity.warning}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex space-x-2">
          {['all', 'critical', 'alert', 'warning'].map((severity) => (
            <button
              key={severity}
              onClick={() => setFilter(severity)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === severity
                  ? 'bg-quebec-blue text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {severity === 'all' ? t('common.all') : t(`severity.${severity}`)}
            </button>
          ))}
        </div>

        {/* Outbreaks List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="spinner"></div>
          </div>
        ) : outbreaks.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">{t('dashboard.noOutbreaks')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {outbreaks.map((outbreak, idx) => (
              <div
                key={idx}
                className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${outbreak.severity === 'critical'
                  ? 'border-red-500'
                  : outbreak.severity === 'alert'
                  ? 'border-orange-500'
                  : outbreak.severity === 'warning'
                  ? 'border-yellow-500'
                  : 'border-green-500'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{outbreak.region.name}</h3>
                    <p className="text-sm text-gray-600">{outbreak.condition.name}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getSeverityColor(
                      outbreak.severity
                    )}`}
                  >
                    {t(`severity.${outbreak.severity}`)}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">{t('dashboard.positiveRate')}:</span>
                    <span className="text-sm font-bold text-red-600">
                      {outbreak.positiveRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">{t('dashboard.tests')}:</span>
                    <span className="text-sm font-semibold">{outbreak.totalTests}</span>
                  </div>
                  {outbreak.affectedPopulation && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">{t('dashboard.affectedPopulation')}:</span>
                      <span className="text-sm font-semibold">{outbreak.affectedPopulation}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">{t('dashboard.trend')}:</span>
                    <span className="text-sm font-semibold capitalize">{outbreak.trend}</span>
                  </div>
                  <div className="pt-2 border-t">
                    <span className="text-xs text-gray-500">
                      {t('dashboard.lastUpdated')}: {new Date(outbreak.lastUpdated).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
