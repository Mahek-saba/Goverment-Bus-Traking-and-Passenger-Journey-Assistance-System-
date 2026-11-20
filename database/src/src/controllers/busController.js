const busService = require('../services/busService');

const DATASET_DISCLAIMER = 'Data sourced from unofficial and incomplete MSRTC GTFS crawler dataset. Live vehicle allocations, fares, and real-time seats are not present in this feed.';
const SIMULATED_TRACKING_DISCLAIMER = 'This is simulated tracking, not actual live MSRTC GPS data.';
const ETA_DISCLAIMER = 'ETA is an estimate based on available dataset segment durations and is not guaranteed.';

/**
 * Controller to handle bus search requests.
 * Endpoint: GET /api/buses/search?source=...&destination=...
 */
const searchBuses = (req, res) => {
  try {
    const { source, destination } = req.query;

    // 1. Validate that source is provided
    if (!source || !source.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Source is required'
      });
    }

    // 2. Validate that destination is provided
    if (!destination || !destination.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Destination is required'
      });
    }

    // 3. Validate that source and destination are not the same
    if (source.trim().toLowerCase() === destination.trim().toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: 'Source and destination cannot be the same'
      });
    }

    // 4. Search matching buses via service
    const matchingBuses = busService.searchBuses(source, destination);

    // 5. If no bus matches, return a friendly message
    if (matchingBuses.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No buses found for the given route in the dataset',
        count: 0,
        disclaimer: DATASET_DISCLAIMER,
        data: []
      });
    }

    // 6. Return matching bus records
    return res.status(200).json({
      success: true,
      count: matchingBuses.length,
      disclaimer: DATASET_DISCLAIMER,
      data: matchingBuses
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while searching buses',
      error: error.message
    });
  }
};

/**
 * Controller to handle bus and route details by ID.
 * Endpoint: GET /api/buses/:id
 */
const getBusDetails = (req, res) => {
  try {
    const { id } = req.params;

    // 1. Validate that trip ID is provided
    if (!id || !id.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Trip ID is required'
      });
    }

    const busDetails = busService.getBusDetails(id.trim());

    // 2. Return 404 if trip not found in dataset
    if (!busDetails) {
      return res.status(404).json({
        success: false,
        message: `Bus/Trip with ID '${id.trim()}' not found in dataset`
      });
    }

    // 3. Return full bus and route details
    return res.status(200).json({
      success: true,
      disclaimer: DATASET_DISCLAIMER,
      data: busDetails
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching bus details',
      error: error.message
    });
  }
};

/**
 * Controller to handle chronological route timetable requests.
 * Endpoint: GET /api/buses/timetable?source=...&destination=...
 *       or: GET /api/timetable?source=...&destination=...
 */
const getTimetable = (req, res) => {
  try {
    const { source, destination } = req.query;

    // 1. Validate that source is provided
    if (!source || !source.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Source is required'
      });
    }

    // 2. Validate that destination is provided
    if (!destination || !destination.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Destination is required'
      });
    }

    // 3. Validate that source and destination are not the same
    if (source.trim().toLowerCase() === destination.trim().toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: 'Source and destination cannot be the same'
      });
    }

    // 4. Query timetable via service
    const timetable = busService.getTimetable(source, destination);

    // 5. If no timetable records match
    if (timetable.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No timetable records found for the given route in the dataset',
        count: 0,
        disclaimer: DATASET_DISCLAIMER,
        data: []
      });
    }

    // 6. Return sorted timetable records
    return res.status(200).json({
      success: true,
      count: timetable.length,
      disclaimer: DATASET_DISCLAIMER,
      data: timetable
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching timetable',
      error: error.message
    });
  }
};

/**
 * Controller to handle simulated GPS tracking for a valid trip ID.
 * Endpoint: GET /api/buses/:id/tracking
 *       or: GET /api/buses/tracking/:id
 *       or: GET /api/tracking/:id
 */
const getSimulatedTracking = (req, res) => {
  try {
    const { id } = req.params;

    // 1. Validate that trip ID is provided
    if (!id || !id.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Trip ID is required'
      });
    }

    const trackingData = busService.getSimulatedTracking(id.trim());

    // 2. Return 404 if trip not found in dataset
    if (!trackingData) {
      return res.status(404).json({
        success: false,
        message: `Bus/Trip with ID '${id.trim()}' not found in dataset`
      });
    }

    // 3. Return simulated tracking data
    return res.status(200).json({
      success: true,
      disclaimer: SIMULATED_TRACKING_DISCLAIMER,
      data: trackingData
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while generating simulated tracking',
      error: error.message
    });
  }
};

/**
 * Controller to handle Estimated Time of Arrival (ETA) calculation.
 * Endpoint: GET /api/buses/:id/eta
 *       or: GET /api/buses/eta/:id
 *       or: GET /api/eta/:id
 */
const getETA = (req, res) => {
  try {
    const { id } = req.params;
    const { destination } = req.query;

    // 1. Validate that trip ID is provided
    if (!id || !id.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Trip ID is required'
      });
    }

    const etaData = busService.getETA(id.trim(), destination);

    // 2. Return 404 if trip not found in dataset
    if (!etaData) {
      return res.status(404).json({
        success: false,
        message: `Bus/Trip with ID '${id.trim()}' not found in dataset`
      });
    }

    // 3. Return ETA calculation
    return res.status(200).json({
      success: true,
      disclaimer: ETA_DISCLAIMER,
      data: etaData
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while calculating ETA',
      error: error.message
    });
  }
};

/**
 * Controller to handle alternative bus suggestions.
 * Endpoint: GET /api/buses/alternatives?source=...&destination=...&selectedTripId=...
 *       or: GET /api/alternatives?source=...&destination=...&selectedTripId=...
 */
const getAlternativeBuses = (req, res) => {
  try {
    const { source, destination, selectedTripId } = req.query;

    // 1. Validate that source is provided
    if (!source || !source.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Source is required'
      });
    }

    // 2. Validate that destination is provided
    if (!destination || !destination.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Destination is required'
      });
    }

    // 3. Validate that source and destination are not the same
    if (source.trim().toLowerCase() === destination.trim().toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: 'Source and destination cannot be the same'
      });
    }

    // 4. Query alternative buses via service
    const alternatives = busService.getAlternativeBuses(source, destination, selectedTripId);

    // 5. If no alternative buses match
    if (alternatives.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No alternative buses found for the given route in the dataset',
        count: 0,
        disclaimer: DATASET_DISCLAIMER,
        data: []
      });
    }

    // 6. Return matching alternative buses
    return res.status(200).json({
      success: true,
      count: alternatives.length,
      disclaimer: DATASET_DISCLAIMER,
      data: alternatives
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while finding alternative buses',
      error: error.message
    });
  }
};

module.exports = {
  searchBuses,
  getBusDetails,
  getTimetable,
  getSimulatedTracking,
  getETA,
  getAlternativeBuses
};
