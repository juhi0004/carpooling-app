const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
const authMiddleware = require('../middleware/auth');

// Public routes
router.get('/', tripController.getAllTrips);
router.get('/:id', tripController.getTripById);

// Protected routes (require authentication)
router.post('/', authMiddleware, tripController.createTrip);
router.post('/:id/join', authMiddleware, tripController.joinTrip);
router.post('/:id/leave', authMiddleware, tripController.leaveTrip);
router.post('/:id/cancel', authMiddleware, tripController.cancelTrip);
router.put('/:id', authMiddleware, tripController.updateTrip);

// User specific routes
router.get('/driver/my-trips', authMiddleware, tripController.getMyTripsAsDriver);
router.get('/rider/my-trips', authMiddleware, tripController.getMyTripsAsRider);

module.exports = router;
