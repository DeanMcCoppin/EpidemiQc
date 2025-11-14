import { Request, Response } from 'express';
import { pool } from '../config/database';

// Get all hospitals
export const getHospitals = async (req: Request, res: Response) => {
  try {
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
      WHERE h.is_active = 1
    `;

    const params: any[] = [];

    if (regionId) {
      params.push(regionId);
      query += ` AND h.region_id = ?`;
    }

    if (hasLab !== undefined) {
      params.push(hasLab === 'true' ? 1 : 0);
      query += ` AND h.has_lab = ?`;
    }

    query += ` ORDER BY h.bed_count DESC`;

    const result = await pool.query(query, params);

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
      hasEmergency: row.has_emergency === 1,
      hasICU: row.has_icu === 1,
      hasLab: row.has_lab === 1,
    }));

    res.json({
      success: true,
      data: { hospitals },
    });
  } catch (error) {
    console.error('Get hospitals error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Server error fetching hospitals' },
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
