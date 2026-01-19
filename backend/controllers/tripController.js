const tripService = require('../services/tripService');
const { ERROR_MESSAGES } = require('../config/constants');

// Create a new trip
const createTrip = async (req, res, next) => {
  try {
    const {
      source,
      destination,
      departureTime,
      estimatedDuration,
      distance,
      pricePerSeat,
      totalSeats,
      description,
      tripType,
      allowedGender,
      vehicleDetails
    } = req.body;

    // Validation
    if (
      !source ||
      !destination ||
      !departureTime ||
      !estimatedDuration ||
      !distance ||
      !pricePerSeat ||
      !totalSeats
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const result = await tripService.createTrip(
      {
        source,
        destination,
        departureTime,
        estimatedDuration,
        distance,
        pricePerSeat,
        totalSeats,
        description,
        tripType,
        allowedGender,
        vehicleDetails
      },
      req.user.id
    );

    res.status(201).json(result);
  } catch (error) {
    console.error('Create Trip Error:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || ERROR_MESSAGES.SERVER_ERROR
    });
  }
};

// Get all trips
const getAllTrips = async (req, res, next) => {
  try {
    const { source, destination, departureDate, maxPrice, minSeats, page = 1, limit = 10 } = req.query;

    const filters = {};
    if (source) filters.source = source;
    if (destination) filters.destination = destination;
    if (departureDate) filters.departureDate = departureDate;
    if (maxPrice) filters.maxPrice = maxPrice;
    if (minSeats) filters.minSeats = minSeats;

    const result = await tripService.getAllTrips(filters, parseInt(page), parseInt(limit));

    res.status(200).json(result);
  } catch (error) {
    console.error('Get Trips Error:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || ERROR_MESSAGES.SERVER_ERROR
    });
  }
};

// Get trip by ID
const getTripById = async (req, res, next) => {
  try {
    const result = await tripService.getTripById(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    console.error('Get Trip Error:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || ERROR_MESSAGES.SERVER_ERROR
    });
  }
};

// Join a trip
const joinTrip = async (req, res, next) => {
  try {
    const { seatsToBook = 1 } = req.body;

    const result = await tripService.joinTrip(req.params.id, req.user.id, seatsToBook);

    res.status(200).json(result);
  } catch (error) {
    console.error('Join Trip Error:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || ERROR_MESSAGES.SERVER_ERROR
    });
  }
};

// Leave a trip
const leaveTrip = async (req, res, next) => {
  try {
    const result = await tripService.leaveTrip(req.params.id, req.user.id);

    res.status(200).json(result);
  } catch (error) {
    console.error('Leave Trip Error:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || ERROR_MESSAGES.SERVER_ERROR
    });
  }
};

// Cancel a trip
const cancelTrip = async (req, res, next) => {
  try {
    const result = await tripService.cancelTrip(req.params.id, req.user.id);

    res.status(200).json(result);
  } catch (error) {
    console.error('Cancel Trip Error:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || ERROR_MESSAGES.SERVER_ERROR
    });
  }
};

// Get user's trips as driver
const getMyTripsAsDriver = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const result = await tripService.getUserTripsAsDriver(req.user.id, parseInt(page), parseInt(limit));

    res.status(200).json(result);
  } catch (error) {
    console.error('Get My Trips Error:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || ERROR_MESSAGES.SERVER_ERROR
    });
  }
};

// Get user's trips as rider
const getMyTripsAsRider = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const result = await tripService.getUserTripsAsRider(req.user.id, parseInt(page), parseInt(limit));

    res.status(200).json(result);
  } catch (error) {
    console.error('Get My Trips Error:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || ERROR_MESSAGES.SERVER_ERROR
    });
  }
};

// Update trip
const updateTrip = async (req, res, next) => {
  try {
    const result = await tripService.updateTrip(req.params.id, req.user.id, req.body);

    res.status(200).json(result);
  } catch (error) {
    console.error('Update Trip Error:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || ERROR_MESSAGES.SERVER_ERROR
    });
  }
};

module.exports = {
  createTrip,
  getAllTrips,
  getTripById,
  joinTrip,
  leaveTrip,
  cancelTrip,
  getMyTripsAsDriver,
  getMyTripsAsRider,
  updateTrip
};
