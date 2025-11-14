import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { outbreakService } from '../services/outbreak.service';
import { hospitalService } from '../services/hospital.service';
import { MapRegion, Hospital } from '../types';
import toast from 'react-hot-toast';

const mapContainerStyle = {
  width: '100%',
  height: 'calc(100vh - 4rem)',
};

const center = {
  lat: 53.0,
  lng: -72.0,
};

// Quebec bounds for map restriction
const quebecBounds = {
  north: 63.0,
  south: 44.5,
  east: -56.0,
  west: -80.5,
};

const Map = () => {
  const { t, i18n } = useTranslation();
  const [regions, setRegions] = useState<MapRegion[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<MapRegion | null>(null);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [showHospitals, setShowHospitals] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMapData();
    loadHospitals();
  }, [i18n.language]);

  const loadMapData = async () => {
    setIsLoading(true);
    try {
      console.log('🗺️ === LOADING MAP DATA ===');
      console.log('🗺️ Language:', i18n.language);
      console.log('🗺️ API Base URL:', import.meta.env.VITE_API_BASE_URL);

      const response = await outbreakService.getMapData(i18n.language);

      console.log('🗺️ Response received:', response);
      console.log('🗺️ Response success:', response.success);
      console.log('🗺️ Response data:', response.data);

      if (response.success && response.data && response.data.regions) {
        console.log('🗺️ ✅ Regions loaded:', response.data.regions.length);
        console.log('🗺️ First region:', response.data.regions[0]);
        setRegions(response.data.regions);
        toast.success(`Loaded ${response.data.regions.length} regions`);
      } else {
        console.error('🗺️ ❌ Response not successful:', response);
        toast.error('Error: No region data in response');
      }
    } catch (error: any) {
      console.error('🗺️ ❌ === MAP DATA ERROR ===');
      console.error('🗺️ Error object:', error);
      console.error('🗺️ Error message:', error.message);
      console.error('🗺️ Error response:', error.response);
      console.error('🗺️ Error response data:', error.response?.data);
      console.error('🗺️ Error response status:', error.response?.status);

      const errorMsg = error.response?.data?.error?.message || error.message || 'Unknown error';
      toast.error(`Map data error: ${errorMsg}`, { duration: 5000 });
    } finally {
      setIsLoading(false);
    }
  };

  const loadHospitals = async () => {
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
    }
  };

  const onMapLoad = (mapInstance: google.maps.Map) => {
    // Restrict map to Quebec bounds
    mapInstance.setOptions({
      restriction: {
        latLngBounds: quebecBounds,
        strictBounds: false,
      },
    });
  };

  const getMarkerIcon = (severity: string) => {
    const colors: any = {
      critical: '#DC143C',
      alert: '#FF4500',
      warning: '#FFA500',
      normal: '#22C55E',
    };
    return {
      path: window.google.maps.SymbolPath.CIRCLE,
      fillColor: colors[severity] || '#22C55E',
      fillOpacity: 0.8,
      strokeColor: '#ffffff',
      strokeWeight: 2,
      scale: 10,
    };
  };

  const getHospitalIcon = (hospital: Hospital) => {
    // Determine color based on severity of disease detection
    const severityColors = {
      critical: '#DC2626',  // Red
      high: '#F97316',      // Orange
      elevated: '#F59E0B',  // Amber
      normal: '#2563EB',    // Blue
    };

    const fillColor = hospital.overallSeverity
      ? severityColors[hospital.overallSeverity]
      : '#2563EB';

    // Hospital cross icon - using simpler H symbol
    return {
      path: 'M 0,-8 L 0,-2 L -6,-2 L -6,2 L 0,2 L 0,8 L 4,8 L 4,2 L 10,2 L 10,-2 L 4,-2 L 4,-8 Z',
      fillColor,
      fillOpacity: 0.95,
      strokeColor: '#ffffff',
      strokeWeight: 2,
      scale: 1.5,
      anchor: { x: 2, y: 0 } as google.maps.Point,
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
      <div className="relative">
        {/* Legend */}
        <div className="absolute top-4 right-4 z-10 bg-white p-4 rounded-lg shadow-lg max-w-xs">
          <h3 className="font-bold text-lg mb-3">{t('map.legend')}</h3>

          {/* Region Severity Legend */}
          <div className="mb-3">
            <p className="text-xs font-semibold text-gray-600 mb-2">
              {i18n.language === 'fr' ? 'Régions (éclosions)' : 'Regions (outbreaks)'}
            </p>
            <div className="space-y-1.5">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <span className="text-xs">{t('map.normal')} (&lt;5%)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
                <span className="text-xs">{t('map.warning')} (5-10%)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-orange-600 mr-2"></div>
                <span className="text-xs">{t('map.alert')} (10-20%)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-700 mr-2"></div>
                <span className="text-xs">{t('map.critical')} (&gt;20%)</span>
              </div>
            </div>
          </div>

          {/* Hospital Severity Legend */}
          <div className="mb-3 border-t pt-3">
            <p className="text-xs font-semibold text-gray-600 mb-2">
              {i18n.language === 'fr' ? 'Hôpitaux (détection)' : 'Hospitals (detection)'}
            </p>
            <div className="space-y-1.5">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-600 mr-2"></div>
                <span className="text-xs">{i18n.language === 'fr' ? 'Normal' : 'Normal'}</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-amber-500 mr-2"></div>
                <span className="text-xs">{i18n.language === 'fr' ? 'Élevé' : 'Elevated'}</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-orange-600 mr-2"></div>
                <span className="text-xs">{i18n.language === 'fr' ? 'Haut' : 'High'}</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-600 mr-2"></div>
                <span className="text-xs">{i18n.language === 'fr' ? 'Critique' : 'Critical'}</span>
              </div>
            </div>
          </div>

          <div className="border-t pt-3">
            <button
              onClick={() => setShowHospitals(!showHospitals)}
              className={`flex items-center justify-between w-full px-3 py-2 rounded text-sm font-medium transition-colors ${
                showHospitals
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L12 10L4 10L4 14L12 14L12 22L16 22L16 14L24 14L24 10L16 10L16 2Z" />
                </svg>
                {i18n.language === 'fr' ? 'Hôpitaux' : 'Hospitals'}
              </span>
              <span className="ml-2">{showHospitals ? '✓' : ''}</span>
            </button>
            {showHospitals && (
              <p className="text-xs text-gray-500 mt-2">
                {hospitals.length} {i18n.language === 'fr' ? 'laboratoires' : 'labs'}
              </p>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-[calc(100vh-4rem)] bg-gray-100">
            <div className="spinner"></div>
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={5.5}
            onLoad={onMapLoad}
            options={{
              disableDefaultUI: false,
              zoomControl: true,
              mapTypeControl: false,
              streetViewControl: false,
              fullscreenControl: true,
              mapTypeId: 'roadmap',
              minZoom: 4,
              maxZoom: 15,
            }}
          >
            {regions.map((region) => (
              <Marker
                key={`region-${region.id}`}
                position={{
                  lat: region.centerLat,
                  lng: region.centerLng,
                }}
                icon={getMarkerIcon(region.maxSeverity)}
                onClick={() => {
                  setSelectedRegion(region);
                  setSelectedHospital(null);
                }}
              />
            ))}

            {showHospitals && hospitals.map((hospital) => (
              <Marker
                key={`hospital-${hospital.id}`}
                position={{
                  lat: hospital.latitude,
                  lng: hospital.longitude,
                }}
                icon={getHospitalIcon(hospital)}
                onClick={() => {
                  setSelectedHospital(hospital);
                  setSelectedRegion(null);
                }}
              />
            ))}

            {selectedRegion && (
              <InfoWindow
                position={{
                  lat: selectedRegion.centerLat,
                  lng: selectedRegion.centerLng,
                }}
                onCloseClick={() => setSelectedRegion(null)}
              >
                <div className="p-2 max-w-xs">
                  <h3 className="font-bold text-lg mb-2">{selectedRegion.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {i18n.language === 'fr' ? 'Population' : 'Population'}: {selectedRegion.population?.toLocaleString()}
                  </p>
                  <div className="space-y-1">
                    <p className="font-semibold text-sm">
                      {i18n.language === 'fr' ? 'Éclosions actives:' : 'Active Outbreaks:'}
                    </p>
                    {selectedRegion.outbreaks.length > 0 ? (
                      selectedRegion.outbreaks.slice(0, 5).map((outbreak, idx) => (
                        <div key={idx} className="text-sm">
                          <span className="font-medium">{outbreak.conditionName}:</span>{' '}
                          <span className="text-red-600 font-semibold">{outbreak.positiveRate.toFixed(1)}%</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">
                        {i18n.language === 'fr' ? 'Aucune éclosion' : 'No outbreaks'}
                      </p>
                    )}
                  </div>
                </div>
              </InfoWindow>
            )}

            {selectedHospital && (
              <InfoWindow
                position={{
                  lat: selectedHospital.latitude,
                  lng: selectedHospital.longitude,
                }}
                onCloseClick={() => setSelectedHospital(null)}
              >
                <div className="p-3 max-w-md">
                  <h3 className="font-bold text-lg mb-2 text-blue-700">{selectedHospital.name}</h3>

                  {/* Basic Info */}
                  <div className="space-y-1 text-sm mb-3">
                    <p><span className="font-semibold">{i18n.language === 'fr' ? 'Ville:' : 'City:'}</span> {selectedHospital.city}</p>
                    <p><span className="font-semibold">{i18n.language === 'fr' ? 'Région:' : 'Region:'}</span> {selectedHospital.regionName}</p>
                    <p><span className="font-semibold">{i18n.language === 'fr' ? 'Type:' : 'Type:'}</span> {selectedHospital.type}</p>
                    <p><span className="font-semibold">{i18n.language === 'fr' ? 'Lits:' : 'Beds:'}</span> {selectedHospital.bedCount}</p>
                    <div className="flex gap-2 mt-2">
                      {selectedHospital.hasEmergency && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
                          {i18n.language === 'fr' ? 'Urgence' : 'Emergency'}
                        </span>
                      )}
                      {selectedHospital.hasICU && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                          {i18n.language === 'fr' ? 'Soins intensifs' : 'ICU'}
                        </span>
                      )}
                      {selectedHospital.hasLab && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                          {i18n.language === 'fr' ? 'Laboratoire' : 'Lab'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Disease Monitoring Data */}
                  {selectedHospital.diseaseMonitoring && selectedHospital.diseaseMonitoring.length > 0 && (
                    <div className="border-t pt-3 mt-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-sm">
                          {i18n.language === 'fr' ? 'Surveillance des maladies infectieuses' : 'Infectious Disease Monitoring'}
                        </h4>
                        {selectedHospital.overallSeverity && (
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            selectedHospital.overallSeverity === 'critical' ? 'bg-red-100 text-red-800' :
                            selectedHospital.overallSeverity === 'high' ? 'bg-orange-100 text-orange-800' :
                            selectedHospital.overallSeverity === 'elevated' ? 'bg-amber-100 text-amber-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {selectedHospital.overallSeverity === 'critical' ? (i18n.language === 'fr' ? 'Critique' : 'Critical') :
                             selectedHospital.overallSeverity === 'high' ? (i18n.language === 'fr' ? 'Haut' : 'High') :
                             selectedHospital.overallSeverity === 'elevated' ? (i18n.language === 'fr' ? 'Élevé' : 'Elevated') :
                             (i18n.language === 'fr' ? 'Normal' : 'Normal')}
                          </span>
                        )}
                      </div>

                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {selectedHospital.diseaseMonitoring.map((disease, idx) => (
                          <div key={idx} className="bg-gray-50 p-2 rounded text-xs">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-gray-800">{disease.diseaseName}</span>
                              <span className={`px-1.5 py-0.5 rounded font-semibold ${
                                disease.severity === 'critical' ? 'bg-red-200 text-red-900' :
                                disease.severity === 'high' ? 'bg-orange-200 text-orange-900' :
                                disease.severity === 'elevated' ? 'bg-amber-200 text-amber-900' :
                                'bg-green-200 text-green-900'
                              }`}>
                                {disease.currentRate.toFixed(1)}%
                              </span>
                            </div>

                            <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                              <div>
                                <div className="text-gray-500">{i18n.language === 'fr' ? 'Moy 24h' : 'Avg 24h'}</div>
                                <div className="font-medium">{disease.averageRate24h.toFixed(1)}%</div>
                              </div>
                              <div>
                                <div className="text-gray-500">{i18n.language === 'fr' ? 'Max 24h' : 'Peak 24h'}</div>
                                <div className="font-medium">{disease.peakRate24h.toFixed(1)}%</div>
                              </div>
                              <div>
                                <div className="text-gray-500">{i18n.language === 'fr' ? 'Tendance' : 'Trend'}</div>
                                <div className="font-medium">
                                  {disease.trend === 'increasing' ? '📈' : disease.trend === 'decreasing' ? '📉' : '➡️'}
                                  {disease.trend === 'increasing' ? (i18n.language === 'fr' ? ' Hausse' : ' Up') :
                                   disease.trend === 'decreasing' ? (i18n.language === 'fr' ? ' Baisse' : ' Down') :
                                   (i18n.language === 'fr' ? ' Stable' : ' Stable')}
                                </div>
                              </div>
                            </div>

                            {/* Mini sparkline visualization */}
                            <div className="mt-2 flex items-end h-8 gap-0.5">
                              {disease.data24h.slice(-12).map((point, i) => {
                                const maxRate = Math.max(...disease.data24h.map(d => d.detectionRate));
                                const height = maxRate > 0 ? (point.detectionRate / maxRate) * 100 : 0;
                                return (
                                  <div
                                    key={i}
                                    className={`flex-1 rounded-t ${
                                      point.detectionRate > 15 ? 'bg-red-400' :
                                      point.detectionRate > 10 ? 'bg-orange-400' :
                                      point.detectionRate > 5 ? 'bg-amber-400' :
                                      'bg-blue-400'
                                    }`}
                                    style={{ height: `${Math.max(height, 5)}%` }}
                                    title={`${point.hour}:00 - ${point.detectionRate.toFixed(1)}%`}
                                  />
                                );
                              })}
                            </div>
                            <div className="text-xs text-gray-400 mt-1 text-center">
                              {i18n.language === 'fr' ? 'Dernières 12 heures' : 'Last 12 hours'}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-2 text-xs text-gray-500 italic">
                        {i18n.language === 'fr' ? '⚡ Données simulées en temps réel' : '⚡ Live simulated data'}
                      </div>
                    </div>
                  )}
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        )}
      </div>
    </LoadScript>
  );
};

export default Map;
