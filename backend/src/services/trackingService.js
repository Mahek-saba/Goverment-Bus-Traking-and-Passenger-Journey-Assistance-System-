const { getTripWithStopCoordinates } = require('../data/gtfsLoader');

/**
 * Service to simulate GPS bus tracking along a GTFS route.
 * 
 * NOTE: MSRTC live telemetry is not available in static GTFS feeds.
 * This service calculates a simulated position between consecutive stops
 * based on the trip's actual stop sequence and geographic coordinates.
 * 
 * @param {string} tripId - The trip identifier (e.g. 'L5624')
 * @returns {Object|null} - Simulated tracking data or null if trip not found
 */
const getSimulatedTracking = (tripId) => {
  if (!tripId || !tripId.trim()) return null;

  const data = getTripWithStopCoordinates(tripId.trim());
  if (!data || !data.trip || !data.stops || data.stops.length === 0) {
    return null;
  }

  const { trip, routeCode, stops } = data;
  const totalStops = stops.length;

  const originStop = stops[0];
  const terminusStop = stops[totalStops - 1];

  // Case 1: Route with single stop
  if (totalStops === 1) {
    const singleStop = stops[0];
    let coords = null;
    if (singleStop && singleStop.coordinates && singleStop.coordinates.length >= 2) {
      coords = {
        latitude: Number(singleStop.coordinates[1].toFixed(6)),
        longitude: Number(singleStop.coordinates[0].toFixed(6))
      };
    }

    return {
      tripId: trip.tripId,
      routeCode: routeCode,
      trackingStatus: 'AT_STOP',
      isSimulated: true,
      simulatedCoordinates: coords,
      currentStop: singleStop ? {
        stopId: singleStop.id,
        stopCode: singleStop.code,
        stopName: singleStop.name
      } : null,
      nextStop: null,
      originStop: originStop ? originStop.name : null,
      terminusStop: terminusStop ? terminusStop.name : null,
      timestamp: new Date().toISOString()
    };
  }

  // Case 2: Multi-stop route - interpolate position between stops
  const totalSegments = totalStops - 1;

  // Derive a smooth, deterministic simulated progress ratio using time of day & trip hash
  const now = new Date();
  const minuteOfDay = now.getHours() * 60 + now.getMinutes();
  const hash = tripId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const progressRatio = ((minuteOfDay * 3 + hash) % 100) / 100;

  const rawSegmentIndex = progressRatio * totalSegments;
  const currentIdx = Math.min(Math.floor(rawSegmentIndex), totalSegments - 1);
  const nextIdx = Math.min(currentIdx + 1, totalStops - 1);
  const segmentFraction = rawSegmentIndex - Math.floor(rawSegmentIndex);

  const currStop = stops[currentIdx];
  const nextStop = stops[nextIdx];

  let simulatedCoordinates = null;
  if (currStop && currStop.coordinates && nextStop && nextStop.coordinates) {
    const lon1 = currStop.coordinates[0];
    const lat1 = currStop.coordinates[1];
    const lon2 = nextStop.coordinates[0];
    const lat2 = nextStop.coordinates[1];

    if (typeof lat1 === 'number' && typeof lon1 === 'number' &&
        typeof lat2 === 'number' && typeof lon2 === 'number') {
      const simLat = lat1 + (lat2 - lat1) * segmentFraction;
      const simLon = lon1 + (lon2 - lon1) * segmentFraction;

      simulatedCoordinates = {
        latitude: Number(simLat.toFixed(6)),
        longitude: Number(simLon.toFixed(6))
      };
    }
  }

  return {
    tripId: trip.tripId,
    routeCode: routeCode,
    trackingStatus: 'IN_TRANSIT',
    isSimulated: true,
    simulatedCoordinates: simulatedCoordinates,
    currentStop: currStop ? {
      stopId: currStop.id,
      stopCode: currStop.code,
      stopName: currStop.name
    } : null,
    nextStop: nextStop ? {
      stopId: nextStop.id,
      stopCode: nextStop.code,
      stopName: nextStop.name
    } : null,
    originStop: originStop ? originStop.name : null,
    terminusStop: terminusStop ? terminusStop.name : null,
    timestamp: new Date().toISOString()
  };
};

module.exports = {
  getSimulatedTracking
};

