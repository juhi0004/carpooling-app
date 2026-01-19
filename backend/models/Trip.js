const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema(
  {
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Trip must have a driver']
    },
    source: {
      address: {
        type: String,
        required: [true, 'Please provide source address']
      },
      latitude: {
        type: Number,
        required: [true, 'Please provide source latitude']
      },
      longitude: {
        type: Number,
        required: [true, 'Please provide source longitude']
      }
    },
    destination: {
      address: {
        type: String,
        required: [true, 'Please provide destination address']
      },
      latitude: {
        type: Number,
        required: [true, 'Please provide destination latitude']
      },
      longitude: {
        type: Number,
        required: [true, 'Please provide destination longitude']
      }
    },
    departureTime: {
      type: Date,
      required: [true, 'Please provide departure time']
    },
    estimatedDuration: {
      type: Number, // in minutes
      required: [true, 'Please provide estimated duration']
    },
    distance: {
      type: Number, // in km
      required: [true, 'Please provide distance']
    },
    pricePerSeat: {
      type: Number,
      required: [true, 'Please provide price per seat']
    },
    totalSeats: {
      type: Number,
      required: [true, 'Please provide total seats'],
      min: 1,
      max: 7
    },
    availableSeats: {
      type: Number,
      required: true
    },
    riders: [
      {
        rider: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        seatsBooked: {
          type: Number,
          default: 1
        },
        status: {
          type: String,
          enum: ['pending', 'confirmed', 'completed', 'cancelled'],
          default: 'pending'
        },
        joinedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    status: {
      type: String,
      enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
      default: 'scheduled'
    },
    description: {
      type: String,
      maxlength: 500
    },
    tripType: {
      type: String,
      enum: ['regular', 'express', 'shared'],
      default: 'regular'
    },
    allowedGender: {
      type: String,
      enum: ['all', 'female', 'male'],
      default: 'all'
    },
    vehicleDetails: {
      model: String,
      color: String,
      licensePlate: String,
      seatingCapacity: Number
    },
    rating: {
      type: Number,
      default: null,
      min: 1,
      max: 5
    },
    reviews: [
      {
        rider: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        rating: {
          type: Number,
          min: 1,
          max: 5
        },
        comment: String,
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Index for searching trips
tripSchema.index({ 'source.address': 'text', 'destination.address': 'text' });
tripSchema.index({ departureTime: 1 });
tripSchema.index({ driver: 1 });
tripSchema.index({ status: 1 });

// Update availableSeats when riders join
tripSchema.methods.calculateAvailableSeats = function () {
  let bookedSeats = 0;
  this.riders.forEach((rider) => {
    if (rider.status === 'confirmed') {
      bookedSeats += rider.seatsBooked;
    }
  });
  this.availableSeats = this.totalSeats - bookedSeats;
  return this.availableSeats;
};

module.exports = mongoose.model('Trip', tripSchema);
