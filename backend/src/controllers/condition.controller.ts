import { Request, Response } from 'express';
import { pool } from '../config/database';

// Get all conditions
export const getConditions = async (req: Request, res: Response) => {
  try {
    const { language = 'fr', active, category } = req.query;
    const lang = language === 'en' ? 'en' : 'fr';

    let query = `
      SELECT
        id,
        code,
        name_${lang} as name,
        description_${lang} as description,
        category,
        is_active as "isActive"
      FROM conditions
      WHERE 1=1
    `;

    const params: any[] = [];

    if (active !== undefined) {
      params.push(active === 'true');
      query += ` AND is_active = $${params.length}`;
    }

    if (category) {
      params.push(category);
      query += ` AND category = $${params.length}`;
    }

    query += ` ORDER BY code`;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: { conditions: result.rows },
    });
  } catch (error) {
    console.error('Get conditions error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Server error fetching conditions' },
    });
  }
};

// Get condition by ID
export const getConditionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { language = 'fr' } = req.query;
    const lang = language === 'en' ? 'en' : 'fr';

    const result = await pool.query(
      `SELECT
        id,
        code,
        name_${lang} as name,
        description_${lang} as description,
        category,
        is_active as "isActive"
      FROM conditions
      WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Condition not found' },
      });
    }

    res.json({
      success: true,
      data: { condition: result.rows[0] },
    });
  } catch (error) {
    console.error('Get condition error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Server error fetching condition' },
    });
  }
};
