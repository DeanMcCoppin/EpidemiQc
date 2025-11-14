import { Request, Response } from 'express';
import { pool } from '../config/database';

// Get current outbreaks
export const getCurrentOutbreaks = async (req: Request, res: Response) => {
  try {
    const { language = 'fr', severity, regionId } = req.query;
    const lang = language === 'en' ? 'en' : 'fr';

    // Get latest test results with outbreak status
    let query = `
      SELECT
        r.id as region_id,
        r.code as region_code,
        r.name_${lang} as region_name,
        r.center_lat,
        r.center_lng,
        r.population,
        c.id as condition_id,
        c.code as condition_code,
        c.name_${lang} as condition_name,
        c.category,
        tr.test_date,
        tr.total_tests,
        tr.positive_tests,
        tr.positive_rate,
        tr.population_tested,
        t.threshold_type,
        t.threshold_value,
        t.color_code
      FROM test_results tr
      INNER JOIN regions r ON tr.region_id = r.id
      INNER JOIN conditions c ON tr.condition_id = c.id
      LEFT JOIN thresholds t ON tr.condition_id = t.condition_id
        AND t.region_id IS NULL
        AND tr.positive_rate >= t.threshold_value
      WHERE tr.test_date = (
        SELECT MAX(test_date)
        FROM test_results
        WHERE region_id = tr.region_id AND condition_id = tr.condition_id
      )
      AND c.is_active = 1
    `;

    const params: any[] = [];

    if (regionId) {
      params.push(regionId);
      query += ` AND r.id = $${params.length}`;
    }

    query += ` ORDER BY tr.positive_rate DESC`;

    const result = await pool.query(query, params);

    // Process results to determine severity
    const outbreaks = result.rows.map((row: any) => {
      let severity = 'normal';
      let colorCode = '#22C55E'; // Green

      if (row.positive_rate >= 20) {
        severity = 'critical';
        colorCode = '#DC143C';
      } else if (row.positive_rate >= 10) {
        severity = 'alert';
        colorCode = '#FF4500';
      } else if (row.positive_rate >= 5) {
        severity = 'warning';
        colorCode = '#FFA500';
      }

      // Calculate trend (simplified - comparing to average)
      const trend = row.positive_rate > 5 ? 'increasing' : 'stable';

      return {
        region: {
          id: row.region_id,
          code: row.region_code,
          name: row.region_name,
          centerLat: parseFloat(row.center_lat),
          centerLng: parseFloat(row.center_lng),
          population: row.population,
        },
        condition: {
          id: row.condition_id,
          code: row.condition_code,
          name: row.condition_name,
          category: row.category,
        },
        positiveRate: parseFloat(row.positive_rate),
        totalTests: row.total_tests,
        positiveTests: row.positive_tests,
        severity,
        colorCode,
        trend,
        affectedPopulation: row.population_tested,
        lastUpdated: row.test_date,
      };
    });

    // Filter by severity if provided
    let filteredOutbreaks = outbreaks;
    if (severity) {
      const severities = (severity as string).split(',');
      filteredOutbreaks = outbreaks.filter((o: any) => severities.includes(o.severity));
    }

    // Calculate summary
    const summary = {
      total: filteredOutbreaks.length,
      bySeverity: {
        normal: filteredOutbreaks.filter((o: any) => o.severity === 'normal').length,
        warning: filteredOutbreaks.filter((o: any) => o.severity === 'warning').length,
        alert: filteredOutbreaks.filter((o: any) => o.severity === 'alert').length,
        critical: filteredOutbreaks.filter((o: any) => o.severity === 'critical').length,
      },
    };

    res.json({
      success: true,
      data: {
        outbreaks: filteredOutbreaks,
        summary,
      },
    });
  } catch (error) {
    console.error('Get outbreaks error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Server error fetching outbreaks' },
    });
  }
};

// Get map data (aggregated by region)
export const getMapData = async (req: Request, res: Response) => {
  try {
    const { language = 'fr' } = req.query;
    const lang = language === 'en' ? 'en' : 'fr';

    // Get all regions
    const regionsQuery = `
      SELECT
        id,
        code,
        name_${lang} as name,
        center_lat,
        center_lng,
        population
      FROM regions
      ORDER BY code
    `;

    const regionsResult = await pool.query(regionsQuery);

    // Get latest test results for each region/condition
    const outbreaksQuery = `
      SELECT
        tr.region_id,
        c.name_${lang} as condition_name,
        c.code as condition_code,
        tr.positive_rate,
        tr.test_date
      FROM test_results tr
      INNER JOIN conditions c ON tr.condition_id = c.id
      WHERE c.is_active = 1
        AND tr.test_date = (
          SELECT MAX(test_date)
          FROM test_results
          WHERE region_id = tr.region_id AND condition_id = tr.condition_id
        )
      ORDER BY tr.region_id, tr.positive_rate DESC
    `;

    const outbreaksResult = await pool.query(outbreaksQuery);

    // Group outbreaks by region
    const outbreaksByRegion: any = {};
    outbreaksResult.rows.forEach((row: any) => {
      if (!outbreaksByRegion[row.region_id]) {
        outbreaksByRegion[row.region_id] = [];
      }
      outbreaksByRegion[row.region_id].push({
        conditionName: row.condition_name,
        conditionCode: row.condition_code,
        positiveRate: parseFloat(row.positive_rate),
      });
    });

    // Build response with regions and outbreaks
    const regions = regionsResult.rows.map((row: any) => {
      const regionOutbreaks = outbreaksByRegion[row.id] || [];
      const maxRate = regionOutbreaks.length > 0
        ? Math.max(...regionOutbreaks.map((o: any) => o.positiveRate))
        : 0;

      let maxSeverity = 'normal';
      let colorCode = '#22C55E';

      if (maxRate >= 20) {
        maxSeverity = 'critical';
        colorCode = '#DC143C';
      } else if (maxRate >= 10) {
        maxSeverity = 'alert';
        colorCode = '#FF4500';
      } else if (maxRate >= 5) {
        maxSeverity = 'warning';
        colorCode = '#FFA500';
      }

      return {
        id: row.id,
        code: row.code,
        name: row.name,
        centerLat: parseFloat(row.center_lat),
        centerLng: parseFloat(row.center_lng),
        population: row.population,
        outbreaks: regionOutbreaks,
        maxSeverity,
        colorCode,
      };
    });

    res.json({
      success: true,
      data: { regions },
    });
  } catch (error) {
    console.error('Get map data error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Server error fetching map data' },
    });
  }
};
