import { pool } from '../config/database';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

// Quebec regions data
const regions = [
  { code: '01', nameFr: 'Bas-Saint-Laurent', nameEn: 'Bas-Saint-Laurent', population: 199720, lat: 47.8489, lng: -68.5257 },
  { code: '02', nameFr: 'Saguenay–Lac-Saint-Jean', nameEn: 'Saguenay–Lac-Saint-Jean', population: 277080, lat: 48.4284, lng: -71.0656 },
  { code: '03', nameFr: 'Capitale-Nationale', nameEn: 'Quebec City', population: 755950, lat: 46.8139, lng: -71.2080 },
  { code: '04', nameFr: 'Mauricie-et-Centre-du-Québec', nameEn: 'Mauricie-Centre-du-Québec', population: 518810, lat: 46.3497, lng: -72.5478 },
  { code: '05', nameFr: 'Estrie', nameEn: 'Eastern Townships', population: 507850, lat: 45.4042, lng: -71.8929 },
  { code: '06', nameFr: 'Montréal', nameEn: 'Montreal', population: 2065000, lat: 45.5017, lng: -73.5673 },
  { code: '07', nameFr: 'Outaouais', nameEn: 'Outaouais', population: 405160, lat: 45.4765, lng: -75.7013 },
  { code: '08', nameFr: 'Abitibi-Témiscamingue', nameEn: 'Abitibi-Témiscamingue', population: 147510, lat: 48.2506, lng: -78.8752 },
  { code: '09', nameFr: 'Côte-Nord', nameEn: 'North Shore', population: 91800, lat: 49.8951, lng: -66.3783 },
  { code: '10', nameFr: 'Nord-du-Québec', nameEn: 'Northern Quebec', population: 45750, lat: 51.1865, lng: -77.9986 },
  { code: '11', nameFr: 'Gaspésie–Îles-de-la-Madeleine', nameEn: 'Gaspésie–Îles-de-la-Madeleine', population: 91340, lat: 48.8354, lng: -64.4897 },
  { code: '12', nameFr: 'Chaudière-Appalaches', nameEn: 'Chaudière-Appalaches', population: 429750, lat: 46.5458, lng: -70.6694 },
  { code: '13', nameFr: 'Laval', nameEn: 'Laval', population: 438360, lat: 45.6066, lng: -73.7124 },
  { code: '14', nameFr: 'Lanaudière', nameEn: 'Lanaudière', population: 522310, lat: 46.0522, lng: -73.4301 },
  { code: '15', nameFr: 'Laurentides', nameEn: 'Laurentians', population: 620660, lat: 45.9237, lng: -74.2904 },
  { code: '16', nameFr: 'Montérégie', nameEn: 'Montérégie', population: 1550990, lat: 45.5408, lng: -73.2544 },
  { code: '17', nameFr: 'Nunavik', nameEn: 'Nunavik', population: 14000, lat: 60.0389, lng: -69.6167 },
];

const conditions = [
  { code: 'FLU', nameFr: 'Influenza', nameEn: 'Influenza', descFr: 'Grippe saisonnière', descEn: 'Seasonal flu', category: 'respiratory' },
  { code: 'COVID', nameFr: 'COVID-19', nameEn: 'COVID-19', descFr: 'Coronavirus', descEn: 'Coronavirus', category: 'respiratory' },
  { code: 'STREP', nameFr: 'Streptocoque A', nameEn: 'Strep A', descFr: 'Infection streptococcique', descEn: 'Streptococcal infection', category: 'bacterial' },
  { code: 'RSV', nameFr: 'VRS', nameEn: 'RSV', descFr: 'Virus respiratoire syncytial', descEn: 'Respiratory syncytial virus', category: 'respiratory' },
  { code: 'NORO', nameFr: 'Norovirus', nameEn: 'Norovirus', descFr: 'Gastroentérite virale', descEn: 'Viral gastroenteritis', category: 'gastrointestinal' },
  { code: 'ECOLI', nameFr: 'E. coli', nameEn: 'E. coli', descFr: 'Escherichia coli', descEn: 'Escherichia coli', category: 'bacterial' },
];

const hospitals = [
  { nameFr: 'Hôpital régional de Rimouski', nameEn: 'Rimouski Regional Hospital', regionCode: '01', type: 'Regional', city: 'Rimouski', lat: 48.4489, lng: -68.5251, beds: 294, hasEmergency: true, hasICU: true, hasLab: true },
  { nameFr: 'Hôpital de Chicoutimi', nameEn: 'Chicoutimi Hospital', regionCode: '02', type: 'Regional', city: 'Chicoutimi', lat: 48.4174, lng: -71.0517, beds: 430, hasEmergency: true, hasICU: true, hasLab: true },
  { nameFr: 'CHU de Québec', nameEn: 'Quebec University Hospital', regionCode: '03', type: 'University', city: 'Québec', lat: 46.8139, lng: -71.2080, beds: 569, hasEmergency: true, hasICU: true, hasLab: true },
  { nameFr: 'CIUSSS MCQ', nameEn: 'CIUSSS MCQ', regionCode: '04', type: 'Regional', city: 'Trois-Rivières', lat: 46.3497, lng: -72.5478, beds: 350, hasEmergency: true, hasICU: true, hasLab: true },
  { nameFr: 'CIUSSS de l\'Estrie', nameEn: 'CIUSSS Estrie', regionCode: '05', type: 'Regional', city: 'Sherbrooke', lat: 45.4042, lng: -71.8929, beds: 450, hasEmergency: true, hasICU: true, hasLab: true },
  { nameFr: 'CHUM', nameEn: 'Montreal University Hospital', regionCode: '06', type: 'University', city: 'Montréal', lat: 45.5017, lng: -73.5673, beds: 772, hasEmergency: true, hasICU: true, hasLab: true },
  { nameFr: 'Hôpital de Gatineau', nameEn: 'Gatineau Hospital', regionCode: '07', type: 'Regional', city: 'Gatineau', lat: 45.4765, lng: -75.7013, beds: 264, hasEmergency: true, hasICU: true, hasLab: true },
  { nameFr: 'Hôpital de Rouyn-Noranda', nameEn: 'Rouyn-Noranda Hospital', regionCode: '08', type: 'Regional', city: 'Rouyn-Noranda', lat: 48.2506, lng: -78.8752, beds: 180, hasEmergency: true, hasICU: false, hasLab: true },
  { nameFr: 'Hôpital de Baie-Comeau', nameEn: 'Baie-Comeau Hospital', regionCode: '09', type: 'Community', city: 'Baie-Comeau', lat: 49.2175, lng: -68.1483, beds: 120, hasEmergency: true, hasICU: false, hasLab: true },
  { nameFr: 'Centre de santé Inuulitsivik', nameEn: 'Inuulitsivik Health Centre', regionCode: '10', type: 'Community', city: 'Puvirnituq', lat: 60.0389, lng: -77.2839, beds: 50, hasEmergency: true, hasICU: false, hasLab: true },
];

async function setupDatabase() {
  try {
    console.log('🔧 Setting up database...');

    // Read and execute schema SQL
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    await pool.query(schema);
    console.log('✅ Schema created');

    // Insert regions
    for (const region of regions) {
      await pool.query(
        'INSERT INTO regions (code, name_fr, name_en, population, center_lat, center_lng) VALUES ($1, $2, $3, $4, $5, $6)',
        [region.code, region.nameFr, region.nameEn, region.population, region.lat, region.lng]
      );
    }
    console.log('✅ Regions inserted');

    // Insert conditions
    for (const condition of conditions) {
      await pool.query(
        'INSERT INTO conditions (code, name_fr, name_en, description_fr, description_en, category) VALUES ($1, $2, $3, $4, $5, $6)',
        [condition.code, condition.nameFr, condition.nameEn, condition.descFr, condition.descEn, condition.category]
      );
    }
    console.log('✅ Conditions inserted');

    // Insert hospitals
    for (const hospital of hospitals) {
      const regionResult = await pool.query('SELECT id FROM regions WHERE code = $1', [hospital.regionCode]);
      if (regionResult.rows.length > 0) {
        const regionId = regionResult.rows[0].id;
        await pool.query(
          'INSERT INTO hospitals (name_fr, name_en, region_id, hospital_type, city, latitude, longitude, bed_count, has_emergency, has_icu, has_lab) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
          [hospital.nameFr, hospital.nameEn, regionId, hospital.type, hospital.city, hospital.lat, hospital.lng, hospital.beds, hospital.hasEmergency, hospital.hasICU, hospital.hasLab]
        );
      }
    }
    console.log('✅ Hospitals inserted');

    // Generate sample test results
    const hospitalResults = await pool.query('SELECT id FROM hospitals');
    const conditionResults = await pool.query('SELECT id FROM conditions');

    for (const hospital of hospitalResults.rows) {
      for (const condition of conditionResults.rows) {
        // Generate 30 days of test data
        for (let i = 0; i < 30; i++) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const totalTests = Math.floor(Math.random() * 100) + 20;
          const positiveCount = Math.floor(Math.random() * totalTests * 0.3);
          const negativeCount = totalTests - positiveCount;
          const positivityRate = ((positiveCount / totalTests) * 100).toFixed(2);

          await pool.query(
            'INSERT INTO test_results (hospital_id, condition_id, test_date, positive_count, negative_count, total_tests, positivity_rate) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [hospital.id, condition.id, date.toISOString().split('T')[0], positiveCount, negativeCount, totalTests, positivityRate]
          );
        }
      }
    }
    console.log('✅ Test results inserted');

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await pool.query(
      'INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5)',
      ['admin@epidemiqc.ca', hashedPassword, 'Admin', 'User', 'admin']
    );
    console.log('✅ Admin user created (admin@epidemiqc.ca / admin123)');

    console.log('🎉 Database setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();
