const express = require('express');
const router = express.Router();
const {
  searchBuses,
  getBusDetails,
  getTimetable,
  getSimulatedTracking,
  getETA,
  getAlternativeBuses
} = require('../controllers/busController');

// Handles missing ID on root /api/buses (or allows ?id= query param)
router.get('/', (req, res) => {
  const { id } = req.query;
  if (id) {
    req.params.id = id;
    return getBusDetails(req, res);
  }
  return res.status(400).json({
    success: false,
    message: 'Trip ID is required'
  });
});

// Bus search endpoint: GET /api/buses/search?source=...&destination=...
router.get('/search', searchBuses);

// Timetable endpoint: GET /api/buses/timetable?source=...&destination=...
router.get('/timetable', getTimetable);

// Simulated tracking endpoints:
router.get('/tracking', (req, res) => {
  const { id } = req.query;
  if (id) {
    req.params.id = id;
    return getSimulatedTracking(req, res);
  }
  return res.status(400).json({
    success: false,
    message: 'Trip ID is required'
  });
});

router.get('/tracking/:id', getSimulatedTracking);
router.get('/:id/tracking', getSimulatedTracking);

// Estimated Time of Arrival (ETA) endpoints:
router.get('/eta', (req, res) => {
  const { id } = req.query;
  if (id) {
    req.params.id = id;
    return getETA(req, res);
  }
  return res.status(400).json({
    success: false,
    message: 'Trip ID is required'
  });
});

router.get('/eta/:id', getETA);
router.get('/:id/eta', getETA);

// Alternative bus suggestions: GET /api/buses/alternatives?source=...&destination=...&selectedTripId=...
router.get('/alternatives', getAlternativeBuses);

// Bus and route details endpoint: GET /api/buses/:id
router.get('/:id', getBusDetails);

module.exports = router;
