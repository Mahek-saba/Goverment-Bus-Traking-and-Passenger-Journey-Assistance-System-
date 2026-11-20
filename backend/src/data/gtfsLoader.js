const fs = require('fs');
const path = require('path');

/**
 * GTFS Raw Dataset Loader and Query Service
 * 
 * NOTE: This module reads raw data from docs/datasets/msrtc-gtfs/
 * Sourced from the unofficial and incomplete MSRTC GTFS crawler repository.
 * The raw files are preserved in their original format.
 */

// Determine dataset path (relative to this file or current working directory)
const resolveDatasetDir = () => {
  const candidate1 = path.resolve(__dirname, '../../../docs/datasets/msrtc-gtfs');
  if (fs.existsSync(candidate1)) return candidate1;

  const candidate2 = path.resolve(process.cwd(), 'docs/datasets/msrtc-gtfs');
  if (fs.existsSync(candidate2)) return candidate2;

  throw new Error('MSRTC GTFS dataset directory not found at docs/datasets/msrtc-gtfs');
};

let isLoaded = false;
let stopMap = new Map();
let routes = {};
let tripsByRoute = new Map();
let tripsById = new Map();
let tripTimes = {};

/**
 * Loads and indexes dataset in memory for fast querying.
 */
const loadDataset = () => {
  if (isLoaded) return;

  const datasetDir = resolveDatasetDir();

  // 1. Load stops with geographic coordinates
  const stopsPath = path.join(datasetDir, 'msrtc-stops.geojson');
  const stopsData = JSON.parse(fs.readFileSync(stopsPath, 'utf8'));
  stopsData.features.forEach(f => {
    stopMap.set(f.properties.stop_id, {
      id: f.properties.stop_id,
      code: f.properties.stop_code,
      name: f.properties.stop_name,
      nameDevanagari: f.properties.stop_name_devanagari,
      desc: f.properties.stop_desc,
      coordinates: (f.geometry && Array.isArray(f.geometry.coordinates)) ? f.geometry.coordinates : null
    });
  });

  // 2. Load routes
  const routesPath = path.join(datasetDir, 'msrtc-routes.json');
  routes = JSON.parse(fs.readFileSync(routesPath, 'utf8'));

  // 3. Load trips and index by route_code and by tripId
  const tripsPath = path.join(datasetDir, 'msrtc-trips.json');
  const tripsData = JSON.parse(fs.readFileSync(tripsPath, 'utf8'));
  for (const [tripId, trip] of Object.entries(tripsData)) {
    const tripRecord = {
      tripId,
      route_code: trip.route_code,
      weekdays: trip.weekdays || [],
      departure_time: trip.departure_time || null
    };

    tripsById.set(tripId, tripRecord);

    if (!tripsByRoute.has(trip.route_code)) {
      tripsByRoute.set(trip.route_code, []);
    }
    tripsByRoute.get(trip.route_code).push(tripRecord);
  }

  // 4. Load trip segment times
  const tripTimesPath = path.join(datasetDir, 'msrtc-trip-times.json');
  if (fs.existsSync(tripTimesPath)) {
    tripTimes = JSON.parse(fs.readFileSync(tripTimesPath, 'utf8'));
  }

  // 5. Register Demo corridor records so demo trips seamlessly resolve
  const demoStopsList = [
    { id: 'DEMO-STOP-001', code: 'DEMO-STOP-001', name: 'Solapur Central Demo Stop', nameDevanagari: 'सोलापूर मध्यवर्ती डेमो बस स्थानक', coordinates: [75.9064, 17.6599] },
    { id: 'DEMO-STOP-002', code: 'DEMO-STOP-002', name: 'Tembhurni Demo Stop', nameDevanagari: 'टेंभुर्णी डेमो बस स्थानक', coordinates: [75.1837, 18.0645] },
    { id: 'DEMO-STOP-003', code: 'DEMO-STOP-003', name: 'Pune Swargate Demo Stop', nameDevanagari: 'पुणे स्वारगेट डेमो बस स्थानक', coordinates: [73.8586, 18.5018] },
    { id: 'DEMO-STOP-004', code: 'DEMO-STOP-004', name: 'Pune Swargate Return Demo Stop', nameDevanagari: 'पुणे स्वारगेट परतीचे डेमो स्थानक', coordinates: [73.8590, 18.5025] },
    { id: 'DEMO-STOP-005', code: 'DEMO-STOP-005', name: 'Indapur Demo Stop', nameDevanagari: 'इंदापूर डेमो बस स्थानक', coordinates: [75.0253, 18.1147] },
    { id: 'DEMO-STOP-006', code: 'DEMO-STOP-006', name: 'Solapur Central Return Demo Stop', nameDevanagari: 'सोलापूर मध्यवर्ती परतीचे डेमो स्थानक', coordinates: [75.9070, 17.6605] }
  ];
  for (const s of demoStopsList) {
    stopMap.set(s.id, s);
  }

  routes['DEMO-SOL-PUN-001'] = ['DEMO-STOP-001', 'DEMO-STOP-002', 'DEMO-STOP-003'];
  routes['DEMO-PUN-SOL-002'] = ['DEMO-STOP-004', 'DEMO-STOP-005', 'DEMO-STOP-006'];

  const demoTripsList = [
    { tripId: 'DEMO-TRIP-001', route_code: 'DEMO-SOL-PUN-001', weekdays: ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'], departure_time: '06:30:00' },
    { tripId: 'DEMO-TRIP-002', route_code: 'DEMO-SOL-PUN-001', weekdays: ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'], departure_time: '09:00:00' },
    { tripId: 'DEMO-TRIP-003', route_code: 'DEMO-PUN-SOL-002', weekdays: ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'], departure_time: '07:15:00' },
    { tripId: 'DEMO-TRIP-004', route_code: 'DEMO-PUN-SOL-002', weekdays: ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'], departure_time: '16:00:00' }
  ];

  for (const dt of demoTripsList) {
    tripsById.set(dt.tripId, dt);
    if (!tripsByRoute.has(dt.route_code)) {
      tripsByRoute.set(dt.route_code, []);
    }
    tripsByRoute.get(dt.route_code).push(dt);
  }

  tripTimes['DEMO-SOL-PUN-001'] = [
    { from_stop: 'DEMO-STOP-001', to_stop: 'DEMO-STOP-002', duration_seconds: 9000 },
    { from_stop: 'DEMO-STOP-002', to_stop: 'DEMO-STOP-003', duration_seconds: 9000 }
  ];
  tripTimes['DEMO-PUN-SOL-002'] = [
    { from_stop: 'DEMO-STOP-004', to_stop: 'DEMO-STOP-005', duration_seconds: 9000 },
    { from_stop: 'DEMO-STOP-005', to_stop: 'DEMO-STOP-006', duration_seconds: 9000 }
  ];

  isLoaded = true;
};

/**
 * Helper to match stop IDs for a given search query term.
 */
const findMatchingStopIds = (term) => {
  const norm = term.trim().toLowerCase();
  const matched = new Set();
  for (const stop of stopMap.values()) {
    if ((stop.name || '').toLowerCase().includes(norm)) {
      matched.add(stop.id);
    }
  }
  return matched;
};

/**
 * Searches trips matching the given source and destination terms using raw dataset.
 * 
 * @param {string} sourceTerm - User-entered source city/stop
 * @param {string} destTerm - User-entered destination city/stop
 * @returns {Array} - Array of bus/trip objects matching the route
 */
const searchGtfsBuses = (sourceTerm, destTerm) => {
  loadDataset();

  const sourceStopIds = findMatchingStopIds(sourceTerm);
  const destStopIds = findMatchingStopIds(destTerm);

  if (sourceStopIds.size === 0 || destStopIds.size === 0) {
    return [];
  }

  const results = [];

  for (const [routeCode, stopList] of Object.entries(routes)) {
    if (!Array.isArray(stopList) || stopList.length < 2) continue;

    let sourceIdx = -1;
    let matchedSourceId = null;

    for (let i = 0; i < stopList.length; i++) {
      if (sourceStopIds.has(stopList[i])) {
        sourceIdx = i;
        matchedSourceId = stopList[i];
        break;
      }
    }

    if (sourceIdx !== -1) {
      for (let j = sourceIdx + 1; j < stopList.length; j++) {
        if (destStopIds.has(stopList[j])) {
          const matchedDestId = stopList[j];
          const routeTrips = tripsByRoute.get(routeCode) || [];

          const sourceStopObj = stopMap.get(matchedSourceId);
          const destStopObj = stopMap.get(matchedDestId);
          const originStopObj = stopMap.get(stopList[0]);
          const terminusStopObj = stopMap.get(stopList[stopList.length - 1]);

          if (routeTrips.length > 0) {
            routeTrips.forEach(trip => {
              results.push({
                id: trip.tripId,
                routeCode: routeCode,
                source: sourceStopObj ? sourceStopObj.name : 'Unknown',
                destination: destStopObj ? destStopObj.name : 'Unknown',
                originStop: originStopObj ? originStopObj.name : null,
                terminusStop: terminusStopObj ? terminusStopObj.name : null,
                departureTime: trip.departure_time,
                arrivalTime: null,      // Note: Destination arrival time unobserved in raw crawl
                busNumber: null,        // Note: Dynamic vehicle fleet assignment not in GTFS
                busType: null,          // Note: Category not provided in raw GTFS feed
                fare: null,             // Note: Fare structure not in static GTFS feed
                availableSeats: null,   // Note: Real-time seat inventory requires booking API
                weekdays: trip.weekdays,
                stopsBetween: j - sourceIdx
              });
            });
          }

          break;
        }
      }
    }
  }

  results.sort((a, b) => {
    if (!a.departureTime) return 1;
    if (!b.departureTime) return -1;
    return a.departureTime.localeCompare(b.departureTime);
  });

  return results;
};

/**
 * Retrieves full details and stop sequence for a specific trip/bus by ID.
 * 
 * @param {string} tripId - The trip identifier (e.g. 'L5624', '27305')
 * @returns {Object|null} - Detailed trip object or null if not found
 */
const getBusDetailsById = (tripId) => {
  loadDataset();

  if (!tripId) return null;

  const trip = tripsById.get(tripId);
  if (!trip) return null;

  const stopList = routes[trip.route_code] || [];
  const originStopObj = stopList.length > 0 ? stopMap.get(stopList[0]) : null;
  const terminusStopObj = stopList.length > 0 ? stopMap.get(stopList[stopList.length - 1]) : null;

  const stops = stopList.map((stopId, index) => {
    const s = stopMap.get(stopId);
    return {
      sequence: index + 1,
      stopId: stopId,
      stopCode: s ? s.code : null,
      stopName: s ? s.name : 'Unknown Stop',
      stopNameDevanagari: s ? s.nameDevanagari : null,
      description: s ? s.desc : null
    };
  });

  let arrivalTime = null;
  const segmentTimes = tripTimes[trip.route_code];
  if (Array.isArray(segmentTimes) && segmentTimes.length === stopList.length - 1 && trip.departure_time) {
    let allKnown = true;
    let totalSeconds = 0;
    for (const seg of segmentTimes) {
      if (!seg || typeof seg.duration_seconds !== 'number') {
        allKnown = false;
        break;
      }
      totalSeconds += seg.duration_seconds;
    }
    if (allKnown && totalSeconds > 0) {
      const [h, m, s] = trip.departure_time.split(':').map(Number);
      const depDate = new Date(2000, 0, 1, h, m, s || 0);
      const arrDate = new Date(depDate.getTime() + totalSeconds * 1000);
      const pad = (n) => String(n).padStart(2, '0');
      arrivalTime = `${pad(arrDate.getHours())}:${pad(arrDate.getMinutes())}:${pad(arrDate.getSeconds())}`;
    }
  }

  return {
    id: trip.tripId,
    routeCode: trip.route_code,
    source: originStopObj ? originStopObj.name : 'Unknown',
    destination: terminusStopObj ? terminusStopObj.name : 'Unknown',
    originStop: originStopObj ? originStopObj.name : null,
    terminusStop: terminusStopObj ? terminusStopObj.name : null,
    departureTime: trip.departure_time,
    arrivalTime: arrivalTime,
    busNumber: null,
    busType: null,
    fare: null,
    availableSeats: null,
    weekdays: trip.weekdays,
    totalStops: stopList.length,
    stops: stops
  };
};

/**
 * Retrieves timetable records for a route between source and destination.
 * 
 * @param {string} sourceTerm - Origin city/stop
 * @param {string} destTerm - Destination city/stop
 * @returns {Array} - Array of timetable items sorted chronologically
 */
const getGtfsTimetable = (sourceTerm, destTerm) => {
  loadDataset();

  const sourceStopIds = findMatchingStopIds(sourceTerm);
  const destStopIds = findMatchingStopIds(destTerm);

  if (sourceStopIds.size === 0 || destStopIds.size === 0) {
    return [];
  }

  const timetable = [];

  for (const [routeCode, stopList] of Object.entries(routes)) {
    if (!Array.isArray(stopList) || stopList.length < 2) continue;

    let sourceIdx = -1;
    let matchedSourceId = null;

    for (let i = 0; i < stopList.length; i++) {
      if (sourceStopIds.has(stopList[i])) {
        sourceIdx = i;
        matchedSourceId = stopList[i];
        break;
      }
    }

    if (sourceIdx !== -1) {
      for (let j = sourceIdx + 1; j < stopList.length; j++) {
        if (destStopIds.has(stopList[j])) {
          const matchedDestId = stopList[j];
          const routeTrips = tripsByRoute.get(routeCode) || [];
          const segments = tripTimes[routeCode] || [];

          const sourceStopObj = stopMap.get(matchedSourceId);
          const destStopObj = stopMap.get(matchedDestId);
          const originStopObj = stopMap.get(stopList[0]);
          const terminusStopObj = stopMap.get(stopList[stopList.length - 1]);

          routeTrips.forEach(trip => {
            const [h, m, s] = (trip.departure_time || '00:00:00').split(':').map(Number);
            let currentSeconds = h * 3600 + m * 60 + (s || 0);
            let timingBreak = false;
            const stopTimings = [];

            for (let k = 0; k < stopList.length; k++) {
              if (k === 0) {
                stopTimings.push({
                  arrivalTime: null,
                  departureTime: trip.departure_time
                });
              } else {
                const seg = segments[k - 1];
                if (!timingBreak && seg && typeof seg.duration_seconds === 'number') {
                  currentSeconds += seg.duration_seconds;
                  const totalSecDay = currentSeconds % 86400;
                  const arrH = Math.floor(totalSecDay / 3600);
                  const arrM = Math.floor((totalSecDay % 3600) / 60);
                  const arrS = totalSecDay % 60;
                  const pad = (n) => String(n).padStart(2, '0');
                  const formatted = `${pad(arrH)}:${pad(arrM)}:${pad(arrS)}`;
                  stopTimings.push({
                    arrivalTime: formatted,
                    departureTime: k < stopList.length - 1 ? formatted : null
                  });
                } else {
                  timingBreak = true;
                  stopTimings.push({
                    arrivalTime: null,
                    departureTime: null
                  });
                }
              }
            }

            const stopSchedule = [];
            for (let k = sourceIdx; k <= j; k++) {
              const sObj = stopMap.get(stopList[k]);
              stopSchedule.push({
                sequence: k - sourceIdx + 1,
                stopId: stopList[k],
                stopCode: sObj ? sObj.code : null,
                stopName: sObj ? sObj.name : 'Unknown Stop',
                stopNameDevanagari: sObj ? sObj.nameDevanagari : null,
                arrivalTime: k === sourceIdx ? null : stopTimings[k].arrivalTime,
                departureTime: k === j ? null : (stopTimings[k].departureTime || (k === 0 ? trip.departure_time : null))
              });
            }

            const effectiveDeparture = stopTimings[sourceIdx].departureTime || (sourceIdx === 0 ? trip.departure_time : null);
            const effectiveArrival = stopTimings[j].arrivalTime;

            timetable.push({
              tripId: trip.tripId,
              routeCode: routeCode,
              source: sourceStopObj ? sourceStopObj.name : 'Unknown',
              destination: destStopObj ? destStopObj.name : 'Unknown',
              originStop: originStopObj ? originStopObj.name : null,
              terminusStop: terminusStopObj ? terminusStopObj.name : null,
              departureTime: effectiveDeparture,
              arrivalTime: effectiveArrival,
              weekdays: trip.weekdays,
              stopsInJourney: j - sourceIdx + 1,
              stopSchedule: stopSchedule
            });
          });

          break;
        }
      }
    }
  }

  timetable.sort((a, b) => {
    if (!a.departureTime) return 1;
    if (!b.departureTime) return -1;
    return a.departureTime.localeCompare(b.departureTime);
  });

  return timetable;
};

/**
 * Retrieves the raw trip and stop details with coordinates for tracking simulation.
 * 
 * @param {string} tripId - The trip identifier
 * @returns {Object|null} - Trip and stops metadata with coordinates
 */
const getTripWithStopCoordinates = (tripId) => {
  loadDataset();
  if (!tripId) return null;

  const trip = tripsById.get(tripId);
  if (!trip) return null;

  const stopList = routes[trip.route_code] || [];
  const stops = stopList.map(stopId => stopMap.get(stopId) || null);

  return {
    trip,
    routeCode: trip.route_code,
    stopList,
    stops
  };
};

/**
 * Retrieves the observed segment duration records for a route.
 * 
 * @param {string} routeCode - Route identifier
 * @returns {Array} - Array of segment duration objects or nulls
 */
const getRouteSegmentTimes = (routeCode) => {
  loadDataset();
  return tripTimes[routeCode] || [];
};

module.exports = {
  loadDataset,
  searchGtfsBuses,
  getBusDetailsById,
  getGtfsTimetable,
  getTripWithStopCoordinates,
  getRouteSegmentTimes
};
