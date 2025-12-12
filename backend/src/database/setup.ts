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
  // Region 01 - Bas-Saint-Laurent
  { nameFr: 'Hôpital régional de Rimouski', nameEn: 'Rimouski Regional Hospital', regionCode: '01', type: 'Regional', city: 'Rimouski', lat: 48.4489, lng: -68.5251, beds: 294, hasEmergency: true, hasICU: true, hasLab: true },
  { nameFr: 'Hôpital Notre-Dame-de-Fatima', nameEn: 'Notre-Dame-de-Fatima Hospital', regionCode: '01', type: 'Community', city: 'La Pocatière', lat: 47.3664, lng: -70.0349, beds: 42, hasEmergency: true, hasICU: false, hasLab: true },

  // Region 02 - Saguenay–Lac-Saint-Jean
  { nameFr: 'Hôpital de Chicoutimi', nameEn: 'Chicoutimi Hospital', regionCode: '02', type: 'Regional', city: 'Chicoutimi', lat: 48.4174, lng: -71.0517, beds: 430, hasEmergency: true, hasICU: true, hasLab: true },
  { nameFr: 'Hôpital d\'Alma', nameEn: 'Alma Hospital', regionCode: '02', type: 'Community', city: 'Alma', lat: 48.5500, lng: -71.6492, beds: 180, hasEmergency: true, hasICU: false, hasLab: true },

  // Region 03 - Capitale-Nationale (Quebec City)
  { nameFr: 'CHU de Québec - Hôpital de l\'Enfant-Jésus', nameEn: 'CHU Quebec - Enfant-Jésus Hospital', regionCode: '03', type: 'University', city: 'Québec', lat: 46.8358, lng: -71.2229, beds: 569, hasEmergency: true, hasICU: true, hasLab: true },
  { nameFr: 'Hôpital Laval', nameEn: 'Laval Hospital', regionCode: '03', type: 'Specialized', city: 'Québec', lat: 46.7844, lng: -71.2797, beds: 252, hasEmergency: false, hasICU: true, hasLab: true },
  { nameFr: 'IUCPQ', nameEn: 'Quebec Heart and Lung Institute', regionCode: '03', type: 'Specialized', city: 'Québec', lat: 46.7871, lng: -71.2883, beds: 300, hasEmergency: true, hasICU: true, hasLab: true },

  // Region 04 - Mauricie-et-Centre-du-Québec
  { nameFr: 'CIUSSS MCQ', nameEn: 'Trois-Rivières Regional Hospital', regionCode: '04', type: 'Regional', city: 'Trois-Rivières', lat: 46.3625, lng: -72.5375, beds: 337, hasEmergency: true, hasICU: true, hasLab: true },
  { nameFr: 'Hôpital Sainte-Croix', nameEn: 'Sainte-Croix Hospital', regionCode: '04', type: 'Community', city: 'Drummondville', lat: 45.8804, lng: -72.4843, beds: 261, hasEmergency: true, hasICU: false, hasLab: true },

  // Region 05 - Estrie
  { nameFr: 'CHUS', nameEn: 'Sherbrooke University Hospital', regionCode: '05', type: 'University', city: 'Sherbrooke', lat: 45.3987, lng: -71.8956, beds: 682, hasEmergency: true, hasICU: true, hasLab: true },
  { nameFr: 'Hôpital de Granby', nameEn: 'Granby Hospital', regionCode: '05', type: 'Community', city: 'Granby', lat: 45.4003, lng: -72.7307, beds: 187, hasEmergency: true, hasICU: false, hasLab: true },

  // Region 06 - Montréal
  { nameFr: 'CHUM', nameEn: 'Montreal University Hospital Centre', regionCode: '06', type: 'University', city: 'Montréal', lat: 45.5075, lng: -73.5603, beds: 772, hasEmergency: true, hasICU: true, hasLab: true },
  { nameFr: 'Hôpital général juif', nameEn: 'Jewish General Hospital', regionCode: '06', type: 'University', city: 'Montréal', lat: 45.4961, lng: -73.6300, beds: 637, hasEmergency: true, hasICU: true, hasLab: true },
  { nameFr: 'Hôpital Maisonneuve-Rosemont', nameEn: 'Maisonneuve-Rosemont Hospital', regionCode: '06', type: 'University', city: 'Montréal', lat: 45.5987, lng: -73.5517, beds: 551, hasEmergency: true, hasICU: true, hasLab: true },
  { nameFr: 'Hôpital du Sacré-Coeur', nameEn: 'Sacré-Coeur Hospital', regionCode: '06', type: 'Regional', city: 'Montréal', lat: 45.5410, lng: -73.6716, beds: 546, hasEmergency: true, hasICU: true, hasLab: true },
  { nameFr: 'Hôpital général de Montréal', nameEn: 'Montreal General Hospital', regionCode: '06', type: 'University', city: 'Montréal', lat: 45.4964, lng: -73.5809, beds: 456, hasEmergency: true, hasICU: true, hasLab: true },

  // Region 07 - Outaouais
  { nameFr: 'Hôpital de Gatineau', nameEn: 'Gatineau Hospital', regionCode: '07', type: 'Regional', city: 'Gatineau', lat: 45.4767, lng: -75.6983, beds: 264, hasEmergency: true, hasICU: true, hasLab: true },
  { nameFr: 'Hôpital de Hull', nameEn: 'Hull Hospital', regionCode: '07', type: 'Regional', city: 'Gatineau', lat: 45.4276, lng: -75.7147, beds: 230, hasEmergency: true, hasICU: false, hasLab: true },

  // Region 08 - Abitibi-Témiscamingue
  { nameFr: 'Hôpital de Rouyn-Noranda', nameEn: 'Rouyn-Noranda Hospital', regionCode: '08', type: 'Regional', city: 'Rouyn-Noranda', lat: 48.2367, lng: -79.0122, beds: 142, hasEmergency: true, hasICU: true, hasLab: true },
  { nameFr: 'Centre hospitalier de Val-d\'Or', nameEn: 'Val-d\'Or Hospital', regionCode: '08', type: 'Community', city: 'Val-d\'Or', lat: 48.1002, lng: -77.7827, beds: 69, hasEmergency: true, hasICU: false, hasLab: true },

  // Region 09 - Côte-Nord
  { nameFr: 'Hôpital Le Royer', nameEn: 'Le Royer Hospital', regionCode: '09', type: 'Community', city: 'Baie-Comeau', lat: 49.2167, lng: -68.1486, beds: 90, hasEmergency: true, hasICU: false, hasLab: true },
  { nameFr: 'Centre de santé de Sept-Îles', nameEn: 'Sept-Îles Health Centre', regionCode: '09', type: 'Regional', city: 'Sept-Îles', lat: 50.2143, lng: -66.3821, beds: 115, hasEmergency: true, hasICU: true, hasLab: true },

  // Region 10 - Nord-du-Québec
  { nameFr: 'Centre de santé Tulattavik', nameEn: 'Tulattavik Health Centre', regionCode: '10', type: 'Community', city: 'Kuujjuaq', lat: 58.1095, lng: -68.4149, beds: 18, hasEmergency: true, hasICU: false, hasLab: true },
  { nameFr: 'Hôpital de Chibougamau', nameEn: 'Chibougamau Hospital', regionCode: '10', type: 'Community', city: 'Chibougamau', lat: 49.9204, lng: -74.3601, beds: 46, hasEmergency: true, hasICU: false, hasLab: true },

  // Region 11 - Gaspésie–Îles-de-la-Madeleine
  { nameFr: 'Hôpital de Gaspé', nameEn: 'Gaspé Hospital', regionCode: '11', type: 'Regional', city: 'Gaspé', lat: 48.8338, lng: -64.4807, beds: 68, hasEmergency: true, hasICU: false, hasLab: true },
  { nameFr: 'Hôpital de Chandler', nameEn: 'Chandler Hospital', regionCode: '11', type: 'Community', city: 'Chandler', lat: 48.3467, lng: -64.6807, beds: 40, hasEmergency: true, hasICU: false, hasLab: true },

  // Region 12 - Chaudière-Appalaches
  { nameFr: 'Hôtel-Dieu de Lévis', nameEn: 'Lévis Hôtel-Dieu', regionCode: '12', type: 'Regional', city: 'Lévis', lat: 46.8031, lng: -71.1800, beds: 315, hasEmergency: true, hasICU: true, hasLab: true },
  { nameFr: 'Hôpital de Thetford Mines', nameEn: 'Thetford Mines Hospital', regionCode: '12', type: 'Community', city: 'Thetford Mines', lat: 46.0944, lng: -71.3024, beds: 85, hasEmergency: true, hasICU: false, hasLab: true },

  // Region 13 - Laval
  { nameFr: 'Cité-de-la-Santé de Laval', nameEn: 'Laval Health City', regionCode: '13', type: 'Regional', city: 'Laval', lat: 45.5966, lng: -73.7444, beds: 523, hasEmergency: true, hasICU: true, hasLab: true },

  // Region 14 - Lanaudière
  { nameFr: 'Centre hospitalier Pierre-Le Gardeur', nameEn: 'Pierre-Le Gardeur Hospital', regionCode: '14', type: 'Regional', city: 'Terrebonne', lat: 45.6986, lng: -73.6421, beds: 306, hasEmergency: true, hasICU: true, hasLab: true },
  { nameFr: 'Centre hospitalier de Joliette', nameEn: 'Joliette Hospital', regionCode: '14', type: 'Regional', city: 'Joliette', lat: 46.0278, lng: -73.4389, beds: 246, hasEmergency: true, hasICU: false, hasLab: true },

  // Region 15 - Laurentides
  { nameFr: 'Hôpital de Saint-Eustache', nameEn: 'Saint-Eustache Hospital', regionCode: '15', type: 'Regional', city: 'Saint-Eustache', lat: 45.5653, lng: -73.8990, beds: 269, hasEmergency: true, hasICU: true, hasLab: true },
  { nameFr: 'Hôpital de Saint-Jérôme', nameEn: 'Saint-Jérôme Hospital', regionCode: '15', type: 'Regional', city: 'Saint-Jérôme', lat: 45.7756, lng: -74.0066, beds: 396, hasEmergency: true, hasICU: true, hasLab: true },

  // Region 16 - Montérégie
  { nameFr: 'Hôpital Charles-Le Moyne', nameEn: 'Charles-Le Moyne Hospital', regionCode: '16', type: 'University', city: 'Longueuil', lat: 45.4985, lng: -73.4441, beds: 582, hasEmergency: true, hasICU: true, hasLab: true },
  { nameFr: 'Hôpital du Haut-Richelieu', nameEn: 'Haut-Richelieu Hospital', regionCode: '16', type: 'Regional', city: 'Saint-Jean-sur-Richelieu', lat: 45.3167, lng: -73.2667, beds: 217, hasEmergency: true, hasICU: false, hasLab: true },
  { nameFr: 'Hôpital Pierre-Boucher', nameEn: 'Pierre-Boucher Hospital', regionCode: '16', type: 'Regional', city: 'Longueuil', lat: 45.5374, lng: -73.4532, beds: 323, hasEmergency: true, hasICU: true, hasLab: true },

  // Region 17 - Nunavik
  { nameFr: 'Centre de santé Inuulitsivik', nameEn: 'Inuulitsivik Health Centre', regionCode: '17', type: 'Community', city: 'Puvirnituq', lat: 60.0359, lng: -77.2822, beds: 14, hasEmergency: true, hasICU: false, hasLab: true },
];

async function setupDatabase() {
  try {
    console.log('🔧 Checking database...');

    // Check if database is already set up with correct number of hospitals
    const checkResult = await pool.query(
      "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'hospitals')"
    );

    if (checkResult.rows[0].exists) {
      const hospitalCount = await pool.query('SELECT COUNT(*) FROM hospitals');
      const count = parseInt(hospitalCount.rows[0].count);

      if (count === 37) {
        console.log('✅ Database already set up with all 37 hospitals, skipping...');
        return;
      } else {
        console.log(`⚠️  Database has ${count} hospitals, need 37. Recreating...`);
      }
    }

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

    // Generate sample test results - 5 data points per hospital/condition for rotating display
    const hospitalResults = await pool.query('SELECT id FROM hospitals');
    const conditionResults = await pool.query('SELECT id FROM conditions');

    const today = new Date().toISOString().split('T')[0];

    console.log(`📊 Generating test results for ${hospitalResults.rows.length} hospitals...`);

    for (const hospital of hospitalResults.rows) {
      for (const condition of conditionResults.rows) {
        // Create 5 data points with varying severity (will simulate rotation)
        const shouldHaveHighValues = Math.random() > 0.6; // 40% chance of outbreak

        const dataPoints = [
          { rate: Math.random() * 4 + 1 },      // Normal: 1-5%
          { rate: Math.random() * 5 + 5 },      // Warning: 5-10%
          { rate: Math.random() * 10 + 10 },    // Alert: 10-20%
          { rate: shouldHaveHighValues ? Math.random() * 15 + 20 : Math.random() * 5 + 4 }, // Critical or warning
          { rate: Math.random() * 3 + 2 },      // Normal: 2-5%
        ];

        for (const dataPoint of dataPoints) {
          const totalTests = Math.floor(Math.random() * 800) + 200;
          const positiveCount = Math.floor(totalTests * (dataPoint.rate / 100));
          const negativeCount = totalTests - positiveCount;
          const positivityRate = ((positiveCount / totalTests) * 100).toFixed(2);

          await pool.query(
            'INSERT INTO test_results (hospital_id, condition_id, test_date, positive_count, negative_count, total_tests, positivity_rate) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [hospital.id, condition.id, today, positiveCount, negativeCount, totalTests, parseFloat(positivityRate)]
          );
        }
      }
    }
    console.log(`✅ Test results inserted (${hospitalResults.rows.length * conditionResults.rows.length * 5} data points)`);

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await pool.query(
      'INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5)',
      ['admin@epidemiqc.ca', hashedPassword, 'Admin', 'User', 'admin']
    );
    console.log('✅ Admin user created (admin@epidemiqc.ca / admin123)');

    console.log('🎉 Database setup complete!');
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    throw error;
  }
}

// Export for server to use
export default setupDatabase;
