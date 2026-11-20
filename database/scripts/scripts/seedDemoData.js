/**
 * Demo Data Seeder Script
 * 
 * Prepares and inserts realistic fictional DEMO DATA into all 11 MongoDB entities:
 * 1.  Users        (3 records)
 * 2.  Drivers      (2 records)
 * 3.  Buses        (2 records)
 * 4.  Routes       (2 records)
 * 5.  Stops        (6 records)
 * 6.  Trips        (4 records)
 * 7.  GPSLocations (8 records)
 * 8.  Timetables   (12 records)
 * 9.  Breakdowns   (1 record)
 * 10. Notifications (3 records)
 * 11. Feedback     (3 records)
 * 
 * STRICT CONSTRAINTS:
 * - Uses Mongoose models and schema-compatible values.
 * - Follows all enums, validations, and ObjectId relationships.
 * - Uses stable DEMO identifiers and idempotent upserts.
 * - Does not delete or overwrite any existing GTFS or application data.
 * - Clearly distinguishable DEMO data.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment configuration
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

// Import all 11 Mongoose models
const User = require('../src/models/User');
const Driver = require('../src/models/Driver');
const Bus = require('../src/models/Bus');
const Route = require('../src/models/Route');
const Stop = require('../src/models/Stop');
const Trip = require('../src/models/Trip');
const GPSLocation = require('../src/models/GPSLocation');
const Timetable = require('../src/models/Timetable');
const Breakdown = require('../src/models/Breakdown');
const Notification = require('../src/models/Notification');
const Feedback = require('../src/models/Feedback');

/**
 * Generates a SHA-256 password hash.
 */
const hashPassword = (plainPassword) => {
  return crypto.createHash('sha256').update(plainPassword).digest('hex');
};

/**
 * Main seeding function.
 */
const seedDemoData = async () => {
  console.log('====================================================================');
  console.log('     PREPARING & INSERTING DEMO DATA INTO ALL 11 MONGO ENTITIES');
  console.log('====================================================================\n');

  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/government_bus_tracking';
  console.log(`[INFO] Connecting to MongoDB: ${mongoUri.replace(/\/\/.*@/, '//***@')}`);
  await mongoose.connect(mongoUri);
  console.log(`[INFO] Connected to Database: '${mongoose.connection.name}'\n`);

  const summary = {};

  // --------------------------------------------------------------------------
  // 1. STOPS (6 Records) - Needed before Routes
  // --------------------------------------------------------------------------
  console.log('[STEP 1/11] Seeding Stops (6 Demo Records)...');
  const demoStops = [
    {
      stopCode: 'DEMO-STOP-001',
      stopName: 'Solapur Central Demo Stop',
      stopNameDevanagari: 'सोलापूर मध्यवर्ती डेमो बस स्थानक',
      city: 'Solapur',
      latitude: 17.6599,
      longitude: 75.9064
    },
    {
      stopCode: 'DEMO-STOP-002',
      stopName: 'Tembhurni Demo Stop',
      stopNameDevanagari: 'टेंभुर्णी डेमो बस स्थानक',
      city: 'Tembhurni',
      latitude: 18.0645,
      longitude: 75.1837
    },
    {
      stopCode: 'DEMO-STOP-003',
      stopName: 'Pune Swargate Demo Stop',
      stopNameDevanagari: 'पुणे स्वारगेट डेमो बस स्थानक',
      city: 'Pune',
      latitude: 18.5018,
      longitude: 73.8586
    },
    {
      stopCode: 'DEMO-STOP-004',
      stopName: 'Pune Swargate Return Demo Stop',
      stopNameDevanagari: 'पुणे स्वारगेट परतीचे डेमो स्थानक',
      city: 'Pune',
      latitude: 18.5025,
      longitude: 73.8590
    },
    {
      stopCode: 'DEMO-STOP-005',
      stopName: 'Indapur Demo Stop',
      stopNameDevanagari: 'इंदापूर डेमो बस स्थानक',
      city: 'Indapur',
      latitude: 18.1147,
      longitude: 75.0253
    },
    {
      stopCode: 'DEMO-STOP-006',
      stopName: 'Solapur Central Return Demo Stop',
      stopNameDevanagari: 'सोलापूर मध्यवर्ती परतीचे डेमो स्थानक',
      city: 'Solapur',
      latitude: 17.6605,
      longitude: 75.9070
    }
  ];

  const stopMap = new Map();
  for (const s of demoStops) {
    const doc = await Stop.findOneAndUpdate(
      { stopCode: s.stopCode },
      { $set: s },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );
    stopMap.set(s.stopCode, doc._id);
  }
  summary.Stops = demoStops.length;
  console.log(` -> ${summary.Stops} Stops upserted successfully.`);

  // --------------------------------------------------------------------------
  // 2. ROUTES (2 Records) - Needed before Buses
  // --------------------------------------------------------------------------
  console.log('[STEP 2/11] Seeding Routes (2 Demo Records)...');
  const demoRoutes = [
    {
      routeCode: 'DEMO-SOL-PUN-001',
      routeName: 'Solapur to Pune Demo Corridor',
      source: 'Solapur',
      destination: 'Pune',
      stops: [
        { stop: stopMap.get('DEMO-STOP-001'), sequence: 1 },
        { stop: stopMap.get('DEMO-STOP-002'), sequence: 2 },
        { stop: stopMap.get('DEMO-STOP-003'), sequence: 3 }
      ],
      isActive: true
    },
    {
      routeCode: 'DEMO-PUN-SOL-002',
      routeName: 'Pune to Solapur Demo Corridor',
      source: 'Pune',
      destination: 'Solapur',
      stops: [
        { stop: stopMap.get('DEMO-STOP-004'), sequence: 1 },
        { stop: stopMap.get('DEMO-STOP-005'), sequence: 2 },
        { stop: stopMap.get('DEMO-STOP-006'), sequence: 3 }
      ],
      isActive: true
    }
  ];

  const routeMap = new Map();
  for (const r of demoRoutes) {
    const doc = await Route.findOneAndUpdate(
      { routeCode: r.routeCode },
      { $set: r },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );
    routeMap.set(r.routeCode, doc._id);
  }
  summary.Routes = demoRoutes.length;
  console.log(` -> ${summary.Routes} Routes upserted successfully.`);

  // --------------------------------------------------------------------------
  // 3. BUSES (2 Records) - Needed before Drivers & Trips
  // --------------------------------------------------------------------------
  console.log('[STEP 3/11] Seeding Buses (2 Demo Records)...');
  const demoBuses = [
    {
      busNumber: 'DEMO-SOL-001',
      busType: 'Ordinary Express',
      registrationNumber: 'MH-13-AZ-1001',
      status: 'active',
      route: routeMap.get('DEMO-SOL-PUN-001')
    },
    {
      busNumber: 'DEMO-PUN-002',
      busType: 'Shivshahi (AC)',
      registrationNumber: 'MH-12-QW-2002',
      status: 'active',
      route: routeMap.get('DEMO-PUN-SOL-002')
    }
  ];

  const busMap = new Map();
  for (const b of demoBuses) {
    const doc = await Bus.findOneAndUpdate(
      { busNumber: b.busNumber },
      { $set: b },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );
    busMap.set(b.busNumber, doc._id);
  }
  summary.Buses = demoBuses.length;
  console.log(` -> ${summary.Buses} Buses upserted successfully.`);

  // --------------------------------------------------------------------------
  // 4. DRIVERS (2 Records) - References Buses
  // --------------------------------------------------------------------------
  console.log('[STEP 4/11] Seeding Drivers (2 Demo Records)...');
  const demoDrivers = [
    {
      name: 'Vijay Jadhav',
      email: 'vijay.jadhav.demo@example.test',
      phone: '+91-9811122233',
      licenseNumber: 'DEMO-LIC-001',
      assignedBus: busMap.get('DEMO-SOL-001'),
      isActive: true
    },
    {
      name: 'Imran Khan',
      email: 'imran.khan.demo@example.test',
      phone: '+91-9822233344',
      licenseNumber: 'DEMO-LIC-002',
      assignedBus: busMap.get('DEMO-PUN-002'),
      isActive: true
    }
  ];

  const driverMap = new Map();
  for (const d of demoDrivers) {
    const doc = await Driver.findOneAndUpdate(
      { licenseNumber: d.licenseNumber },
      { $set: d },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );
    driverMap.set(d.licenseNumber, doc._id);
  }
  summary.Drivers = demoDrivers.length;
  console.log(` -> ${summary.Drivers} Drivers upserted successfully.`);

  // --------------------------------------------------------------------------
  // 5. USERS (3 Records)
  // --------------------------------------------------------------------------
  console.log('[STEP 5/11] Seeding Users (3 Demo Records)...');
  const demoUsers = [
    {
      name: 'Aarav Patil',
      email: 'aarav.demo@example.test',
      passwordHash: hashPassword('DemoPassword123!'),
      phone: '+91-9876543210',
      role: 'passenger',
      isActive: true
    },
    {
      name: 'Sana Shaikh',
      email: 'sana.demo@example.test',
      passwordHash: hashPassword('DemoPassword123!'),
      phone: '+91-9876543211',
      role: 'passenger',
      isActive: true
    },
    {
      name: 'Admin Demo',
      email: 'admin.demo@example.test',
      passwordHash: hashPassword('AdminSecurePass456!'),
      phone: '+91-9876543212',
      role: 'admin',
      isActive: true
    }
  ];

  const userMap = new Map();
  for (const u of demoUsers) {
    const doc = await User.findOneAndUpdate(
      { email: u.email },
      { $set: u },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );
    userMap.set(u.email, doc._id);
  }
  summary.Users = demoUsers.length;
  console.log(` -> ${summary.Users} Users upserted successfully.`);

  // --------------------------------------------------------------------------
  // 6. TRIPS (4 Records) - References Route and Bus
  // --------------------------------------------------------------------------
  console.log('[STEP 6/11] Seeding Trips (4 Demo Records)...');
  const demoTrips = [
    {
      tripId: 'DEMO-TRIP-001',
      route: routeMap.get('DEMO-SOL-PUN-001'),
      bus: busMap.get('DEMO-SOL-001'),
      departureTime: '06:30:00',
      status: 'scheduled',
      serviceDate: new Date()
    },
    {
      tripId: 'DEMO-TRIP-002',
      route: routeMap.get('DEMO-SOL-PUN-001'),
      bus: busMap.get('DEMO-SOL-001'),
      departureTime: '09:00:00',
      status: 'in-transit',
      serviceDate: new Date()
    },
    {
      tripId: 'DEMO-TRIP-003',
      route: routeMap.get('DEMO-PUN-SOL-002'),
      bus: busMap.get('DEMO-PUN-002'),
      departureTime: '07:15:00',
      status: 'completed',
      serviceDate: new Date()
    },
    {
      tripId: 'DEMO-TRIP-004',
      route: routeMap.get('DEMO-PUN-SOL-002'),
      bus: busMap.get('DEMO-PUN-002'),
      departureTime: '16:00:00',
      status: 'scheduled',
      serviceDate: new Date()
    }
  ];

  const tripMap = new Map();
  for (const t of demoTrips) {
    const doc = await Trip.findOneAndUpdate(
      { tripId: t.tripId },
      { $set: t },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );
    tripMap.set(t.tripId, doc._id);
  }
  summary.Trips = demoTrips.length;
  console.log(` -> ${summary.Trips} Trips upserted successfully.`);

  // --------------------------------------------------------------------------
  // 7. TIMETABLES (12 Records) - 3 for each of the 4 trips
  // --------------------------------------------------------------------------
  console.log('[STEP 7/11] Seeding Timetables (12 Demo Records)...');
  const demoTimetables = [
    // TRIP-001 (Solapur -> Tembhurni -> Pune)
    {
      trip: tripMap.get('DEMO-TRIP-001'),
      route: routeMap.get('DEMO-SOL-PUN-001'),
      stop: stopMap.get('DEMO-STOP-001'),
      stopSequence: 1,
      arrivalTime: null,
      departureTime: '06:30:00'
    },
    {
      trip: tripMap.get('DEMO-TRIP-001'),
      route: routeMap.get('DEMO-SOL-PUN-001'),
      stop: stopMap.get('DEMO-STOP-002'),
      stopSequence: 2,
      arrivalTime: '09:00:00',
      departureTime: '09:05:00'
    },
    {
      trip: tripMap.get('DEMO-TRIP-001'),
      route: routeMap.get('DEMO-SOL-PUN-001'),
      stop: stopMap.get('DEMO-STOP-003'),
      stopSequence: 3,
      arrivalTime: '11:30:00',
      departureTime: null
    },

    // TRIP-002 (Solapur -> Tembhurni -> Pune)
    {
      trip: tripMap.get('DEMO-TRIP-002'),
      route: routeMap.get('DEMO-SOL-PUN-001'),
      stop: stopMap.get('DEMO-STOP-001'),
      stopSequence: 1,
      arrivalTime: null,
      departureTime: '09:00:00'
    },
    {
      trip: tripMap.get('DEMO-TRIP-002'),
      route: routeMap.get('DEMO-SOL-PUN-001'),
      stop: stopMap.get('DEMO-STOP-002'),
      stopSequence: 2,
      arrivalTime: '11:30:00',
      departureTime: '11:35:00'
    },
    {
      trip: tripMap.get('DEMO-TRIP-002'),
      route: routeMap.get('DEMO-SOL-PUN-001'),
      stop: stopMap.get('DEMO-STOP-003'),
      stopSequence: 3,
      arrivalTime: '14:00:00',
      departureTime: null
    },

    // TRIP-003 (Pune -> Indapur -> Solapur)
    {
      trip: tripMap.get('DEMO-TRIP-003'),
      route: routeMap.get('DEMO-PUN-SOL-002'),
      stop: stopMap.get('DEMO-STOP-004'),
      stopSequence: 1,
      arrivalTime: null,
      departureTime: '07:15:00'
    },
    {
      trip: tripMap.get('DEMO-TRIP-003'),
      route: routeMap.get('DEMO-PUN-SOL-002'),
      stop: stopMap.get('DEMO-STOP-005'),
      stopSequence: 2,
      arrivalTime: '09:45:00',
      departureTime: '09:50:00'
    },
    {
      trip: tripMap.get('DEMO-TRIP-003'),
      route: routeMap.get('DEMO-PUN-SOL-002'),
      stop: stopMap.get('DEMO-STOP-006'),
      stopSequence: 3,
      arrivalTime: '12:15:00',
      departureTime: null
    },

    // TRIP-004 (Pune -> Indapur -> Solapur)
    {
      trip: tripMap.get('DEMO-TRIP-004'),
      route: routeMap.get('DEMO-PUN-SOL-002'),
      stop: stopMap.get('DEMO-STOP-004'),
      stopSequence: 1,
      arrivalTime: null,
      departureTime: '16:00:00'
    },
    {
      trip: tripMap.get('DEMO-TRIP-004'),
      route: routeMap.get('DEMO-PUN-SOL-002'),
      stop: stopMap.get('DEMO-STOP-005'),
      stopSequence: 2,
      arrivalTime: '18:30:00',
      departureTime: '18:35:00'
    },
    {
      trip: tripMap.get('DEMO-TRIP-004'),
      route: routeMap.get('DEMO-PUN-SOL-002'),
      stop: stopMap.get('DEMO-STOP-006'),
      stopSequence: 3,
      arrivalTime: '21:00:00',
      departureTime: null
    }
  ];

  for (const tt of demoTimetables) {
    await Timetable.findOneAndUpdate(
      { trip: tt.trip, stopSequence: tt.stopSequence },
      { $set: tt },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );
  }
  summary.Timetables = demoTimetables.length;
  console.log(` -> ${summary.Timetables} Timetable entries upserted successfully.`);

  // --------------------------------------------------------------------------
  // 8. GPS LOCATIONS (8 Records) - 4 for each direction
  // --------------------------------------------------------------------------
  console.log('[STEP 8/11] Seeding GPS Locations (8 Demo Records)...');
  const now = new Date();
  const demoGps = [
    // Solapur to Pune (Trip 002, Bus DEMO-SOL-001)
    {
      trip: tripMap.get('DEMO-TRIP-002'),
      bus: busMap.get('DEMO-SOL-001'),
      latitude: 17.6599,
      longitude: 75.9064,
      isSimulated: true,
      timestamp: new Date(now.getTime() - 30 * 60 * 1000)
    },
    {
      trip: tripMap.get('DEMO-TRIP-002'),
      bus: busMap.get('DEMO-SOL-001'),
      latitude: 17.8180,
      longitude: 75.6420,
      isSimulated: true,
      timestamp: new Date(now.getTime() - 20 * 60 * 1000)
    },
    {
      trip: tripMap.get('DEMO-TRIP-002'),
      bus: busMap.get('DEMO-SOL-001'),
      latitude: 18.0645,
      longitude: 75.1837,
      isSimulated: true,
      timestamp: new Date(now.getTime() - 10 * 60 * 1000)
    },
    {
      trip: tripMap.get('DEMO-TRIP-002'),
      bus: busMap.get('DEMO-SOL-001'),
      latitude: 18.5018,
      longitude: 73.8586,
      isSimulated: true,
      timestamp: now
    },

    // Pune to Solapur (Trip 003, Bus DEMO-PUN-002)
    {
      trip: tripMap.get('DEMO-TRIP-003'),
      bus: busMap.get('DEMO-PUN-002'),
      latitude: 18.5025,
      longitude: 73.8590,
      isSimulated: true,
      timestamp: new Date(now.getTime() - 40 * 60 * 1000)
    },
    {
      trip: tripMap.get('DEMO-TRIP-003'),
      bus: busMap.get('DEMO-PUN-002'),
      latitude: 18.2980,
      longitude: 74.7550,
      isSimulated: true,
      timestamp: new Date(now.getTime() - 30 * 60 * 1000)
    },
    {
      trip: tripMap.get('DEMO-TRIP-003'),
      bus: busMap.get('DEMO-PUN-002'),
      latitude: 18.1147,
      longitude: 75.0253,
      isSimulated: true,
      timestamp: new Date(now.getTime() - 15 * 60 * 1000)
    },
    {
      trip: tripMap.get('DEMO-TRIP-003'),
      bus: busMap.get('DEMO-PUN-002'),
      latitude: 17.6605,
      longitude: 75.9070,
      isSimulated: true,
      timestamp: now
    }
  ];

  for (const g of demoGps) {
    await GPSLocation.findOneAndUpdate(
      { trip: g.trip, bus: g.bus, latitude: g.latitude, longitude: g.longitude },
      { $set: g },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );
  }
  summary.GPSLocations = demoGps.length;
  console.log(` -> ${summary.GPSLocations} GPS Locations upserted successfully.`);

  // --------------------------------------------------------------------------
  // 9. BREAKDOWNS (1 Record)
  // --------------------------------------------------------------------------
  console.log('[STEP 9/11] Seeding Breakdowns (1 Demo Record)...');
  const demoBreakdown = {
    bus: busMap.get('DEMO-SOL-001'),
    driver: driverMap.get('DEMO-LIC-001'),
    trip: tripMap.get('DEMO-TRIP-002'),
    location: {
      latitude: 18.0645,
      longitude: 75.1837,
      address: 'Near Tembhurni Bus Station, NH 65'
    },
    description: 'Demo engine temperature warning',
    reportedAt: new Date(now.getTime() - 15 * 60 * 1000),
    status: 'reported'
  };

  await Breakdown.findOneAndUpdate(
    { bus: demoBreakdown.bus, trip: demoBreakdown.trip, description: demoBreakdown.description },
    { $set: demoBreakdown },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
  );
  summary.Breakdowns = 1;
  console.log(` -> ${summary.Breakdowns} Breakdown record upserted successfully.`);

  // --------------------------------------------------------------------------
  // 10. NOTIFICATIONS (3 Records)
  // --------------------------------------------------------------------------
  console.log('[STEP 10/11] Seeding Notifications (3 Demo Records)...');
  const demoNotifications = [
    {
      user: userMap.get('aarav.demo@example.test'),
      title: 'Demo Trip Reminder: Solapur to Pune',
      message: 'Your bus DEMO-SOL-001 on Trip DEMO-TRIP-001 is scheduled to depart at 06:30 AM.',
      type: 'info',
      isRead: false,
      createdAt: new Date(now.getTime() - 120 * 60 * 1000)
    },
    {
      user: userMap.get('sana.demo@example.test'),
      title: 'Demo Route Update: Pune to Solapur',
      message: 'Minor traffic delay of 10 minutes reported near Indapur on Route DEMO-PUN-SOL-002.',
      type: 'alert',
      isRead: false,
      createdAt: new Date(now.getTime() - 60 * 60 * 1000)
    },
    {
      user: userMap.get('aarav.demo@example.test'),
      title: 'Demo Feedback Request',
      message: 'Thank you for traveling on DEMO-TRIP-001. Please rate your journey experience.',
      type: 'general',
      isRead: true,
      createdAt: new Date(now.getTime() - 30 * 60 * 1000)
    }
  ];

  for (const n of demoNotifications) {
    await Notification.findOneAndUpdate(
      { user: n.user, title: n.title },
      { $set: n },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );
  }
  summary.Notifications = demoNotifications.length;
  console.log(` -> ${summary.Notifications} Notifications upserted successfully.`);

  // --------------------------------------------------------------------------
  // 11. FEEDBACK (3 Records)
  // --------------------------------------------------------------------------
  console.log('[STEP 11/11] Seeding Feedback (3 Demo Records)...');
  const demoFeedback = [
    {
      user: userMap.get('aarav.demo@example.test'),
      bus: busMap.get('DEMO-SOL-001'),
      trip: tripMap.get('DEMO-TRIP-001'),
      rating: 5,
      message: 'Smooth journey and clean bus. Departed and arrived right on schedule.',
      createdAt: new Date(now.getTime() - 50 * 60 * 1000)
    },
    {
      user: userMap.get('sana.demo@example.test'),
      bus: busMap.get('DEMO-PUN-002'),
      trip: tripMap.get('DEMO-TRIP-003'),
      rating: 4,
      message: 'Comfortable seats and clean AC compartment. Slight delay near Indapur.',
      createdAt: new Date(now.getTime() - 40 * 60 * 1000)
    },
    {
      user: userMap.get('aarav.demo@example.test'),
      bus: busMap.get('DEMO-SOL-001'),
      trip: tripMap.get('DEMO-TRIP-002'),
      rating: 4,
      message: 'Minor temperature check halt at Tembhurni, but driver was skilled and polite.',
      createdAt: new Date(now.getTime() - 20 * 60 * 1000)
    }
  ];

  for (const fb of demoFeedback) {
    await Feedback.findOneAndUpdate(
      { user: fb.user, trip: fb.trip, message: fb.message },
      { $set: fb },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );
  }
  summary.Feedback = demoFeedback.length;
  console.log(` -> ${summary.Feedback} Feedback records upserted successfully.`);

  console.log('\n====================================================================');
  console.log('              DEMO DATA SEEDING SUMMARY (ALL 11 ENTITIES)');
  console.log('====================================================================');
  for (const [entity, count] of Object.entries(summary)) {
    console.log(` • ${entity.padEnd(15)}: ${count} records inserted / verified`);
  }
  console.log('====================================================================\n');

  await mongoose.disconnect();
  console.log('[INFO] Disconnected from MongoDB cleanly.');
  return summary;
};

// Execute if run directly from CLI
if (require.main === module) {
  seedDemoData()
    .then(() => {
      console.log('[SUCCESS] All 11 entities seeded with demo data.');
      process.exit(0);
    })
    .catch(err => {
      console.error('[FATAL ERROR] Seeding failed:', err);
      mongoose.disconnect().finally(() => process.exit(1));
    });
}

module.exports = seedDemoData;
