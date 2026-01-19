const Trip = require('../models/Trip');
const User = require('../models/User');
const { ERROR_MESSAGES, SUCCESS_MESSAGES } = require('../config/constants');

// Create a new trip
const createTrip = async (tripData, driverId) => {
  try {
    const trip = await Trip.create({
      ...tripData,
      driver: driverId,
      availableSeats: tripData.totalSeats
    });

    return {
      success: true,
      message: 'Trip created successfully',
      trip: await trip.populate('driver', 'name email phone rating')
    };
  } catch (error) {
    throw error;
  }
};

// Get all trips with filters
const getAllTrips = async (filters = {}, page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;
    const query = { status: 'scheduled' };

    // Apply filters
    if (filters.source) {
      query['source.address'] = { $regex: filters.source, $options: 'i' };
    }

    if (filters.destination) {
      query['destination.address'] = { $regex: filters.destination, $options: 'i' };
    }

    if (filters.departureDate) {
      const startDate = new Date(filters.departureDate);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      query.departureTime = {
        $gte: startDate,
        $lt: endDate
      };
    }

    if (filters.maxPrice) {
      query.pricePerSeat = { $lte: filters.maxPrice };
    }

    if (filters.minSeats) {
      query.availableSeats = { $gte: filters.minSeats };
    }

    // Execute query
    const trips = await Trip.find(query)
      .populate('driver', 'name email phone rating profilePicture')
      .populate('riders.rider', 'name email phone')
      .sort({ departureTime: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Trip.countDocuments(query);

    return {
      success: true,
      trips,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    throw error;
  }
};

// Get trip by ID
const getTripById = async (tripId) => {
  try {
    const trip = await Trip.findById(tripId)
      .populate('driver', 'name email phone rating profilePicture')
      .populate('riders.rider', 'name email phone profilePicture rating');

    if (!trip) {
      throw {
        status: 404,
        message: 'Trip not found'
      };
    }

    return {
      success: true,
      trip
    };
  } catch (error) {
    throw error;
  }
};

// Join a trip as rider
const joinTrip = async (tripId, riderId, seatsToBook = 1) => {
  try {
    const trip = await Trip.findById(tripId);

    if (!trip) {
      throw {
        status: 404,
        message: 'Trip not found'
      };
    }

    // Check if trip is available
    if (trip.status !== 'scheduled') {
      throw {
        status: 400,
        message: 'This trip is not available for booking'
      };
    }

    // Check available seats
    const availableSeats = trip.calculateAvailableSeats();
    if (availableSeats < seatsToBook) {
      throw {
        status: 400,
        message: `Only ${availableSeats} seats available`
      };
    }

    // Check if rider already joined
    const alreadyJoined = trip.riders.some(
      (rider) => rider.rider.toString() === riderId && rider.status === 'confirmed'
    );

    if (alreadyJoined) {
      throw {
        status: 400,
        message: 'You have already joined this trip'
      };
    }

    // Add rider to trip
    trip.riders.push({
      rider: riderId,
      seatsBooked: seatsToBook,
      status: 'confirmed'
    });

    await trip.save();

    // Recalculate available seats
    trip.calculateAvailableSeats();
    await trip.save();

    return {
      success: true,
      message: 'Successfully joined the trip',
      trip: await trip.populate('riders.rider', 'name email phone')
    };
  } catch (error) {
    throw error;
  }
};

// Leave a trip
const leaveTrip = async (tripId, riderId) => {
  try {
    const trip = await Trip.findById(tripId);

    if (!trip) {
      throw {
        status: 404,
        message: 'Trip not found'
      };
    }

    // Remove rider from trip
    trip.riders = trip.riders.filter((r) => r.rider.toString() !== riderId);

    await trip.save();

    // Recalculate available seats
    trip.calculateAvailableSeats();
    await trip.save();

    return {
      success: true,
      message: 'Successfully left the trip',
      trip
    };
  } catch (error) {
    throw error;
  }
};

// Cancel a trip (driver only)
const cancelTrip = async (tripId, driverId) => {
  try {
    const trip = await Trip.findById(tripId);

    if (!trip) {
      throw {
        status: 404,
        message: 'Trip not found'
      };
    }

    if (trip.driver.toString() !== driverId) {
      throw {
        status: 403,
        message: 'Only trip driver can cancel the trip'
      };
    }

    trip.status = 'cancelled';
    await trip.save();

    return {
      success: true,
      message: 'Trip cancelled successfully',
      trip
    };
  } catch (error) {
    throw error;
  }
};

// Get user's trips (as driver)
const getUserTripsAsDriver = async (driverId, page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;

    const trips = await Trip.find({ driver: driverId })
      .populate('riders.rider', 'name email phone')
      .sort({ departureTime: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Trip.countDocuments({ driver: driverId });

    return {
      success: true,
      trips,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    throw error;
  }
};

// Get user's trips (as rider)
const getUserTripsAsRider = async (riderId, page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;

    const trips = await Trip.find({
      'riders.rider': riderId,
      'riders.status': 'confirmed'
    })
      .populate('driver', 'name email phone rating')
      .sort({ departureTime: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Trip.countDocuments({
      'riders.rider': riderId,
      'riders.status': 'confirmed'
    });

    return {
      success: true,
      trips,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    throw error;
  }
};

// Update trip (driver only)
const updateTrip = async (tripId, driverId, updateData) => {
  try {
    const trip = await Trip.findById(tripId);

    if (!trip) {
      throw {
        status: 404,
        message: 'Trip not found'
      };
    }

    if (trip.driver.toString() !== driverId) {
      throw {
        status: 403,
        message: 'Only trip driver can update the trip'
      };
    }

    // Don't allow updating certain fields
    delete updateData.driver;
    delete updateData.riders;
    delete updateData.status;

    Object.assign(trip, updateData);
    await trip.save();

    return {
      success: true,
      message: 'Trip updated successfully',
      trip
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createTrip,
  getAllTrips,
  getTripById,
  joinTrip,
  leaveTrip,
  cancelTrip,
  getUserTripsAsDriver,
  getUserTripsAsRider,
  updateTrip
};
