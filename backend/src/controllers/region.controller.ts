import { Request, Response } from 'express';
import { pool } from '../config/database';

// Get all regions
export const getRegions = async (req: Request, res: Response) => {
  try {
    const { language = 'fr', search } = req.query;
    const lang = language === 'en' ? 'en' : 'fr';

    let query = `
      SELECT
        id,
        code,
        name_${lang} as name,
        population,
        center_lat as "centerLat",
        center_lng as "centerLng"
      FROM regions
    `;

    const params: any[] = [];

    if (search) {
      params.push(`%${search}%`);
      query += ` WHERE name_${lang} ILIKE $${params.length}`;
    }

    query += ` ORDER BY code`;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: { regions: result.rows },
    });
  } catch (error) {
    console.error('Get regions error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Server error fetching regions' },
    });
  }
};

// Get region by ID
export const getRegionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { language = 'fr' } = req.query;
    const lang = language === 'en' ? 'en' : 'fr';

    const result = await pool.query(
      `SELECT
        id,
        code,
        name_${lang} as name,
        population,
        center_lat as "centerLat",
        center_lng as "centerLng",
        region_type as "regionType"
      FROM regions
      WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Region not found' },
      });
    }

    res.json({
      success: true,
      data: { region: result.rows[0] },
    });
  } catch (error) {
    console.error('Get region error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Server error fetching region' },
    });
  }
};

// Get region trends
export const getRegionTrends = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { conditionId, days = 30 } = req.query;

    if (!conditionId) {
      return res.status(400).json({
        success: false,
        error: { message: 'conditionId is required' },
      });
    }

    const result = await pool.query(
      `SELECT
        test_date as date,
        total_tests as "totalTests",
        positive_tests as "positiveTests",
        positive_rate as "positiveRate"
      FROM test_results
      WHERE region_id = $1
        AND condition_id = $2
        AND test_date >= CURRENT_DATE - INTERVAL '${days} days'
      ORDER BY test_date DESC`,
      [id, conditionId]
    );

    res.json({
      success: true,
      data: { trends: result.rows },
    });
  } catch (error) {
    console.error('Get region trends error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Server error fetching trends' },
    });
  }
};
