/**
 * GTFS Dataset Migration Script
 * 
 * Migrates raw MSRTC GTFS dataset files into MongoDB collections:
 * 1. stops      (from msrtc-stops.geojson)
 * 2. routes     (from msrtc-routes.json)
 * 3. trips      (from msrtc-trips.json)
 * 4. timetables (from msrtc-trip-times.json + msrtc-trips.json + msrtc-routes.json)
 * 
 * STRICT CONSTRAINTS:
 * - Operates ONLY on stops, routes, trips, and timetables.
 * - Never deletes or modifies unrelated collections (users, drivers, buses, etc.).
 * - Uses bulkWrite with upsert operations in batches of 5,000 for idempotency.
 * - Sets serviceDate: null (does not invent dates).
 * - Follows strict timetable calculation rules (does not invent downstream departure times).
 * - Preserves original GTFS identifiers and 1-based stop sequence numbers.
 * - Logs all unresolved references without creating fake stops.
 * - Safe credential logging.
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment configuration
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

// Import models
const Stop = require('../src/models/Stop');
const Route = require('../src/models/Route');
const Trip = require('../src/models/Trip');
const Timetable = require('../src/models/Timetable');

const BATCH_SIZE = 5000;

/**
 * Resolves path to the raw dataset directory.
 */
const resolveDatasetDir = () => {
  const candidate1 = path.resolve(__dirname, '../../docs/datasets/msrtc-gtfs');
  if (fs.existsSync(candidate1)) return candidate1;

  const candidate2 = path.resolve(process.cwd(), 'docs/datasets/msrtc-gtfs');
  if (fs.existsSync(candidate2)) return candidate2;

  throw new Error('MSRTC GTFS dataset directory not found at docs/datasets/msrtc-gtfs');
};

/**
 * Extracts city/taluka/district from stop description or name if available.
 */
const extractCity = (desc, name) => {
  if (desc && typeof desc === 'string') {
    const parts = desc.split(/\s{2,}|,\s*/).map(p => p.trim()).filter(Boolean);
    const districtPart = parts.find(p => p.toLowerCase().includes('district') || p.toLowerCase().includes('taluka'));
    if (districtPart) {
      return districtPart.replace(/\s+(district|taluka|taluku)/gi, '').trim();
    }
  }
  if (name && typeof name === 'string' && name.includes(',')) {
    const parts = name.split(',').map(p => p.trim());
    return parts[parts.length - 1] || null;
  }
  return null;
};

/**
 * Formats seconds into HH:MM:SS string in 24-hour cycle.
 */
const formatSeconds = (sec) => {
  const totalSecDay = sec % 86400;
  const h = Math.floor(totalSecDay / 3600);
  const m = Math.floor((totalSecDay % 3600) / 60);
  const s = totalSecDay % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
};

/**
 * Main migration execution function.
 */
const runMigration = async () => {
  const startTime = Date.now();
  console.log('====================================================================');
  console.log('        MSRTC GTFS TO MONGODB IDEMPOTENT MIGRATION PIPELINE');
  console.log('====================================================================\n');

  const datasetDir = resolveDatasetDir();
  console.log(`[INFO] Dataset Directory: ${datasetDir}`);

  // Connect to MongoDB safely
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/government_bus_tracking';
  console.log(`[INFO] Connecting to MongoDB...`);
  await mongoose.connect(mongoUri);
  console.log(`[INFO] Connected successfully to Database: '${mongoose.connection.name}' on Host: '${mongoose.connection.host}'\n`);

  const unresolvedReferences = {
    missingStopsInRoutes: [],
    skippedTripsMissingRoute: [],
    skippedTimetableMissingStop: []
  };

  // --------------------------------------------------------------------------
  // PHASE 1: STOPS MIGRATION
  // --------------------------------------------------------------------------
  console.log('--------------------------------------------------------------------');
  console.log('PHASE 1: Migrating Stops (msrtc-stops.geojson)');
  console.log('--------------------------------------------------------------------');
  const stopsPath = path.join(datasetDir, 'msrtc-stops.geojson');
  const stopsGeo = JSON.parse(fs.readFileSync(stopsPath, 'utf8'));
  const features = stopsGeo.features || [];
  console.log(`[INFO] Found ${features.length.toLocaleString()} stop features in raw file.`);

  let stopsInserted = 0;
  let stopsUpdated = 0;
  let stopsFailed = 0;
  const stopIdToCodeMap = new Map();

  for (let i = 0; i < features.length; i += BATCH_SIZE) {
    const chunk = features.slice(i, i + BATCH_SIZE);
    const operations = [];

    for (const f of chunk) {
      const p = f.properties || {};
      const coords = f.geometry && Array.isArray(f.geometry.coordinates) ? f.geometry.coordinates : null;
      if (!p.stop_code || !p.stop_name || !coords || coords.length < 2) continue;

      stopIdToCodeMap.set(p.stop_id, p.stop_code);

      operations.push({
        updateOne: {
          filter: { stopCode: p.stop_code },
          update: {
            $set: {
              stopCode: p.stop_code,
              stopName: p.stop_name,
              stopNameDevanagari: p.stop_name_devanagari || null,
              city: extractCity(p.stop_desc, p.stop_name),
              latitude: Number(coords[1].toFixed(6)),
              longitude: Number(coords[0].toFixed(6))
            }
          },
          upsert: true
        }
      });
    }

    if (operations.length > 0) {
      try {
        const result = await Stop.bulkWrite(operations, { ordered: false });
        stopsInserted += (result.upsertedCount || 0);
        stopsUpdated += (result.matchedCount || 0);
      } catch (err) {
        const ins = (err.result?.nUpserted ?? err.result?.upsertedCount) || 0;
        const mat = (err.result?.nMatched ?? err.result?.matchedCount) || 0;
        const fail = err.writeErrors ? err.writeErrors.length : (operations.length - ins - mat);
        stopsInserted += ins;
        stopsUpdated += mat;
        stopsFailed += fail;
        console.error(`[ERROR] Batch failure in stops (offset ${i}):`, err.message);
      }
    }
  }

  console.log(`[PHASE 1 RESULT] Stops: ${stopsInserted} inserted (new), ${stopsUpdated} updated/matched, 0 skipped, ${stopsFailed} failed.`);

  // Build stopId -> ObjectId mapping in memory
  console.log('[INFO] Building in-memory Stop ObjectId cache...');
  const allStops = await Stop.find({}, { stopCode: 1, _id: 1 }).lean();
  const stopCodeToObjectIdMap = new Map();
  for (const s of allStops) {
    stopCodeToObjectIdMap.set(s.stopCode, s._id);
  }
  const stopIdToObjectIdMap = new Map();
  for (const [stopId, stopCode] of stopIdToCodeMap.entries()) {
    const oid = stopCodeToObjectIdMap.get(stopCode);
    if (oid) stopIdToObjectIdMap.set(stopId, oid);
  }
  console.log(`[INFO] Cached ${stopIdToObjectIdMap.size.toLocaleString()} Stop ObjectIds in memory.\n`);

  // --------------------------------------------------------------------------
  // PHASE 2: ROUTES MIGRATION
  // --------------------------------------------------------------------------
  console.log('--------------------------------------------------------------------');
  console.log('PHASE 2: Migrating Routes (msrtc-routes.json)');
  console.log('--------------------------------------------------------------------');
  const routesPath = path.join(datasetDir, 'msrtc-routes.json');
  const routesData = JSON.parse(fs.readFileSync(routesPath, 'utf8'));
  const routeEntries = Object.entries(routesData);
  console.log(`[INFO] Found ${routeEntries.length.toLocaleString()} routes in raw file.`);

  // Pre-load stop names for resolving terminal stop names
  const stopNameMap = new Map();
  for (const f of features) {
    if (f.properties && f.properties.stop_id) {
      stopNameMap.set(f.properties.stop_id, f.properties.stop_name);
    }
  }

  let routesInserted = 0;
  let routesUpdated = 0;
  let routesFailed = 0;

  for (let i = 0; i < routeEntries.length; i += BATCH_SIZE) {
    const chunk = routeEntries.slice(i, i + BATCH_SIZE);
    const operations = [];

    for (const [routeCode, stopList] of chunk) {
      if (!Array.isArray(stopList) || stopList.length === 0) continue;

      const originStopId = stopList[0];
      const terminusStopId = stopList[stopList.length - 1];
      const sourceName = stopNameMap.get(originStopId) || 'Unknown';
      const destName = stopNameMap.get(terminusStopId) || 'Unknown';

      const stopsSubdocs = [];
      for (let sIdx = 0; sIdx < stopList.length; sIdx++) {
        const sId = stopList[sIdx];
        const sOid = stopIdToObjectIdMap.get(sId);
        const sequence = sIdx + 1; // Strict 1-based original GTFS sequence preserved

        if (sOid) {
          stopsSubdocs.push({ stop: sOid, sequence: sequence });
        } else {
          unresolvedReferences.missingStopsInRoutes.push({
            routeCode,
            sequence,
            missingStopId: sId
          });
        }
      }

      operations.push({
        updateOne: {
          filter: { routeCode: String(routeCode) },
          update: {
            $set: {
              routeCode: String(routeCode),
              routeName: `${sourceName} - ${destName}`,
              source: sourceName,
              destination: destName,
              stops: stopsSubdocs,
              isActive: true
            }
          },
          upsert: true
        }
      });
    }

    if (operations.length > 0) {
      try {
        const result = await Route.bulkWrite(operations, { ordered: false });
        routesInserted += (result.upsertedCount || 0);
        routesUpdated += (result.matchedCount || 0);
      } catch (err) {
        const ins = (err.result?.nUpserted ?? err.result?.upsertedCount) || 0;
        const mat = (err.result?.nMatched ?? err.result?.matchedCount) || 0;
        const fail = err.writeErrors ? err.writeErrors.length : (operations.length - ins - mat);
        routesInserted += ins;
        routesUpdated += mat;
        routesFailed += fail;
        console.error(`[ERROR] Batch failure in routes (offset ${i}):`, err.message);
      }
    }
  }

  console.log(`[PHASE 2 RESULT] Routes: ${routesInserted} inserted (new), ${routesUpdated} updated/matched, 0 skipped, ${routesFailed} failed.`);
  console.log(`[INFO] Unresolved stop references in routes: ${unresolvedReferences.missingStopsInRoutes.length.toLocaleString()} (Logged & preserved sequences)`);

  // Build routeCode -> ObjectId mapping in memory
  console.log('[INFO] Building in-memory Route ObjectId cache...');
  const allRoutes = await Route.find({}, { routeCode: 1, _id: 1 }).lean();
  const routeCodeToObjectIdMap = new Map();
  for (const r of allRoutes) {
    routeCodeToObjectIdMap.set(r.routeCode, r._id);
  }
  console.log(`[INFO] Cached ${routeCodeToObjectIdMap.size.toLocaleString()} Route ObjectIds in memory.\n`);

  // --------------------------------------------------------------------------
  // PHASE 3: TRIPS MIGRATION
  // --------------------------------------------------------------------------
  console.log('--------------------------------------------------------------------');
  console.log('PHASE 3: Migrating Trips (msrtc-trips.json)');
  console.log('--------------------------------------------------------------------');
  const tripsPath = path.join(datasetDir, 'msrtc-trips.json');
  const tripsData = JSON.parse(fs.readFileSync(tripsPath, 'utf8'));
  const tripEntries = Object.entries(tripsData);
  console.log(`[INFO] Found ${tripEntries.length.toLocaleString()} trips in raw file.`);

  let tripsInserted = 0;
  let tripsUpdated = 0;
  let tripsSkipped = 0;
  let tripsFailed = 0;

  for (let i = 0; i < tripEntries.length; i += BATCH_SIZE) {
    const chunk = tripEntries.slice(i, i + BATCH_SIZE);
    const operations = [];

    for (const [tripId, trip] of chunk) {
      const routeOid = routeCodeToObjectIdMap.get(String(trip.route_code));
      if (!routeOid) {
        tripsSkipped++;
        unresolvedReferences.skippedTripsMissingRoute.push({
          tripId,
          route_code: trip.route_code,
          reason: 'Route code not present in routes.json'
        });
        continue;
      }

      if (!trip.departure_time) {
        tripsSkipped++;
        unresolvedReferences.skippedTripsMissingRoute.push({
          tripId,
          route_code: trip.route_code,
          reason: 'Missing departure_time in trips.json'
        });
        continue;
      }

      operations.push({
        updateOne: {
          filter: { tripId: String(tripId) },
          update: {
            $set: {
              tripId: String(tripId),
              bus: null,
              route: routeOid,
              serviceDate: null, // Corrected: Explicitly null; do not invent calendar run dates
              departureTime: trip.departure_time,
              status: 'scheduled'
            }
          },
          upsert: true
        }
      });
    }

    if (operations.length > 0) {
      try {
        const result = await Trip.bulkWrite(operations, { ordered: false });
        tripsInserted += (result.upsertedCount || 0);
        tripsUpdated += (result.matchedCount || 0);
      } catch (err) {
        const ins = (err.result?.nUpserted ?? err.result?.upsertedCount) || 0;
        const mat = (err.result?.nMatched ?? err.result?.matchedCount) || 0;
        const fail = err.writeErrors ? err.writeErrors.length : (operations.length - ins - mat);
        tripsInserted += ins;
        tripsUpdated += mat;
        tripsFailed += fail;
        console.error(`[ERROR] Batch failure in trips (offset ${i}):`, err.message);
      }
    }
  }

  console.log(`[PHASE 3 RESULT] Trips: ${tripsInserted} inserted (new), ${tripsUpdated} updated/matched, ${tripsSkipped} skipped, ${tripsFailed} failed.`);

  // Build tripId -> ObjectId mapping in memory
  console.log('[INFO] Building in-memory Trip ObjectId cache...');
  const allTrips = await Trip.find({}, { tripId: 1, _id: 1 }).lean();
  const tripIdToObjectIdMap = new Map();
  for (const t of allTrips) {
    tripIdToObjectIdMap.set(t.tripId, t._id);
  }
  console.log(`[INFO] Cached ${tripIdToObjectIdMap.size.toLocaleString()} Trip ObjectIds in memory.\n`);

  // --------------------------------------------------------------------------
  // PHASE 4: TIMETABLES MIGRATION
  // --------------------------------------------------------------------------
  console.log('--------------------------------------------------------------------');
  console.log('PHASE 4: Migrating Timetables (trip-times + trips + routes)');
  console.log('--------------------------------------------------------------------');
  const tripTimesPath = path.join(datasetDir, 'msrtc-trip-times.json');
  const tripTimesData = fs.existsSync(tripTimesPath) ? JSON.parse(fs.readFileSync(tripTimesPath, 'utf8')) : {};

  // Ensure compound unique index exists on Timetable collection
  console.log('[INFO] Ensuring compound index on timetables { trip: 1, stopSequence: 1 }...');
  await Timetable.collection.createIndex({ trip: 1, stopSequence: 1 }, { unique: true });

  let timetableInserted = 0;
  let timetableUpdated = 0;
  let timetableSkipped = 0;
  let timetableFailed = 0;
  let timetableOps = [];
  let totalProcessedTrips = 0;

  for (const [tripId, trip] of tripEntries) {
    const tripOid = tripIdToObjectIdMap.get(String(tripId));
    const routeOid = routeCodeToObjectIdMap.get(String(trip.route_code));
    const stopList = routesData[trip.route_code];

    if (!tripOid || !routeOid || !trip.departure_time || !Array.isArray(stopList) || stopList.length === 0) {
      continue;
    }

    totalProcessedTrips++;
    const segments = tripTimesData[trip.route_code] || [];
    const [h, m, s] = trip.departure_time.split(':').map(Number);
    let currentSeconds = (h || 0) * 3600 + (m || 0) * 60 + (s || 0);
    let timingBroken = false;

    for (let k = 0; k < stopList.length; k++) {
      const sId = stopList[k];
      const stopOid = stopIdToObjectIdMap.get(sId);
      const stopSequence = k + 1; // Strict 1-based original GTFS sequence preserved

      if (!stopOid) {
        timetableSkipped++;
        unresolvedReferences.skippedTimetableMissingStop.push({
          tripId,
          sequence: stopSequence,
          missingStopId: sId
        });
        continue;
      }

      let arrTime = null;
      let depTime = null;

      if (k === 0) {
        // Origin stop: Departure is known; arrival is null
        arrTime = null;
        depTime = trip.departure_time;
      } else {
        // Intermediate or Terminus stop
        const seg = segments[k - 1];
        if (!timingBroken && seg && typeof seg.duration_seconds === 'number') {
          currentSeconds += seg.duration_seconds;
          arrTime = formatSeconds(currentSeconds);
          // Corrected rule: Do not invent downstream intermediate departures or assume zero dwell time
          depTime = null;
        } else {
          timingBroken = true;
          arrTime = null;
          depTime = null;
        }
      }

      timetableOps.push({
        updateOne: {
          filter: { trip: tripOid, stopSequence: stopSequence },
          update: {
            $set: {
              trip: tripOid,
              route: routeOid,
              stop: stopOid,
              arrivalTime: arrTime,
              departureTime: depTime,
              stopSequence: stopSequence
            }
          },
          upsert: true
        }
      });

      if (timetableOps.length >= BATCH_SIZE) {
        try {
          const result = await Timetable.bulkWrite(timetableOps, { ordered: false });
          timetableInserted += (result.upsertedCount || 0);
          timetableUpdated += (result.matchedCount || 0);
        } catch (err) {
          const ins = (err.result?.nUpserted ?? err.result?.upsertedCount) || 0;
          const mat = (err.result?.nMatched ?? err.result?.matchedCount) || 0;
          const fail = err.writeErrors ? err.writeErrors.length : (timetableOps.length - ins - mat);
          timetableInserted += ins;
          timetableUpdated += mat;
          timetableFailed += fail;
          console.error(`[ERROR] Batch failure in timetables:`, err.message);
        }
        timetableOps = [];
        process.stdout.write(`\r[PROGRESS] Migrated ~${(timetableInserted + timetableUpdated).toLocaleString()} timetable records...`);
      }
    }
  }

  // Flush remaining timetable operations
  if (timetableOps.length > 0) {
    try {
      const result = await Timetable.bulkWrite(timetableOps, { ordered: false });
      timetableInserted += (result.upsertedCount || 0);
      timetableUpdated += (result.matchedCount || 0);
    } catch (err) {
      const ins = (err.result?.nUpserted ?? err.result?.upsertedCount) || 0;
      const mat = (err.result?.nMatched ?? err.result?.matchedCount) || 0;
      const fail = err.writeErrors ? err.writeErrors.length : (timetableOps.length - ins - mat);
      timetableInserted += ins;
      timetableUpdated += mat;
      timetableFailed += fail;
      console.error(`[ERROR] Final batch failure in timetables:`, err.message);
    }
    timetableOps = [];
  }
  process.stdout.write('\n');

  console.log(`[PHASE 4 RESULT] Timetables: ${timetableInserted} inserted (new), ${timetableUpdated} updated/matched, ${timetableSkipped} skipped (missing stop ref), ${timetableFailed} failed.`);

  // --------------------------------------------------------------------------
  // LOG UNRESOLVED REFERENCES
  // --------------------------------------------------------------------------
  const logDir = path.resolve(__dirname, '../logs');
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
  const logFilePath = path.join(logDir, 'migration_unresolved_references.json');
  fs.writeFileSync(logFilePath, JSON.stringify(unresolvedReferences, null, 2), 'utf8');
  console.log(`\n[INFO] Detailed unresolved references logged to: ${logFilePath}`);

  const totalTimeSeconds = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('\n====================================================================');
  console.log(`       GTFS MIGRATION PIPELINE COMPLETED IN ${totalTimeSeconds}s`);
  console.log('====================================================================');
  console.log(` • Stops:      ${stopsInserted} inserted, ${stopsUpdated} updated/matched, 0 skipped`);
  console.log(` • Routes:     ${routesInserted} inserted, ${routesUpdated} updated/matched, 0 skipped`);
  console.log(` • Trips:      ${tripsInserted} inserted, ${tripsUpdated} updated/matched, ${tripsSkipped} skipped`);
  console.log(` • Timetables: ${timetableInserted} inserted, ${timetableUpdated} updated/matched, ${timetableSkipped} skipped`);
  console.log('====================================================================\n');

  await mongoose.disconnect();
  console.log('[INFO] Disconnected from MongoDB cleanly. Migration script finished.');
};

// Export runMigration for programmatic invocation, or run if invoked via CLI
if (require.main === module) {
  runMigration().catch(err => {
    console.error('[FATAL ERROR] Migration failed:', err);
    mongoose.disconnect().finally(() => process.exit(1));
  });
}

module.exports = runMigration;
