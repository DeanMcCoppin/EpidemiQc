/**
 * Disease Data Generator
 * Generates realistic 24-hour time-series data for infectious disease detection rates
 */

interface DiseaseDataPoint {
  hour: number;
  timestamp: string;
  totalTests: number;
  positiveTests: number;
  detectionRate: number;
}

interface DiseaseMonitoring {
  diseaseCode: string;
  diseaseName: string;
  currentRate: number;
  averageRate24h: number;
  peakRate24h: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  severity: 'normal' | 'elevated' | 'high' | 'critical';
  data24h: DiseaseDataPoint[];
}

// Common infectious diseases to monitor
const DISEASES = [
  { code: 'COVID19', nameFr: 'COVID-19', nameEn: 'COVID-19', baseRate: 3.5 },
  { code: 'INFLUENZA', nameFr: 'Grippe', nameEn: 'Influenza', baseRate: 8.2 },
  { code: 'STREP_A', nameFr: 'Streptocoque A', nameEn: 'Strep A', baseRate: 2.1 },
  { code: 'RSV', nameFr: 'VRS', nameEn: 'RSV', baseRate: 4.5 },
  { code: 'NOROVIRUS', nameFr: 'Norovirus', nameEn: 'Norovirus', baseRate: 1.8 },
  { code: 'ECOLI', nameFr: 'E. coli', nameEn: 'E. coli', baseRate: 0.9 },
];

/**
 * Generate a single data point with some randomness
 */
function generateDataPoint(
  hour: number,
  baseRate: number,
  trendFactor: number,
  hospitalSize: number
): DiseaseDataPoint {
  const now = new Date();
  now.setHours(now.getHours() - (23 - hour));

  // Base tests per hour varies by hospital size
  const baseTestsPerHour = Math.floor(hospitalSize / 50) * 10 + 20;

  // Add time-of-day variation (more tests during day hours)
  const timeVariation = hour >= 8 && hour <= 18 ? 1.5 : 0.7;

  // Random variation
  const randomVariation = 0.8 + Math.random() * 0.4;

  const totalTests = Math.max(
    5,
    Math.floor(baseTestsPerHour * timeVariation * randomVariation)
  );

  // Calculate detection rate with trend
  const hourlyTrend = (hour - 12) / 24; // -0.5 to +0.5
  const rateVariation = baseRate * (1 + trendFactor * hourlyTrend);
  const finalRate = Math.max(0, Math.min(50, rateVariation + (Math.random() - 0.5) * 2));

  const positiveTests = Math.floor((totalTests * finalRate) / 100);
  const actualRate = totalTests > 0 ? (positiveTests / totalTests) * 100 : 0;

  return {
    hour,
    timestamp: now.toISOString(),
    totalTests,
    positiveTests,
    detectionRate: Math.round(actualRate * 10) / 10,
  };
}

/**
 * Calculate severity based on detection rate
 */
function calculateSeverity(rate: number): 'normal' | 'elevated' | 'high' | 'critical' {
  if (rate < 5) return 'normal';
  if (rate < 10) return 'elevated';
  if (rate < 20) return 'high';
  return 'critical';
}

/**
 * Calculate trend from 24h data
 */
function calculateTrend(data: DiseaseDataPoint[]): 'increasing' | 'stable' | 'decreasing' {
  if (data.length < 6) return 'stable';

  const recentAvg = data.slice(-6).reduce((sum, d) => sum + d.detectionRate, 0) / 6;
  const earlierAvg = data.slice(0, 6).reduce((sum, d) => sum + d.detectionRate, 0) / 6;

  const diff = recentAvg - earlierAvg;

  if (diff > 1.5) return 'increasing';
  if (diff < -1.5) return 'decreasing';
  return 'stable';
}

/**
 * Generate disease monitoring data for a hospital
 */
export function generateHospitalDiseaseData(
  hospitalId: number,
  bedCount: number,
  language: string = 'fr'
): {
  diseaseMonitoring: DiseaseMonitoring[];
  overallSeverity: 'normal' | 'elevated' | 'high' | 'critical';
  maxDetectionRate: number;
} {
  const diseaseMonitoring: DiseaseMonitoring[] = [];
  let maxDetectionRate = 0;
  let maxSeverityLevel = 0;

  // Use hospital ID as seed for reproducible but varied data
  const seed = hospitalId * 17;

  // Select 3-5 diseases to monitor per hospital
  const numDiseases = 3 + (seed % 3);
  const selectedDiseases = DISEASES.slice(0, numDiseases);

  selectedDiseases.forEach((disease, index) => {
    // Different hospitals have different outbreak patterns
    const outbreakSeverity = ((seed + index * 7) % 100) / 100; // 0-1
    const trendDirection = ((seed + index * 11) % 3) - 1; // -1, 0, 1

    // Adjust base rate based on outbreak severity
    const adjustedBaseRate = disease.baseRate * (0.5 + outbreakSeverity * 3);

    // Generate 24 hours of data
    const data24h: DiseaseDataPoint[] = [];
    for (let hour = 0; hour < 24; hour++) {
      const dataPoint = generateDataPoint(
        hour,
        adjustedBaseRate,
        trendDirection * 0.3,
        bedCount
      );
      data24h.push(dataPoint);
    }

    // Calculate statistics
    const currentRate = data24h[23].detectionRate;
    const averageRate24h = data24h.reduce((sum, d) => sum + d.detectionRate, 0) / 24;
    const peakRate24h = Math.max(...data24h.map(d => d.detectionRate));
    const trend = calculateTrend(data24h);
    const severity = calculateSeverity(currentRate);

    // Track max detection rate
    if (currentRate > maxDetectionRate) {
      maxDetectionRate = currentRate;
    }

    // Track highest severity level
    const severityLevels = { normal: 0, elevated: 1, high: 2, critical: 3 };
    if (severityLevels[severity] > maxSeverityLevel) {
      maxSeverityLevel = severityLevels[severity];
    }

    diseaseMonitoring.push({
      diseaseCode: disease.code,
      diseaseName: language === 'en' ? disease.nameEn : disease.nameFr,
      currentRate: Math.round(currentRate * 10) / 10,
      averageRate24h: Math.round(averageRate24h * 10) / 10,
      peakRate24h: Math.round(peakRate24h * 10) / 10,
      trend,
      severity,
      data24h,
    });
  });

  // Determine overall severity
  const severityMap = ['normal', 'elevated', 'high', 'critical'] as const;
  const overallSeverity = severityMap[maxSeverityLevel];

  return {
    diseaseMonitoring,
    overallSeverity,
    maxDetectionRate: Math.round(maxDetectionRate * 10) / 10,
  };
}

/**
 * Get color for severity level (for map markers)
 */
export function getSeverityColor(severity: 'normal' | 'elevated' | 'high' | 'critical'): string {
  const colors = {
    normal: '#2563EB',    // Blue
    elevated: '#F59E0B',  // Amber
    high: '#F97316',      // Orange
    critical: '#DC2626',  // Red
  };
  return colors[severity];
}
