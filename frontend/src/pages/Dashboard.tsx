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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <AlertTriangle className="w-10 h-10 text-blue-400" />
            {t('dashboard.title')}
          </h1>
          <p className="text-slate-400">{i18n.language === 'fr' ? 'Vue d\'ensemble des éclosions actives' : 'Overview of active outbreaks'}</p>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/30 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-sm font-medium mb-1">{t('dashboard.currentOutbreaks')}</p>
                  <p className="text-4xl font-bold text-white">{summary.total}</p>
                </div>
                <div className="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <AlertTriangle className="h-8 w-8 text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-500/20 to-red-600/10 backdrop-blur-sm rounded-2xl p-6 border border-red-500/30 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-200 text-sm font-medium mb-1">{t('severity.critical')}</p>
                  <p className="text-4xl font-bold text-white">{summary.bySeverity.critical}</p>
                </div>
                <div className="w-14 h-14 rounded-xl bg-red-500/30 flex items-center justify-center">
                  <div className="h-8 w-8 bg-red-500 rounded-full shadow-lg shadow-red-500/50"></div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 backdrop-blur-sm rounded-2xl p-6 border border-orange-500/30 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-200 text-sm font-medium mb-1">{t('severity.alert')}</p>
                  <p className="text-4xl font-bold text-white">{summary.bySeverity.alert}</p>
                </div>
                <div className="w-14 h-14 rounded-xl bg-orange-500/30 flex items-center justify-center">
                  <div className="h-8 w-8 bg-orange-500 rounded-full shadow-lg shadow-orange-500/50"></div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 backdrop-blur-sm rounded-2xl p-6 border border-yellow-500/30 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-200 text-sm font-medium mb-1">{t('severity.warning')}</p>
                  <p className="text-4xl font-bold text-white">{summary.bySeverity.warning}</p>
                </div>
                <div className="w-14 h-14 rounded-xl bg-yellow-500/30 flex items-center justify-center">
                  <div className="h-8 w-8 bg-yellow-500 rounded-full shadow-lg shadow-yellow-500/50"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-3">
          {['all', 'critical', 'alert', 'warning'].map((severity) => (
            <button
              key={severity}
              onClick={() => setFilter(severity)}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                filter === severity
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-slate-700'
              }`}
            >
              {severity === 'all' ? t('common.all') : t(`severity.${severity}`)}
            </button>
          ))}
        </div>

        {/* Outbreaks List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="text-center">
              <div className="spinner mb-4"></div>
              <p className="text-slate-400">Loading outbreaks...</p>
            </div>
          </div>
        ) : outbreaks.length === 0 ? (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-xl p-12 text-center">
            <p className="text-slate-400 text-lg">{t('dashboard.noOutbreaks')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {outbreaks.map((outbreak, idx) => (
              <div
                key={idx}
                className={`bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-xl p-6 border-l-4 transition-all duration-200 hover:scale-105 hover:shadow-2xl ${
                  outbreak.severity === 'critical'
                    ? 'border-red-500'
                    : outbreak.severity === 'alert'
                    ? 'border-orange-500'
                    : outbreak.severity === 'warning'
                    ? 'border-yellow-500'
                    : 'border-green-500'
                } ${
                  outbreak.severity === 'critical'
                    ? 'hover:border-red-400 bg-red-500/5'
                    : outbreak.severity === 'alert'
                    ? 'hover:border-orange-400 bg-orange-500/5'
                    : outbreak.severity === 'warning'
                    ? 'hover:border-yellow-400 bg-yellow-500/5'
                    : 'hover:border-green-400 bg-green-500/5'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{outbreak.region.name}</h3>
                    <p className="text-sm text-slate-400">{outbreak.condition.name}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                      outbreak.severity === 'critical'
                        ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                        : outbreak.severity === 'alert'
                        ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                        : outbreak.severity === 'warning'
                        ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                        : 'bg-green-500/20 text-green-300 border border-green-500/30'
                    }`}
                  >
                    {t(`severity.${outbreak.severity}`)}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg">
                    <span className="text-sm text-slate-400">{t('dashboard.positiveRate')}:</span>
                    <span className="text-lg font-bold text-red-400">
                      {outbreak.positiveRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">{t('dashboard.tests')}:</span>
                    <span className="text-sm font-semibold text-white">{outbreak.totalTests}</span>
                  </div>
                  {outbreak.affectedPopulation && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-400">{t('dashboard.affectedPopulation')}:</span>
                      <span className="text-sm font-semibold text-white">{outbreak.affectedPopulation}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400 flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      {t('dashboard.trend')}:
                    </span>
                    <span className="text-sm font-semibold text-white capitalize">{outbreak.trend}</span>
                  </div>
                  <div className="pt-3 border-t border-slate-700/50">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Users className="w-3 h-3" />
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
