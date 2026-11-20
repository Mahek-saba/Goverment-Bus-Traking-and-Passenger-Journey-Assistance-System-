const { searchGtfsBuses, getBusDetailsById, getGtfsTimetable } = require('../data/gtfsLoader');
const { getSimulatedTracking: getTrackingFromService } = require('./trackingService');
const { calculateETA } = require('./etaService');

/**
 * Service to search buses matching given source and destination.
 * Integrates with the raw MSRTC GTFS dataset (stops, routes, trips).
 * 
 * @param {string} source - Origin city/stop term
 * @param {string} destination - Destination city/stop term
 * @returns {Array} - List of matching bus/trip records from the dataset
 */
const searchBuses = (source, destination) => {
  return searchGtfsBuses(source, destination);
};

/**
 * Service to retrieve full details and intermediate stops for a specific bus/trip by ID.
 * 
 * @param {string} id - Trip identifier
 * @returns {Object|null} - Detailed trip object or null if not found
 */
const getBusDetails = (id) => {
  return getBusDetailsById(id);
};

/**
 * Service to retrieve chronological timetable records between source and destination.
 * 
 * @param {string} source - Origin city/stop term
 * @param {string} destination - Destination city/stop term
 * @returns {Array} - Chronologically sorted timetable records
 */
const getTimetable = (source, destination) => {
  return getGtfsTimetable(source, destination);
};

/**
 * Service to retrieve simulated GPS tracking information for a specific bus/trip by ID.
 * 
 * @param {string} tripId - Trip identifier
 * @returns {Object|null} - Simulated tracking data or null if not found
 */
const getSimulatedTracking = (tripId) => {
  return getTrackingFromService(tripId);
};

/**
 * Service to calculate Estimated Time of Arrival (ETA) for a trip.
 * 
 * @param {string} tripId - Trip identifier
 * @param {string} [destinationQuery] - Optional destination stop name
 * @returns {Object|null} - ETA calculation object or null if not found
 */
const getETA = (tripId, destinationQuery) => {
  return calculateETA(tripId, destinationQuery);
};

/**
 * Service to suggest alternative trips between source and destination,
 * optionally excluding a selected trip ID.
 * 
 * @param {string} source - Origin city/stop term
 * @param {string} destination - Destination city/stop term
 * @param {string} [selectedTripId] - Optional trip ID to exclude from alternatives
 * @returns {Array} - Array of alternative bus records sorted chronologically
 */
const getAlternativeBuses = (source, destination, selectedTripId) => {
  const allBuses = searchGtfsBuses(source, destination);
  if (!selectedTripId || !selectedTripId.trim()) {
    return allBuses;
  }
  const excludeId = selectedTripId.trim();
  return allBuses.filter(bus => bus.id !== excludeId);
};

module.exports = {
  searchBuses,
  getBusDetails,
  getTimetable,
  getSimulatedTracking,
  getETA,
  getAlternativeBuses
};
