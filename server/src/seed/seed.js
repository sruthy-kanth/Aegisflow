import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB, disconnectDB } from '../config/db.js';
import { logger } from '../config/logger.js';
import { generateSecureToken, hashToken, maskPhone, encryptString } from '../utils/crypto.js';

// Models
import { Region } from '../models/Region.js';
import { User } from '../models/User.js';
import { Zone } from '../models/Zone.js';
import { Camp } from '../models/Camp.js';
import { Route } from '../models/Route.js';
import { Household } from '../models/Household.js';
import { Volunteer } from '../models/Volunteer.js';
import { Sensor } from '../models/Sensor.js';
import { SensorReading } from '../models/SensorReading.js';
import { ThresholdConfig } from '../models/ThresholdConfig.js';
import { AuditLog } from '../models/AuditLog.js';

dotenv.config();

export async function runSeed() {
  logger.info('🌱 Starting AegisFlow database seeding...');
  await connectDB();

  // Clear existing collections
  await Promise.all([
    Region.deleteMany({}),
    User.deleteMany({}),
    Zone.deleteMany({}),
    Camp.deleteMany({}),
    Route.deleteMany({}),
    Household.deleteMany({}),
    Volunteer.deleteMany({}),
    Sensor.deleteMany({}),
    SensorReading.deleteMany({}),
    ThresholdConfig.deleteMany({}),
    AuditLog.deleteMany({})
  ]);

  logger.info('🧹 Cleaned existing database records.');

  // 1. Create Superadmin
  const superadminPasswordHash = await User.hashPassword('SuperAdmin@123!');
  const superadmin = await User.create({
    name: 'National Disaster Management Administrator',
    email: 'superadmin@aegisflow.gov.in',
    passwordHash: superadminPasswordHash,
    role: 'SUPERADMIN',
    phone: '+91 9876543200',
    designation: 'Director General of Early Warning Systems',
    department: 'National Emergency Response Centre',
    active: true
  });
  logger.info(`✅ Superadmin created: ${superadmin.email}`);

  // 2. Create Wayanad Demo Region
  const wayanadRegion = await Region.create({
    name: 'Wayanad District',
    code: 'WYD',
    state: 'Kerala',
    country: 'India',
    description: 'High-altitude Western Ghats hilly terrain prone to monsoon flash-floods and debris slides',
    centerLocation: {
      type: 'Point',
      coordinates: [76.1320, 11.6854] // Kalpetta approx [lng, lat]
    },
    bounds: {
      north: 11.9800,
      south: 11.4500,
      east: 76.4500,
      west: 75.9000
    },
    timezone: 'Asia/Kolkata',
    emergencyContacts: [
      { title: 'District Disaster Management Authority (DDMA) Control Room', phone: '1077', role: 'District Emergency Operations Center' },
      { title: 'Collectorate Wayanad Help Desk', phone: '+91 4936 202234', role: 'Revenue Office' },
      { title: 'Kerala Fire & Rescue Services', phone: '101', role: 'First Responders' },
      { title: 'NDRF 4th Battalion Control Room', phone: '+91 44 26840700', role: 'National Disaster Response Force' }
    ],
    settings: {
      approvalTimeoutMinutes: 15,
      voiceFallbackDelayMinutes: 20,
      doorKnockDelayMinutes: 30,
      buzzerEnabled: true
    },
    active: true
  });
  logger.info(`✅ Region created: ${wayanadRegion.name} (${wayanadRegion.code})`);

  // 3. Create Regional Admin for Wayanad
  const adminPasswordHash = await User.hashPassword('WayanadAdmin@123!');
  const wayanadAdmin = await User.create({
    name: 'Sri. Arun Kumar IAS',
    email: 'admin.wayanad@aegisflow.gov.in',
    passwordHash: adminPasswordHash,
    role: 'ADMIN',
    regionId: wayanadRegion._id,
    phone: '+91 9876543210',
    designation: 'District Collector & Chairman DDMA',
    department: 'Revenue & Disaster Management Department, Govt. of Kerala',
    active: true
  });
  logger.info(`✅ Regional Admin created: ${wayanadAdmin.email}`);

  // 4. Create Global and Region Threshold Configurations
  const globalThreshold = await ThresholdConfig.create({
    version: 1,
    name: 'Standard Western Ghats Default Rainfall Thresholds v1',
    description: 'Based on Central Water Commission & IMD hilly terrain guidelines',
    isGlobalDefault: true,
    rainfall24h: { watch: 65, warning: 115, evacuate: 200 },
    rainfall72h: { watch: 120, warning: 180, evacuate: 300 },
    rainfallForecast24h: { watch: 70, warning: 125, evacuate: 210 },
    soilMoisturePercent: { watch: 70, warning: 85, evacuate: 95 },
    createdBy: superadmin._id,
    active: true
  });

  const wayanadThreshold = await ThresholdConfig.create({
    version: 1,
    name: 'Wayanad High-Slope Calibrated Thresholds v1',
    description: 'Locally calibrated for Meppadi-Vythiri steep slope catchment',
    isGlobalDefault: false,
    regionId: wayanadRegion._id,
    rainfall24h: { watch: 60, warning: 105, evacuate: 180 },
    rainfall72h: { watch: 110, warning: 165, evacuate: 260 },
    rainfallForecast24h: { watch: 65, warning: 115, evacuate: 195 },
    soilMoisturePercent: { watch: 68, warning: 82, evacuate: 92 },
    messageTemplates: {
      en: {
        watch: 'AEGISFLOW ADVISORY (Wayanad DDMA): Heightened rainfall detected in your sector. Stay alert, monitor river levels, keep emergency bag ready. Link: {{link}}',
        warning: 'AEGISFLOW WARNING (Wayanad DDMA): High landslide & flash-flood risk detected. Move to higher ground or check designated camp immediately. Link: {{link}}',
        evacuate: 'AEGISFLOW EVACUATION ORDER: Immediate landslide danger in your sector. Evacuate NOW to designated shelter using clear route. Link: {{link}}'
      },
      ml: {
        watch: 'ഈജിസ്ഫ്ലോ ജാഗ്രതാ നിർദ്ദേശം (വയനാട് ഡി.ഡി.എം.എ): നിങ്ങളുടെ പ്രദേശത്ത് കനത്ത മഴ രേഖപ്പെടുത്തുന്നു. ജാഗ്രത പാലിക്കുക. വിവരങ്ങൾക്ക്: {{link}}',
        warning: 'ഈജിസ്ഫ്ലോ മുന്നറിയിപ്പ് (വയനാട് ഡി.ഡി.എം.എ): കനത്ത മഴ കാരണം മണ്ണിടിച്ചിൽ സാധ്യത. സുരക്ഷിത സ്ഥാനങ്ങളിലേക്ക് മാറുക. വിവരങ്ങൾക്ക്: {{link}}',
        evacuate: 'ഈജിസ്ഫ്ലോ അടിയന്തര ഒഴിപ്പിക്കൽ ഉത്തരവ്: നിങ്ങളുടെ പ്രദേശത്ത് അതിതീവ്ര മണ്ണിടിച്ചിൽ സാധ്യത. ഉടൻ തന്നെ നിശ്ചയിച്ച ക്യാമ്പിലേക്ക് മാറുക. വിവരങ്ങൾക്ക്: {{link}}'
      }
    },
    createdBy: wayanadAdmin._id,
    active: true
  });
  logger.info('✅ Threshold configurations seeded');

  // 5. Create Sample Zones in Wayanad
  // Zone 1: Meppadi - Chooralmala - Mundakkai (High Risk Landslide Zone)
  const zoneChooralmala = await Zone.create({
    name: 'Meppadi - Chooralmala - Mundakkai Sector',
    code: 'WYD-Z01',
    regionId: wayanadRegion._id,
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [76.1150, 11.5200],
        [76.1650, 11.5200],
        [76.1650, 11.5750],
        [76.1150, 11.5750],
        [76.1150, 11.5200]
      ]]
    },
    centroid: {
      type: 'Point',
      coordinates: [76.1380, 11.5450]
    },
    populationEstimate: 4800,
    slopeRiskScore: 9.2,
    isLocallyCalibrated: true,
    currentTier: 'none',
    active: true
  });

  // Zone 2: Vythiri - Pozhuthana (Flash Flood Risk Zone)
  const zoneVythiri = await Zone.create({
    name: 'Vythiri - Pozhuthana Catchment Sector',
    code: 'WYD-Z02',
    regionId: wayanadRegion._id,
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [76.0100, 11.5100],
        [76.0650, 11.5100],
        [76.0650, 11.5800],
        [76.0100, 11.5800],
        [76.0100, 11.5100]
      ]]
    },
    centroid: {
      type: 'Point',
      coordinates: [76.0350, 11.5450]
    },
    populationEstimate: 6200,
    slopeRiskScore: 7.8,
    isLocallyCalibrated: true,
    currentTier: 'none',
    active: true
  });

  // Zone 3: Mananthavady - Kabini (Riverine Basin Zone)
  const zoneMananthavady = await Zone.create({
    name: 'Mananthavady - Kabini River Basin',
    code: 'WYD-Z03',
    regionId: wayanadRegion._id,
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [75.9700, 11.7700],
        [76.0400, 11.7700],
        [76.0400, 11.8400],
        [75.9700, 11.8400],
        [75.9700, 11.7700]
      ]]
    },
    centroid: {
      type: 'Point',
      coordinates: [76.0050, 11.8050]
    },
    populationEstimate: 8500,
    slopeRiskScore: 6.4,
    currentTier: 'none',
    active: true
  });

  logger.info('✅ 3 Sample Zones created in Wayanad');

  // 6. Create Camps
  const campMeppadiSchool = await Camp.create({
    name: 'Meppadi Govt Higher Secondary School Relief Camp',
    regionId: wayanadRegion._id,
    location: {
      type: 'Point',
      coordinates: [76.1260, 11.5520]
    },
    address: 'Meppadi Town, P.O. Meppadi, Wayanad 673577',
    capacity: 450,
    currentOccupancy: 42,
    facilities: ['Medical Dispensary', 'Drinking Water Filter Units', 'Baby Care Station', 'High-Capacity Generator', 'Separate Sanitation Blocks', 'Kitchen Facilities'],
    contactPerson: 'K. Sasi (Camp In-Charge)',
    contactPhone: '+91 94471 23456',
    lastInspectedAt: new Date(),
    active: true
  });

  const campStJoseph = await Camp.create({
    name: 'St. Joseph Community Hall Emergency Shelter',
    regionId: wayanadRegion._id,
    location: {
      type: 'Point',
      coordinates: [76.1180, 11.5600]
    },
    address: 'Main Road, Meppadi, Wayanad',
    capacity: 300,
    currentOccupancy: 15,
    facilities: ['Clean Water', 'Medical First Aid', 'Shelter Beds', 'Power Backup'],
    contactPerson: 'Sr. Mary (Welfare Officer)',
    contactPhone: '+91 94472 34567',
    lastInspectedAt: new Date(),
    active: true
  });

  const campVythiri = await Camp.create({
    name: 'Vythiri Taluk Model Relief Camp',
    regionId: wayanadRegion._id,
    location: {
      type: 'Point',
      coordinates: [76.0420, 11.5510]
    },
    address: 'Near Old Bus Stand, Vythiri, Wayanad',
    capacity: 350,
    currentOccupancy: 0,
    facilities: ['Medical Station', 'Safe Potable Water', 'Kitchen Supplies'],
    contactPerson: 'Ramesh Babu (Tahsildar)',
    contactPhone: '+91 94473 45678',
    lastInspectedAt: new Date(),
    active: true
  });

  logger.info('✅ 3 Camps created');

  // 7. Create Routes
  const routePrimaryChooralmala = await Route.create({
    name: 'Route A1: Chooralmala Valley to Meppadi School Camp (Main PWD Road)',
    regionId: wayanadRegion._id,
    zoneId: zoneChooralmala._id,
    destinationCampId: campMeppadiSchool._id,
    type: 'primary',
    status: 'clear',
    path: {
      type: 'LineString',
      coordinates: [
        [76.1420, 11.5380],
        [76.1380, 11.5420],
        [76.1320, 11.5470],
        [76.1260, 11.5520]
      ]
    },
    updatedBy: 'Warden Manoj K.P.',
    updatedAtStatus: new Date()
  });

  const routeAltChooralmala = await Route.create({
    name: 'Route A2: Chooralmala Ridge Bypass via Estate Road',
    regionId: wayanadRegion._id,
    zoneId: zoneChooralmala._id,
    destinationCampId: campStJoseph._id,
    type: 'alternate',
    status: 'clear',
    path: {
      type: 'LineString',
      coordinates: [
        [76.1420, 11.5380],
        [76.1350, 11.5490],
        [76.1230, 11.5550],
        [76.1180, 11.5600]
      ]
    },
    updatedBy: 'Warden Manoj K.P.',
    updatedAtStatus: new Date()
  });

  const routeBlockedBridge = await Route.create({
    name: 'Route B1: Lower Mundakkai Stream Crossing',
    regionId: wayanadRegion._id,
    zoneId: zoneChooralmala._id,
    destinationCampId: campMeppadiSchool._id,
    type: 'alternate',
    status: 'blocked',
    blockedReason: 'Debris flow and heavy mud accumulation near bridge approach. Culvert inundated.',
    path: {
      type: 'LineString',
      coordinates: [
        [76.1480, 11.5320],
        [76.1440, 11.5360],
        [76.1400, 11.5390]
      ]
    },
    updatedBy: 'Warden Manoj K.P.',
    updatedAtStatus: new Date()
  });

  logger.info('✅ Sample evacuation routes created');

  // 8. Create IoT Sensors
  const rawKeyRain01 = 'aegis_dev_wy_rain_01_secretkey_998877665544332211aabbccddeeff00';
  const sensorRain01 = await Sensor.create({
    name: 'Meppadi Ridge Optical Rain Gauge',
    deviceId: 'SNS-WYD-RAIN-01',
    regionId: wayanadRegion._id,
    zoneId: zoneChooralmala._id,
    type: 'rain',
    location: {
      type: 'Point',
      coordinates: [76.1400, 11.5420]
    },
    elevationMeters: 1120,
    deviceKeyHash: hashToken(rawKeyRain01),
    battery: 98,
    status: 'active',
    lastSeenAt: new Date()
  });

  const rawKeySoil01 = 'aegis_dev_wy_soil_01_secretkey_112233445566778899aabbccddeeff00';
  const sensorSoil01 = await Sensor.create({
    name: 'Chooralmala Slope Moisture Probe',
    deviceId: 'SNS-WYD-SOIL-01',
    regionId: wayanadRegion._id,
    zoneId: zoneChooralmala._id,
    type: 'soil',
    location: {
      type: 'Point',
      coordinates: [76.1425, 11.5395]
    },
    elevationMeters: 1040,
    deviceKeyHash: hashToken(rawKeySoil01),
    battery: 92,
    status: 'active',
    lastSeenAt: new Date()
  });

  const rawKeyRain02 = 'aegis_dev_wy_rain_02_secretkey_445566778899001122aabbccddeeff00';
  const sensorRain02 = await Sensor.create({
    name: 'Vythiri Catchment Rain Gauge',
    deviceId: 'SNS-WYD-RAIN-02',
    regionId: wayanadRegion._id,
    zoneId: zoneVythiri._id,
    type: 'rain',
    location: {
      type: 'Point',
      coordinates: [76.0380, 11.5460]
    },
    elevationMeters: 920,
    deviceKeyHash: hashToken(rawKeyRain02),
    battery: 95,
    status: 'active',
    lastSeenAt: new Date()
  });

  logger.info('✅ 3 IoT telemetry sensors created');

  // 9. Create Sample Households with Raw Tokens
  // We generate random 32-byte tokens and keep the plain tokens for testing demonstration!
  const demoHouseholdTokens = [];

  const householdsData = [
    {
      headName: 'Sujith Damodaran',
      membersCount: 5,
      phone: '+919447100001',
      address: 'House No. 4/128, Estate Lane, Chooralmala',
      location: [76.1412, 11.5392],
      language: 'ml',
      vulnerable: true,
      vulnerableNotes: '82-year-old grandmother requires stretcher assistance; 1 infant',
      assignedCampId: campMeppadiSchool._id,
      primaryRouteId: routePrimaryChooralmala._id,
      alternateRouteId: routeAltChooralmala._id
    },
    {
      headName: 'Mariamma Joseph',
      membersCount: 4,
      phone: '+919447100002',
      address: 'Near Old Church, Chooralmala Junction',
      location: [76.1395, 11.5410],
      language: 'en',
      vulnerable: false,
      vulnerableNotes: '',
      assignedCampId: campMeppadiSchool._id,
      primaryRouteId: routePrimaryChooralmala._id,
      alternateRouteId: routeAltChooralmala._id
    },
    {
      headName: 'Abdul Rasheed K.',
      membersCount: 6,
      phone: '+919447100003',
      address: 'Plantation Quarter 12B, Mundakkai Road',
      location: [76.1460, 11.5340],
      language: 'ml',
      vulnerable: true,
      vulnerableNotes: 'Dialysis patient, requires power-backed medical center',
      assignedCampId: campMeppadiSchool._id,
      primaryRouteId: routePrimaryChooralmala._id,
      alternateRouteId: routeAltChooralmala._id
    },
    {
      headName: 'Radha Krishnan',
      membersCount: 3,
      phone: '+919447100004',
      address: 'Hilltop Cottage, Vythiri Downstream',
      location: [76.0320, 11.5480],
      language: 'ml',
      vulnerable: false,
      vulnerableNotes: '',
      assignedCampId: campVythiri._id,
      zoneId: zoneVythiri._id
    }
  ];

  for (const hData of householdsData) {
    const rawToken = generateSecureToken(32); // 64 hex characters
    const tokenHash = hashToken(rawToken);

    const household = await Household.create({
      regionId: wayanadRegion._id,
      zoneId: hData.zoneId || zoneChooralmala._id,
      headName: hData.headName,
      membersCount: hData.membersCount,
      phone: hData.phone,
      phoneMasked: maskPhone(hData.phone),
      phoneEncrypted: encryptString(hData.phone),
      address: hData.address,
      location: {
        type: 'Point',
        coordinates: hData.location
      },
      language: hData.language,
      vulnerable: hData.vulnerable,
      vulnerableNotes: hData.vulnerableNotes,
      assignedCampId: hData.assignedCampId,
      primaryRouteId: hData.primaryRouteId,
      alternateRouteId: hData.alternateRouteId,
      tokenHash,
      tokenRevoked: false
    });

    demoHouseholdTokens.push({
      id: household._id,
      name: household.headName,
      phone: household.phone,
      vulnerable: household.vulnerable,
      rawToken,
      url: `/h/${rawToken}`
    });
  }

  logger.info(`✅ ${demoHouseholdTokens.length} sample households created with secure tokens`);

  // 10. Create Volunteer and Warden
  const wardenRawToken = generateSecureToken(32);
  const warden = await Volunteer.create({
    name: 'Manoj K.P.',
    phone: '+919447200001',
    role: 'WARDEN',
    regionId: wayanadRegion._id,
    assignedZoneId: zoneChooralmala._id,
    assignedRouteId: routePrimaryChooralmala._id,
    tokenHash: hashToken(wardenRawToken),
    active: true
  });

  const volunteerRawToken = generateSecureToken(32);
  const volunteer = await Volunteer.create({
    name: 'Ananya Thomas',
    phone: '+919447200002',
    role: 'VOLUNTEER',
    regionId: wayanadRegion._id,
    assignedZoneId: zoneChooralmala._id,
    tokenHash: hashToken(volunteerRawToken),
    active: true
  });

  logger.info('✅ Volunteer and Warden created with tokens');

  // Summary output
  console.log('\n===============================================================');
  console.log('🎉 AEGISFLOW DATABASE SEEDING COMPLETED SUCCESSFULLY!');
  console.log('===============================================================');
  console.log('🔑 SUPERADMIN CREDENTIALS:');
  console.log('   Email:    superadmin@aegisflow.gov.in');
  console.log('   Password: SuperAdmin@123!');
  console.log('   Role:     SUPERADMIN (Platform Owner)');
  console.log('---------------------------------------------------------------');
  console.log('🔑 REGIONAL ADMIN CREDENTIALS (WAYANAD):');
  console.log('   Email:    admin.wayanad@aegisflow.gov.in');
  console.log('   Password: WayanadAdmin@123!');
  console.log('   Role:     ADMIN (Scoped strictly to Wayanad District)');
  console.log('---------------------------------------------------------------');
  console.log('📱 SAMPLE CITIZEN TOKEN LINKS (/h/:token):');
  demoHouseholdTokens.forEach(h => {
    console.log(`   - ${h.name} (${h.phone}, Vulnerable: ${h.vulnerable ? 'YES' : 'NO'}):`);
    console.log(`     Link: /h/${h.rawToken}`);
  });
  console.log('---------------------------------------------------------------');
  console.log('🦺 VOLUNTEER & WARDEN TOKEN LINKS:');
  console.log(`   - Warden ${warden.name}: /w/${wardenRawToken}`);
  console.log(`   - Volunteer ${volunteer.name}: /v/${volunteerRawToken}`);
  console.log('---------------------------------------------------------------');
  console.log('📡 SAMPLE SENSOR DEVICE KEYS:');
  console.log(`   - ${sensorRain01.deviceId}: ${rawKeyRain01}`);
  console.log(`   - ${sensorSoil01.deviceId}: ${rawKeySoil01}`);
  console.log('===============================================================\n');

  await disconnectDB();
}

if (process.argv[1].endsWith('seed.js')) {
  runSeed().catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
  });
}
