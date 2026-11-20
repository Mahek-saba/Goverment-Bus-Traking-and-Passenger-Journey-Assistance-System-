const { getSimulatedTracking } = require('./trackingService');
const { getTripWithStopCoordinates, getRouteSegmentTimes } = require('../data/gtfsLoader');

/**
 * Service to calculate Estimated Time of Arrival (ETA) for an active trip.
 * 
 * NOTE: ETA is strictly derived from observed segment durations in the dataset.
 * It does not assume a constant speed or invent missing travel times.
 * If any segment between the current position and destination lacks timing data,
 * the status is reported as "UNAVAILABLE" and estimatedArrivalTime as null.
 * 
 * @param {string} tripId - The trip identifier
 * @param {string} [destinationQuery] - Optional destination stop name
 * @returns {Object|null} - ETA calculation object or null if trip not found
 */
const calculateETA = (tripId, destinationQuery) => {
  if (!tripId || !tripId.trim()) return null;

  const trackingData = getSimulatedTracking(tripId.trim());
  if (!trackingData) return null;

  const routeData = getTripWithStopCoordinates(tripId.trim());
  if (!routeData || !routeData.stopList || routeData.stopList.length === 0) {
    return null;
  }

  const { stopList, stops, routeCode } = routeData;
  const segments = getRouteSegmentTimes(routeCode);

  // Locate the bus's current simulated stop index in the route sequence
  let currentIdx = 0;
  if (trackingData.currentStop && trackingData.currentStop.stopId) {
    const foundIdx = stopList.indexOf(trackingData.currentStop.stopId);
    if (foundIdx !== -1) currentIdx = foundIdx;
  }

  // Determine target destination stop index
  let targetIdx = stopList.length - 1; // Default to terminus
  if (destinationQuery && destinationQuery.trim()) {
    const norm = destinationQuery.trim().toLowerCase();
    // Prefer stops situated after the current stop
    const forwardIdx = stops.findIndex((s, idx) => idx > currentIdx && s && (s.name || '').toLowerCase().includes(norm));
    if (forwardIdx !== -1) {
      targetIdx = forwardIdx;
    } else {
      // Check if matching stop appears anywhere in the route
      const anyIdx = stops.findIndex((s) => s && (s.name || '').toLowerCase().includes(norm));
      if (anyIdx !== -1) targetIdx = anyIdx;
    }
  }

  const targetStop = stops[targetIdx];

  // Case 1: Bus is already at or past the target stop
  if (targetIdx <= currentIdx) {
    return {
      tripId: trackingData.tripId,
      routeCode: routeCode,
      destination: targetStop ? targetStop.name : trackingData.terminusStop,
      currentStop: trackingData.currentStop,
      estimatedArrivalTime: null,
      estimatedMinutesRemaining: 0,
      etaStatus: 'ARRIVED',
      calculationMethod: 'Bus has already reached or passed the target destination stop',
      disclaimer: 'ETA is an estimate based on available dataset segment durations and is not guaranteed.'
    };
  }

  // Case 2: Bus is approaching target stop - inspect all segments in between
  let allKnown = true;
  let remainingSeconds = 0;

  for (let i = currentIdx; i < targetIdx; i++) {
    const seg = segments[i];
    if (!seg || typeof seg.duration_seconds !== 'number') {
      allKnown = false;
      break;
    }
    remainingSeconds += seg.duration_seconds;
  }

  let estimatedArrivalTime = null;
  let estimatedMinutesRemaining = null;
  let etaStatus = 'UNAVAILABLE';
  let calculationMethod = 'Insufficient segment duration data in GTFS dataset';

  if (allKnown && remainingSeconds > 0) {
    const now = new Date();
    const arrDate = new Date(now.getTime() + remainingSeconds * 1000);
    const pad = (n) => String(n).padStart(2, '0');
    estimatedArrivalTime = `${pad(arrDate.getHours())}:${pad(arrDate.getMinutes())}:${pad(arrDate.getSeconds())}`;
    estimatedMinutesRemaining = Math.round(remainingSeconds / 60);
    etaStatus = 'AVAILABLE';
    calculationMethod = 'Cumulative median segment durations from GTFS dataset';
  }

  return {
    tripId: trackingData.tripId,
    routeCode: routeCode,
    destination: targetStop ? targetStop.name : trackingData.terminusStop,
    currentStop: trackingData.currentStop,
    estimatedArrivalTime,
    estimatedMinutesRemaining,
    etaStatus,
    calculationMethod,
    disclaimer: 'ETA is an estimate based on available dataset segment durations and is not guaranteed.'
  };
};

module.exports = {
  calculateETA
};

