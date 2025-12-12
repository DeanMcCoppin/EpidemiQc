import { Request, Response } from 'express';
import { pool } from '../config/database';

// Get all hospitals
export const getHospitals = async (req: Request, res: Response) => {
  try {
    console.log('🏥 === GET HOSPITALS REQUEST ===');
    console.log('Query params:', req.query);

    const { language = 'fr', regionId, hasLab } = req.query;
    const lang = language === 'en' ? 'en' : 'fr';

    let query = `
      SELECT
        h.id,
        h.name_${lang} as name,
        h.region_id,
        r.code as region_code,
        r.name_${lang} as region_name,
        h.hospital_type,
        h.city,
        h.latitude,
        h.longitude,
        h.bed_count,
        h.has_emergency,
        h.has_icu,
        h.has_lab
      FROM hospitals h
      INNER JOIN regions r ON h.region_id = r.id
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (regionId) {
      params.push(regionId);
      query += ` AND h.region_id = $${paramIndex++}`;
    }

    if (hasLab !== undefined) {
      const hasLabValue = hasLab === 'true' || hasLab === '1' || hasLab === true;
      params.push(hasLabValue);
      query += ` AND h.has_lab = $${paramIndex++}`;
      console.log('🏥 Filtering by hasLab:', hasLabValue);
    }

    query += ` ORDER BY h.bed_count DESC`;

    console.log('🏥 Executing query:', query);
    console.log('🏥 With params:', params);

    const result = await pool.query(query, params);

    console.log('🏥 Query result rows:', result.rows.length);
    if (result.rows.length > 0) {
      console.log('🏥 First hospital:', result.rows[0]);
    }

    const hospitals = result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      regionId: row.region_id,
      regionCode: row.region_code,
      regionName: row.region_name,
      type: row.hospital_type,
      city: row.city,
      latitude: parseFloat(row.latitude),
      longitude: parseFloat(row.longitude),
      bedCount: row.bed_count,
      hasEmergency: row.has_emergency,
      hasICU: row.has_icu,
      hasLab: row.has_lab,
    }));

    console.log('🏥 ✅ Returning', hospitals.length, 'hospitals');

    res.json({
      success: true,
      data: { hospitals },
    });
  } catch (error: any) {
    console.error('🏥 ❌ Get hospitals error:', error);
    console.error('🏥 Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: { message: 'Server error fetching hospitals', details: error.message },
    });
  }
};

// Get hospital by ID
export const getHospitalById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { language = 'fr' } = req.query;
    const lang = language === 'en' ? 'en' : 'fr';

    const query = `
      SELECT
        h.id,
        h.name_${lang} as name,
        h.region_id,
        r.code as region_code,
        r.name_${lang} as region_name,
        h.hospital_type,
        h.city,
        h.address,
        h.postal_code,
        h.phone,
        h.latitude,
        h.longitude,
        h.bed_count,
        h.has_emergency,
        h.has_icu,
        h.has_lab
      FROM hospitals h
      INNER JOIN regions r ON h.region_id = r.id
      WHERE h.id = ? AND h.is_active = 1
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Hospital not found' },
      });
    }

    const row = result.rows[0];
    const hospital = {
      id: row.id,
      name: row.name,
      regionId: row.region_id,
      regionCode: row.region_code,
      regionName: row.region_name,
      type: row.hospital_type,
      city: row.city,
      address: row.address,
      postalCode: row.postal_code,
      phone: row.phone,
      latitude: parseFloat(row.latitude),
      longitude: parseFloat(row.longitude),
      bedCount: row.bed_count,
      hasEmergency: row.has_emergency === 1,
      hasICU: row.has_icu === 1,
      hasLab: row.has_lab === 1,
    };

    res.json({
      success: true,
      data: { hospital },
    });
  } catch (error) {
    console.error('Get hospital by ID error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Server error fetching hospital' },
    });
  }
};

// Get hospital test results (latest data for all conditions)
export const getHospitalTestResults = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { language = 'fr' } = req.query;
    const lang = language === 'en' ? 'en' : 'fr';

    console.log(`🧪 Getting test results for hospital ${id}`);

    // Get hospital with its region
    const hospitalQuery = `
      SELECT h.id, h.name_${lang} as name, h.region_id
      FROM hospitals h
      WHERE h.id = ? AND h.is_active = 1
    `;
    const hospitalResult = await pool.query(hospitalQuery, [id]);

    if (hospitalResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Hospital not found' },
      });
    }

    const hospital = hospitalResult.rows[0];
    const regionId = hospital.region_id;

    // Get latest test results for this region's conditions
    // Use a rotating index based on current time to simulate refresh
    const testResultsQuery = `
      SELECT
        c.id as condition_id,
        c.code as condition_code,
        c.name_${lang} as condition_name,
        c.category,
        tr.test_date,
        tr.total_tests,
        tr.positive_tests,
        tr.positive_rate,
        tr.population_tested,
        tr.data_index
      FROM test_results tr
      INNER JOIN conditions c ON tr.condition_id = c.id
      WHERE tr.region_id = ?
        AND c.is_active = 1
      ORDER BY tr.positive_rate DESC
    `;

    const resultsData = await pool.query(testResultsQuery, [regionId]);

    // Group by condition and pick one based on current time (to simulate rotation)
    const conditionMap = new Map();
    const rotationIndex = Math.floor(Date.now() / 30000) % 5; // Changes every 30 seconds, cycles through 5 values

    for (const row of resultsData.rows) {
      const condId = row.condition_id;
      if (!conditionMap.has(condId)) {
        conditionMap.set(condId, []);
      }
      conditionMap.get(condId).push(row);
    }

    // Pick one result per condition based on rotation and calculate trend
    const selectedRows = [];
    for (const [condId, rows] of conditionMap.entries()) {
      const currentIndex = rotationIndex % rows.length;
      const previousIndex = (rotationIndex - 1 + rows.length) % rows.length;

      const selectedRow = rows[currentIndex];
      const previousRow = rows[previousIndex];

      selectedRows.push({
        ...selectedRow,
        previousRate: parseFloat(previousRow.positive_rate),
      });
    }

    // Calculate severity, trends, and add normal rates for comparison
    const testResults = selectedRows.map((row: any) => {
      const positiveRate = parseFloat(row.positive_rate);
      let severity = 'normal';
      let normalRate = 2.0; // Default baseline rate

      // Determine severity thresholds
      if (positiveRate >= 20) {
        severity = 'critical';
      } else if (positiveRate >= 10) {
        severity = 'alert';
      } else if (positiveRate >= 5) {
        severity = 'warning';
      }

      // Set normal/baseline rates by condition category
      if (row.category === 'respiratory') {
        normalRate = 3.5;
      } else if (row.category === 'gastrointestinal') {
        normalRate = 2.0;
      } else if (row.category === 'bacterial') {
        normalRate = 1.5;
      }

      // Calculate trend
      const previousRate = row.previousRate || positiveRate;
      const trendChange = positiveRate - previousRate;
      let trend = 'stable';
      if (trendChange > 1) {
        trend = 'up';
      } else if (trendChange < -1) {
        trend = 'down';
      }

      return {
        conditionId: row.condition_id,
        conditionCode: row.condition_code,
        conditionName: row.condition_name,
        category: row.category,
        positiveRate: positiveRate,
        normalRate: normalRate,
        deviation: positiveRate - normalRate,
        totalTests: row.total_tests,
        positiveTests: row.positive_tests,
        populationTested: row.population_tested,
        severity: severity,
        lastUpdated: row.test_date,
        trend: trend,
        trendChange: trendChange,
      };
    });

    console.log(`🧪 ✅ Returning ${testResults.length} test results for hospital ${id}`);

    res.json({
      success: true,
      data: {
        hospital: {
          id: hospital.id,
          name: hospital.name,
        },
        testResults,
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('🧪 ❌ Get hospital test results error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Server error fetching test results', details: error.message },
    });
  }
};
