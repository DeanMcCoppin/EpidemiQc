import { Response } from 'express';
import { pool } from '../config/database';
import { AuthRequest } from '../types';

// Get all test results (paginated)
export const getTestResults = async (req: AuthRequest, res: Response) => {
  try {
    const { regionId, conditionId, startDate, endDate, page = 1, limit = 50 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = `
      SELECT
        tr.id,
        tr.test_date as "testDate",
        tr.total_tests as "totalTests",
        tr.positive_tests as "positiveTests",
        tr.positive_rate as "positiveRate",
        r.code as "regionCode",
        r.name_fr as "regionName",
        c.code as "conditionCode",
        c.name_fr as "conditionName"
      FROM test_results tr
      INNER JOIN regions r ON tr.region_id = r.id
      INNER JOIN conditions c ON tr.condition_id = c.id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (regionId) {
      params.push(regionId);
      query += ` AND tr.region_id = $${params.length}`;
    }

    if (conditionId) {
      params.push(conditionId);
      query += ` AND tr.condition_id = $${params.length}`;
    }

    if (startDate) {
      params.push(startDate);
      query += ` AND tr.test_date >= $${params.length}`;
    }

    if (endDate) {
      params.push(endDate);
      query += ` AND tr.test_date <= $${params.length}`;
    }

    // Get total count
    const countResult = await pool.query(`SELECT COUNT(*) FROM (${query}) as count_query`, params);
    const total = parseInt(countResult.rows[0].count);

    // Add pagination
    params.push(Number(limit), offset);
    query += ` ORDER BY tr.test_date DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: {
        results: result.rows,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          totalItems: total,
          itemsPerPage: Number(limit),
        },
      },
    });
  } catch (error) {
    console.error('Get test results error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Server error fetching test results' },
    });
  }
};

// Create test result
export const createTestResult = async (req: AuthRequest, res: Response) => {
  try {
    const { regionId, conditionId, testDate, totalTests, positiveTests } = req.body;

    if (!regionId || !conditionId || !testDate || !totalTests || positiveTests === undefined) {
      return res.status(400).json({
        success: false,
        error: { message: 'All fields are required' },
      });
    }

    if (positiveTests > totalTests) {
      return res.status(400).json({
        success: false,
        error: { message: 'Positive tests cannot exceed total tests' },
      });
    }

    const positiveRate = ((positiveTests / totalTests) * 100).toFixed(2);

    const result = await pool.query(
      `INSERT INTO test_results (region_id, condition_id, test_date, total_tests, positive_tests, positive_rate)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (region_id, condition_id, test_date)
       DO UPDATE SET
         total_tests = EXCLUDED.total_tests,
         positive_tests = EXCLUDED.positive_tests,
         positive_rate = EXCLUDED.positive_rate,
         updated_at = CURRENT_TIMESTAMP
       RETURNING id`,
      [regionId, conditionId, testDate, totalTests, positiveTests, positiveRate]
    );

    // Log audit
    await pool.query(
      `INSERT INTO audit_logs (admin_id, action, resource_type, resource_id, details)
       VALUES ($1, $2, $3, $4, $5)`,
      [req.user?.id, 'create_test_result', 'test_results', result.rows[0].id, JSON.stringify(req.body)]
    );

    res.status(201).json({
      success: true,
      data: {
        message: 'Test result created successfully',
        result: { id: result.rows[0].id },
      },
    });
  } catch (error) {
    console.error('Create test result error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Server error creating test result' },
    });
  }
};

// Get analytics overview
export const getAnalyticsOverview = async (req: AuthRequest, res: Response) => {
  try {
    // Total users
    const usersResult = await pool.query('SELECT COUNT(*) as total FROM users WHERE role = $1', ['user']);
    const totalUsers = parseInt(usersResult.rows[0].total);

    // Active users (logged in last 30 days)
    const activeUsersResult = await pool.query(
      'SELECT COUNT(*) as total FROM users WHERE last_login >= CURRENT_DATE - INTERVAL \'30 days\''
    );
    const activeUsers = parseInt(activeUsersResult.rows[0].total);

    // Current outbreaks (positive rate >= 5%)
    const outbreaksResult = await pool.query(`
      SELECT COUNT(*) as total
      FROM (
        SELECT DISTINCT region_id, condition_id
        FROM test_results
        WHERE test_date = CURRENT_DATE
          AND positive_rate >= 5.0
      ) as outbreaks
    `);
    const totalOutbreaks = parseInt(outbreaksResult.rows[0].total);

    // Critical outbreaks (positive rate >= 20%)
    const criticalResult = await pool.query(`
      SELECT COUNT(*) as total
      FROM (
        SELECT DISTINCT region_id, condition_id
        FROM test_results
        WHERE test_date = CURRENT_DATE
          AND positive_rate >= 20.0
      ) as critical
    `);
    const criticalOutbreaks = parseInt(criticalResult.rows[0].total);

    // Notifications sent today
    const notificationsResult = await pool.query(
      'SELECT COUNT(*) as total FROM notifications WHERE DATE(sent_at) = CURRENT_DATE'
    );
    const notificationsSentToday = parseInt(notificationsResult.rows[0].total);

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        totalOutbreaks,
        criticalOutbreaks,
        notificationsSentToday,
      },
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Server error fetching analytics' },
    });
  }
};

// Get thresholds
export const getThresholds = async (req: AuthRequest, res: Response) => {
  try {
    const { conditionId } = req.query;

    let query = `
      SELECT
        t.id,
        t.threshold_type as "thresholdType",
        t.threshold_value as "thresholdValue",
        t.color_code as "colorCode",
        c.code as "conditionCode",
        c.name_fr as "conditionName"
      FROM thresholds t
      INNER JOIN conditions c ON t.condition_id = c.id
      WHERE t.region_id IS NULL
    `;

    const params: any[] = [];

    if (conditionId) {
      params.push(conditionId);
      query += ` AND t.condition_id = $${params.length}`;
    }

    query += ` ORDER BY c.code, t.threshold_value`;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: { thresholds: result.rows },
    });
  } catch (error) {
    console.error('Get thresholds error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Server error fetching thresholds' },
    });
  }
};

// Update threshold
export const updateThreshold = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { thresholdValue, colorCode } = req.body;

    const result = await pool.query(
      `UPDATE thresholds
       SET threshold_value = COALESCE($1, threshold_value),
           color_code = COALESCE($2, color_code),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING id`,
      [thresholdValue, colorCode, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Threshold not found' },
      });
    }

    // Log audit
    await pool.query(
      `INSERT INTO audit_logs (admin_id, action, resource_type, resource_id, details)
       VALUES ($1, $2, $3, $4, $5)`,
      [req.user?.id, 'update_threshold', 'thresholds', id, JSON.stringify(req.body)]
    );

    res.json({
      success: true,
      data: { message: 'Threshold updated successfully' },
    });
  } catch (error) {
    console.error('Update threshold error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Server error updating threshold' },
    });
  }
};
