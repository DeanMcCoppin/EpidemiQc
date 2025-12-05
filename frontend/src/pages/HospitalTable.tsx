import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { hospitalService } from '../services/hospital.service';
import { Hospital, HospitalTestResult } from '../types';
import toast from 'react-hot-toast';
import { Building2, Activity, TrendingUp, TrendingDown, Minus, AlertCircle, RefreshCw, X } from 'lucide-react';
import Beams from '../components/Beams';

const HospitalTable = () => {
  const { t, i18n } = useTranslation();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [testResults, setTestResults] = useState<HospitalTestResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Load all hospitals on mount
  useEffect(() => {
    loadHospitals();
  }, [i18n.language]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    if (!autoRefresh || !selectedHospital) return;

    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing test results...');
      loadHospitalTestResults(selectedHospital.id, true);
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, selectedHospital]);

  const loadHospitals = async () => {
    try {
      setIsLoading(true);
      const response = await hospitalService.getHospitals({ language: i18n.language });
      if (response.success && response.data) {
        setHospitals(response.data.hospitals);
      }
    } catch (error) {
      toast.error('Error loading hospitals');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadHospitalTestResults = async (hospitalId: number, silent = false) => {
    try {
      if (!silent) setIsLoadingResults(true);
      const response = await hospitalService.getHospitalTestResults(hospitalId, i18n.language);
      if (response.success && response.data) {
        setTestResults(response.data.testResults);
        setLastUpdated(response.data.lastUpdated);
        if (!silent) {
          toast.success(`Loaded test results for ${response.data.hospital.name}`);
        }
      }
    } catch (error) {
      if (!silent) {
        toast.error('Error loading test results');
      }
      console.error('Error:', error);
    } finally {
      setIsLoadingResults(false);
    }
  };

  const handleHospitalClick = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    loadHospitalTestResults(hospital.id);
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      critical: 'bg-red-500/20 text-red-300 border-red-500/30',
      alert: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      warning: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      normal: 'bg-green-500/20 text-green-300 border-green-500/30',
    };
    return colors[severity as keyof typeof colors] || colors.normal;
  };

  const getSeverityBg = (severity: string) => {
    const colors = {
      critical: 'bg-red-500/10 border-l-4 border-red-500',
      alert: 'bg-orange-500/10 border-l-4 border-orange-500',
      warning: 'bg-yellow-500/10 border-l-4 border-yellow-500',
      normal: 'bg-green-500/10 border-l-4 border-green-500',
    };
    return colors[severity as keyof typeof colors] || colors.normal;
  };

  const filteredHospitals = hospitals.filter(
    (h) =>
      h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.regionName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen relative bg-black">
      {/* Beams Background */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <Beams
          beamWidth={2.5}
          beamHeight={30}
          beamNumber={48}
          lightColor="#60a5fa"
          speed={2}
          noiseIntensity={1.5}
          scale={0.2}
          rotation={0}
        />
      </div>
      <div className="container mx-auto px-4 py-8 max-w-7xl relative" style={{ zIndex: 10 }}>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Building2 className="w-10 h-10 text-blue-400" />
            {i18n.language === 'fr' ? 'Surveillance des Hôpitaux' : 'Hospital Monitoring'}
          </h1>
          <p className="text-slate-400">
            {i18n.language === 'fr'
              ? 'Taux de diagnostic en temps réel pour tous les hôpitaux'
              : 'Real-time diagnostic rates for all hospitals'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Hospital List */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-blue-600/10 to-purple-600/10">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Building2 className="w-6 h-6 text-blue-400" />
                {i18n.language === 'fr' ? 'Liste des Hôpitaux' : 'Hospital List'}
                <span className="ml-auto text-sm font-normal text-slate-400">
                  {filteredHospitals.length} {i18n.language === 'fr' ? 'hôpitaux' : 'hospitals'}
                </span>
              </h2>
              {/* Search */}
              <input
                type="text"
                placeholder={i18n.language === 'fr' ? 'Rechercher...' : 'Search...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="overflow-y-auto max-h-[600px]">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="spinner"></div>
                </div>
              ) : (
                <div className="divide-y divide-slate-700/50">
                  {filteredHospitals.map((hospital) => (
                    <button
                      key={hospital.id}
                      onClick={() => handleHospitalClick(hospital)}
                      className={`w-full text-left p-4 transition-all duration-200 hover:bg-slate-700/30 ${
                        selectedHospital?.id === hospital.id
                          ? 'bg-blue-600/20 border-l-4 border-blue-500'
                          : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-white font-semibold mb-1">{hospital.name}</h3>
                          <p className="text-slate-400 text-sm">
                            {hospital.city} • {hospital.regionName}
                          </p>
                          <div className="flex gap-2 mt-2 flex-wrap">
                            <span className="px-2 py-0.5 bg-slate-700/50 text-slate-300 rounded text-xs">
                              {hospital.type}
                            </span>
                            {hospital.hasLab && (
                              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded text-xs border border-blue-500/30">
                                {i18n.language === 'fr' ? 'Labo' : 'Lab'}
                              </span>
                            )}
                            {hospital.hasEmergency && (
                              <span className="px-2 py-0.5 bg-red-500/20 text-red-300 rounded text-xs border border-red-500/30">
                                {i18n.language === 'fr' ? 'Urgence' : 'ER'}
                              </span>
                            )}
                            {hospital.hasICU && (
                              <span className="px-2 py-0.5 bg-orange-500/20 text-orange-300 rounded text-xs border border-orange-500/30">
                                ICU
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-slate-500 text-xs">
                            {i18n.language === 'fr' ? 'Lits' : 'Beds'}
                          </p>
                          <p className="text-white font-bold text-lg">{hospital.bedCount}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Test Results Panel */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden">
            {!selectedHospital ? (
              <div className="flex flex-col items-center justify-center h-full py-20">
                <Activity className="w-16 h-16 text-slate-600 mb-4" />
                <p className="text-slate-400 text-center">
                  {i18n.language === 'fr'
                    ? 'Sélectionnez un hôpital pour voir les taux de diagnostic'
                    : 'Select a hospital to view diagnostic rates'}
                </p>
              </div>
            ) : (
              <>
                <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-purple-600/10 to-pink-600/10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-white mb-1">{selectedHospital.name}</h2>
                      <p className="text-slate-400 text-sm">
                        {i18n.language === 'fr' ? 'Taux de Diagnostic' : 'Diagnostic Rates'}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedHospital(null)}
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => loadHospitalTestResults(selectedHospital.id)}
                      disabled={isLoadingResults}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${isLoadingResults ? 'animate-spin' : ''}`} />
                      {i18n.language === 'fr' ? 'Actualiser' : 'Refresh'}
                    </button>

                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={autoRefresh}
                        onChange={(e) => setAutoRefresh(e.target.checked)}
                        className="w-4 h-4 rounded bg-slate-700 border-slate-600"
                      />
                      <span className="text-slate-300">
                        {i18n.language === 'fr' ? 'Auto (1 min)' : 'Auto (1 min)'}
                      </span>
                    </label>
                  </div>

                  {lastUpdated && (
                    <p className="text-slate-500 text-xs mt-2">
                      {i18n.language === 'fr' ? 'Dernière mise à jour: ' : 'Last updated: '}
                      {new Date(lastUpdated).toLocaleString()}
                    </p>
                  )}
                </div>

                <div className="overflow-y-auto max-h-[600px]">
                  {isLoadingResults ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="spinner"></div>
                    </div>
                  ) : testResults.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <AlertCircle className="w-12 h-12 text-slate-600 mb-3" />
                      <p className="text-slate-400">
                        {i18n.language === 'fr'
                          ? 'Aucune donnée disponible'
                          : 'No data available'}
                      </p>
                    </div>
                  ) : (
                    <div className="p-6 space-y-4">
                      {testResults.map((result) => (
                        <div
                          key={result.conditionId}
                          className={`rounded-xl p-4 ${getSeverityBg(result.severity)}`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-white font-bold text-lg mb-1">
                                {result.conditionName}
                              </h3>
                              <p className="text-slate-400 text-sm capitalize">{result.category}</p>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getSeverityColor(
                                result.severity
                              )}`}
                            >
                              {result.severity.toUpperCase()}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                              <p className="text-slate-500 text-xs mb-1">
                                {i18n.language === 'fr' ? 'Taux Actuel' : 'Current Rate'}
                              </p>
                              <p className="text-2xl font-bold text-white">
                                {result.positiveRate.toFixed(2)}%
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-500 text-xs mb-1">
                                {i18n.language === 'fr' ? 'Taux Normal' : 'Normal Rate'}
                              </p>
                              <p className="text-2xl font-bold text-slate-400">
                                {result.normalRate.toFixed(2)}%
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2 mb-3">
                            {/* 7-Day Trend Indicator */}
                            <div className="flex items-center gap-2">
                              {(result as any).trend === 'up' && (
                                <>
                                  <TrendingUp className="w-4 h-4 text-red-400" />
                                  <span className="text-sm text-red-400 font-semibold">
                                    {i18n.language === 'fr' ? 'Tendance 7j: Hausse' : '7-Day Trend: Rising'}
                                  </span>
                                </>
                              )}
                              {(result as any).trend === 'down' && (
                                <>
                                  <TrendingDown className="w-4 h-4 text-green-400" />
                                  <span className="text-sm text-green-400 font-semibold">
                                    {i18n.language === 'fr' ? 'Tendance 7j: Baisse' : '7-Day Trend: Declining'}
                                  </span>
                                </>
                              )}
                              {(result as any).trend === 'stable' && (
                                <>
                                  <Minus className="w-4 h-4 text-slate-400" />
                                  <span className="text-sm text-slate-400 font-semibold">
                                    {i18n.language === 'fr' ? 'Tendance 7j: Stable' : '7-Day Trend: Stable'}
                                  </span>
                                </>
                              )}
                            </div>

                            {/* Deviation from Normal */}
                            <div className="flex items-center gap-2">
                              <Activity className="w-4 h-4 text-slate-400" />
                              <span className="text-sm text-slate-300">
                                {i18n.language === 'fr' ? 'Écart: ' : 'Deviation: '}
                                <span
                                  className={`font-semibold ${
                                    result.deviation > 0 ? 'text-red-400' : 'text-green-400'
                                  }`}
                                >
                                  {result.deviation > 0 ? '+' : ''}
                                  {result.deviation.toFixed(2)}%
                                </span>
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-700/30">
                            <div>
                              <p className="text-slate-500 text-xs">
                                {i18n.language === 'fr' ? 'Tests' : 'Tests'}
                              </p>
                              <p className="text-white font-semibold">{result.totalTests}</p>
                            </div>
                            <div>
                              <p className="text-slate-500 text-xs">
                                {i18n.language === 'fr' ? 'Positifs' : 'Positive'}
                              </p>
                              <p className="text-white font-semibold">{result.positiveTests}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalTable;
