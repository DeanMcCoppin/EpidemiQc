import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { outbreakService } from '../services/outbreak.service';
import { hospitalService } from '../services/hospital.service';
import { MapRegion, Hospital } from '../types';
import toast from 'react-hot-toast';
import { Activity, Building2, Users, AlertCircle, TrendingUp, TrendingDown, Minus, X } from 'lucide-react';
import Beams from '../components/Beams';
import DecryptedText from '../components/DecryptedText';

const mapContainerStyle = {
  width: '100%',
  height: '100vh',
};

// Center on Quebec City - the heart of Quebec
const center = {
  lat: 46.8139,
  lng: -71.2080,
};

const Map = () => {
  const { t, i18n } = useTranslation();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [hospitalTestResults, setHospitalTestResults] = useState<any[]>([]);
  const [loadingTestResults, setLoadingTestResults] = useState(false);
  const [showHospitals, setShowHospitals] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');

  useEffect(() => {
    loadHospitals();
  }, [i18n.language]);

  // Auto-refresh hospital test results every 30 seconds
  useEffect(() => {
    if (!selectedHospital) return;

    const intervalId = setInterval(() => {
      console.log('🔄 Auto-refreshing hospital test results...');
      loadHospitalTestResults(selectedHospital.id);
    }, 30000); // 30 seconds

    return () => clearInterval(intervalId);
  }, [selectedHospital, i18n.language]);

  const loadHospitals = async () => {
    setIsLoading(true);
    try {
      console.log('🏥 === LOADING HOSPITALS ===');
      console.log('🏥 Language:', i18n.language);
      console.log('🏥 Params:', { language: i18n.language, hasLab: true });

      const response = await hospitalService.getHospitals({ language: i18n.language, hasLab: true });

      console.log('🏥 Response received:', response);
      console.log('🏥 Response success:', response.success);

      if (response.success && response.data && response.data.hospitals) {
        console.log('🏥 ✅ Hospitals loaded:', response.data.hospitals.length);
        console.log('🏥 First hospital:', response.data.hospitals[0]);
        setHospitals(response.data.hospitals);
        toast.success(`Loaded ${response.data.hospitals.length} hospitals with labs`);
      } else {
        console.warn('🏥 ⚠️  No hospitals found or response unsuccessful');
        toast.error('No hospitals found');
      }
    } catch (error: any) {
      console.error('🏥 ❌ === HOSPITALS ERROR ===');
      console.error('🏥 Error object:', error);
      console.error('🏥 Error message:', error.message);
      console.error('🏥 Error response:', error.response);
      console.error('🏥 Error response data:', error.response?.data);

      const errorMsg = error.response?.data?.error?.message || error.message || 'Unknown error';
      toast.error(`Hospitals error: ${errorMsg}`, { duration: 5000 });
    } finally {
      setIsLoading(false);
    }
  };

  const loadHospitalTestResults = async (hospitalId: number) => {
    try {
      setLoadingTestResults(true);
      console.log('🧪 Loading test results for hospital:', hospitalId);

      const response = await hospitalService.getHospitalTestResults(hospitalId, i18n.language);

      if (response.success && response.data) {
        console.log('🧪 ✅ Test results loaded:', response.data.testResults);
        setHospitalTestResults(response.data.testResults);
      }
    } catch (error: any) {
      console.error('🧪 ❌ Error loading test results:', error);
      setHospitalTestResults([]);
    } finally {
      setLoadingTestResults(false);
    }
  };

  const handleHospitalClick = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    loadHospitalTestResults(hospital.id);
  };

  const getSeverityColor = (severity: string) => {
    const colors: any = {
      critical: 'text-red-400',
      alert: 'text-orange-400',
      warning: 'text-yellow-400',
      normal: 'text-green-400',
    };
    return colors[severity] || colors.normal;
  };

  const onMapLoad = (mapInstance: google.maps.Map) => {
    // No restrictions - user can zoom and pan freely
    console.log('🗺️ Map loaded and centered on Quebec');
  };

  const getMarkerIcon = (severity: string) => {
    const colors: any = {
      critical: '#ef4444',
      alert: '#f97316',
      warning: '#eab308',
      normal: '#22c55e',
    };
    return {
      path: window.google.maps.SymbolPath.CIRCLE,
      fillColor: colors[severity] || '#22c55e',
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 3,
      scale: 14,
    };
  };

  const getHospitalIcon = () => {
    // Hospital cross icon - enhanced visibility
    return {
      path: 'M 0,-10 L 0,-3 L -7,-3 L -7,3 L 0,3 L 0,10 L 6,10 L 6,3 L 13,3 L 13,-3 L 6,-3 L 6,-10 Z',
      fillColor: '#3b82f6',
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 3,
      scale: 1.2,
      anchor: { x: 3, y: 0 } as google.maps.Point,
    };
  };

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)] bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Google Maps API Key Required</h2>
          <p className="text-gray-600 mb-4">
            Please add your Google Maps API key to the .env file:
          </p>
          <code className="block bg-gray-100 p-3 rounded text-sm">
            VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
          </code>
          <p className="text-sm text-gray-500 mt-4">
            Get your API key at: <a href="https://console.cloud.google.com" className="text-quebec-blue hover:underline" target="_blank" rel="noopener noreferrer">Google Cloud Console</a>
          </p>
          <div className="mt-4 p-3 bg-blue-50 rounded text-xs text-left">
            <p className="font-semibold mb-2">Enable these APIs:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Maps JavaScript API</li>
              <li>Places API</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <LoadScript googleMapsApiKey={apiKey}>
      <div className="relative w-full h-screen overflow-hidden bg-black">
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
        {/* Modern Sidebar */}
        <div className="absolute left-0 top-0 bottom-0 w-96 bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl z-20 shadow-2xl border-r border-slate-700/50">
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-blue-600/10 to-purple-600/10">
              <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                <Activity className="w-7 h-7 text-blue-400" />
                <DecryptedText text="EpidemiQc" speed={80} sequential={true} />
              </h1>
              <p className="text-slate-400 text-sm">{i18n.language === 'fr' ? 'Surveillance en temps réel' : 'Real-time Monitoring'}</p>
            </div>

            {/* Stats Cards */}
            <div className="p-4 space-y-3 border-b border-slate-700/50">
              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-xl p-4 border border-purple-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-200 text-sm font-medium">{i18n.language === 'fr' ? 'Hôpitaux' : 'Hospitals'}</p>
                    <p className="text-3xl font-bold text-white mt-1">{hospitals.length}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="p-4 space-y-3">
              <button
                onClick={() => setShowHospitals(!showHospitals)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  showHospitals
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-slate-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  {i18n.language === 'fr' ? 'Afficher Hôpitaux' : 'Show Hospitals'}
                </span>
                {showHospitals && <span className="text-xl">✓</span>}
              </button>

              <button
                onClick={() => setMapType(mapType === 'roadmap' ? 'satellite' : 'roadmap')}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all duration-200 bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-slate-700"
              >
                <span className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  {mapType === 'roadmap'
                    ? (i18n.language === 'fr' ? 'Vue Satellite' : 'Satellite View')
                    : (i18n.language === 'fr' ? 'Vue Carte' : 'Map View')
                  }
                </span>
              </button>
            </div>


          </div>
        </div>

        {/* Map Container */}
        {isLoading ? (
          <div className="flex items-center justify-center h-screen bg-slate-900">
            <div className="text-center">
              <div className="spinner mb-4"></div>
              <p className="text-slate-400">Loading map data...</p>
            </div>
          </div>
        ) : (
          <div className="pl-96 h-full">
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={center}
              zoom={6.5}
              onLoad={onMapLoad}
              options={{
                disableDefaultUI: false,
                zoomControl: true,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: true,
                mapTypeId: mapType,
                styles: mapType === 'roadmap' ? [
                  {
                    featureType: 'all',
                    elementType: 'geometry',
                    stylers: [{ color: '#1e293b' }]
                  },
                  {
                    featureType: 'all',
                    elementType: 'labels.text.fill',
                    stylers: [{ color: '#cbd5e1' }]
                  },
                  {
                    featureType: 'all',
                    elementType: 'labels.text.stroke',
                    stylers: [{ color: '#0f172a' }]
                  },
                  {
                    featureType: 'water',
                    elementType: 'geometry',
                    stylers: [{ color: '#0f172a' }]
                  },
                  {
                    featureType: 'road',
                    elementType: 'geometry',
                    stylers: [{ color: '#334155' }]
                  }
                ] : []
              }}
            >
              {showHospitals && hospitals.map((hospital) => (
                <Marker
                  key={`hospital-${hospital.id}`}
                  position={{
                    lat: hospital.latitude,
                    lng: hospital.longitude,
                  }}
                  icon={getHospitalIcon()}
                  onClick={() => handleHospitalClick(hospital)}
                />
              ))}

              {selectedHospital && (
                <InfoWindow
                  position={{
                    lat: selectedHospital.latitude,
                    lng: selectedHospital.longitude,
                  }}
                  onCloseClick={() => {
                    setSelectedHospital(null);
                    setHospitalTestResults([]);
                  }}
                  options={{
                    pixelOffset: new window.google.maps.Size(0, -40),
                    maxWidth: 400,
                  }}
                >
                  <div className="p-4 min-w-[350px]">
                    <h3 className="font-bold text-lg mb-2 text-gray-900">{selectedHospital.name}</h3>
                    <div className="text-sm text-gray-600 mb-3">
                      <p><span className="font-semibold">{i18n.language === 'fr' ? 'Ville:' : 'City:'}</span> {selectedHospital.city}</p>
                      <p><span className="font-semibold">{i18n.language === 'fr' ? 'Type:' : 'Type:'}</span> {selectedHospital.type}</p>
                      <p><span className="font-semibold">{i18n.language === 'fr' ? 'Lits:' : 'Beds:'}</span> {selectedHospital.bedCount}</p>
                    </div>

                    <div className="border-t pt-3">
                      <h4 className="font-semibold text-gray-800 mb-2">
                        {i18n.language === 'fr' ? 'Taux de Diagnostic' : 'Diagnostic Rates'}
                      </h4>
                      {loadingTestResults ? (
                        <div className="flex justify-center py-4">
                          <div className="spinner-small"></div>
                        </div>
                      ) : hospitalTestResults.length === 0 ? (
                        <p className="text-gray-500 text-sm">{i18n.language === 'fr' ? 'Aucune donnée' : 'No data'}</p>
                      ) : (
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {hospitalTestResults.map((result: any) => (
                            <div
                              key={result.conditionId}
                              className="bg-gray-50 rounded-lg p-2 border-l-3"
                              style={{
                                borderLeftWidth: '4px',
                                borderLeftColor:
                                  result.severity === 'critical' ? '#ef4444' :
                                  result.severity === 'alert' ? '#f97316' :
                                  result.severity === 'warning' ? '#eab308' : '#22c55e'
                              }}
                            >
                              <div className="flex justify-between items-start mb-1">
                                <span className="font-semibold text-gray-800 text-sm">{result.conditionName}</span>
                                <span className={`text-xs font-bold uppercase ${getSeverityColor(result.severity)}`}>
                                  {result.severity}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-600">
                                  {i18n.language === 'fr' ? 'Actuel:' : 'Current:'}
                                </span>
                                <span className="font-bold text-sm text-gray-900">{result.positiveRate.toFixed(1)}%</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500">
                                  {i18n.language === 'fr' ? 'Normal:' : 'Normal:'}
                                </span>
                                <span className="text-xs text-gray-600">{result.normalRate.toFixed(1)}%</span>
                              </div>

                              {/* 7-Day Trend */}
                              <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-200">
                                {result.trend === 'up' && (
                                  <>
                                    <TrendingUp className="w-3 h-3 text-red-500" />
                                    <span className="text-xs text-red-500 font-semibold">
                                      {i18n.language === 'fr' ? 'Tendance: Hausse' : 'Trend: Rising'}
                                    </span>
                                  </>
                                )}
                                {result.trend === 'down' && (
                                  <>
                                    <TrendingDown className="w-3 h-3 text-green-500" />
                                    <span className="text-xs text-green-500 font-semibold">
                                      {i18n.language === 'fr' ? 'Tendance: Baisse' : 'Trend: Declining'}
                                    </span>
                                  </>
                                )}
                                {result.trend === 'stable' && (
                                  <>
                                    <Minus className="w-3 h-3 text-gray-500" />
                                    <span className="text-xs text-gray-500 font-semibold">
                                      {i18n.language === 'fr' ? 'Tendance: Stable' : 'Trend: Stable'}
                                    </span>
                                  </>
                                )}
                              </div>

                              <div className="text-xs text-gray-500 mt-1">
                                {i18n.language === 'fr' ? 'Tests:' : 'Tests:'} {result.totalTests} |
                                {i18n.language === 'fr' ? ' Positifs:' : ' Positive:'} {result.positiveTests}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          </div>
        )}
      </div>
    </LoadScript>
  );
};

export default Map;
