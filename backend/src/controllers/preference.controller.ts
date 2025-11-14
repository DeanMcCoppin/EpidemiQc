import { Response } from 'express';
import { pool } from '../config/database';
import { AuthRequest } from '../types';

// Get user preferences
export const getPreferences = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { language = 'fr' } = req.query;
    const lang = language === 'en' ? 'en' : 'fr';

    const result = await pool.query(
      `SELECT
        up.id,
        up.email_enabled as "emailEnabled",
        up.push_enabled as "pushEnabled",
        up.min_severity as "minSeverity",
        json_build_object(
          'id', c.id,
          'code', c.code,
          'name', c.name_${lang}
        ) as condition,
        json_build_object(
          'id', r.id,
          'code', r.code,
          'name', r.name_${lang}
        ) as region
      FROM user_preferences up
      INNER JOIN conditions c ON up.condition_id = c.id
      INNER JOIN regions r ON up.region_id = r.id
      WHERE up.user_id = $1
      ORDER BY up.id DESC`,
      [userId]
    );

    res.json({
      success: true,
      data: { preferences: result.rows },
    });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Server error fetching preferences' },
    });
  }
};

// Create preference
export const createPreference = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { conditionId, regionId, emailEnabled = true, pushEnabled = true, minSeverity = 'warning' } = req.body;

    if (!conditionId || !regionId) {
      return res.status(400).json({
        success: false,
        error: { message: 'conditionId and regionId are required' },
      });
    }

    // Check if preference already exists
    const existing = await pool.query(
      'SELECT id FROM user_preferences WHERE user_id = $1 AND condition_id = $2 AND region_id = $3',
      [userId, conditionId, regionId]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Preference already exists' },
      });
    }

    const result = await pool.query(
      `INSERT INTO user_preferences (user_id, condition_id, region_id, email_enabled, push_enabled, min_severity)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [userId, conditionId, regionId, emailEnabled, pushEnabled, minSeverity]
    );

    res.status(201).json({
      success: true,
      data: {
        message: 'Preference created successfully',
        preference: { id: result.rows[0].id },
      },
    });
  } catch (error) {
    console.error('Create preference error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Server error creating preference' },
    });
  }
};

// Update preference
export const updatePreference = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { emailEnabled, pushEnabled, minSeverity } = req.body;

    // Verify ownership
    const existing = await pool.query('SELECT id FROM user_preferences WHERE id = $1 AND user_id = $2', [id, userId]);

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Preference not found' },
      });
    }

    await pool.query(
      `UPDATE user_preferences
       SET email_enabled = COALESCE($1, email_enabled),
           push_enabled = COALESCE($2, push_enabled),
           min_severity = COALESCE($3, min_severity)
       WHERE id = $4`,
      [emailEnabled, pushEnabled, minSeverity, id]
    );

    res.json({
      success: true,
      data: { message: 'Preference updated successfully' },
    });
  } catch (error) {
    console.error('Update preference error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Server error updating preference' },
    });
  }
};

// Delete preference
export const deletePreference = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const result = await pool.query('DELETE FROM user_preferences WHERE id = $1 AND user_id = $2 RETURNING id', [id, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Preference not found' },
      });
    }

    res.json({
      success: true,
      data: { message: 'Preference deleted successfully' },
    });
  } catch (error) {
    console.error('Delete preference error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Server error deleting preference' },
    });
  }
};
