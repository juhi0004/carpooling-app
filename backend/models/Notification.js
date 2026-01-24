const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    // Recipient
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Notification Type
    type: {
      type: String,
      enum: ['trip_available', 'rider_joined', 'trip_started', 'payment_received', 'trip_completed'],
      required: true,
    },

    // Content
    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    // Related Entities
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
    },

    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
    },

    // Status
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed'],
      default: 'pending',
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    // Delivery Channels
    channels: [
      {
        type: {
          type: String,
          enum: ['email', 'sms', 'in_app'],
        },

        status: {
          type: String,
          enum: ['pending', 'sent', 'failed'],
          default: 'pending',
        },

        sentAt: Date,

        error: String,
      },
    ],

    // Additional Data
    data: {
      driverName: String,
      riderName: String,
      tripDetails: {
        source: String,
        destination: String,
        departureTime: Date,
      },
      amount: Number,
    },

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
    },

    readAt: Date,

    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  },
  { timestamps: true }
);

// Index for searching
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
