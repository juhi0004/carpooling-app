const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    // References
    rider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
    },

    // Payment Details
    amount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: 'INR',
    },

    pricePerSeat: {
      type: Number,
      required: true,
    },

    seatsBooked: {
      type: Number,
      required: true,
    },

    // Razorpay Details
    razorpayOrderId: {
      type: String,
      unique: true,
      sparse: true,
    },

    razorpayPaymentId: {
      type: String,
      unique: true,
      sparse: true,
    },

    razorpaySignature: String,

    // Payment Status
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },

    paymentMethod: {
      type: String,
      enum: ['card', 'upi', 'wallet', 'netbanking'],
      default: 'card',
    },

    // Refund Details
    refundAmount: {
      type: Number,
      default: 0,
    },

    refundId: String,

    refundReason: String,

    refundStatus: {
      type: String,
      enum: ['none', 'pending', 'completed', 'failed'],
      default: 'none',
    },

    // Error Tracking
    failureReason: String,

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
    },

    completedAt: Date,

    refundedAt: Date,
  },
  { timestamps: true }
);

// Index for searching payments
paymentSchema.index({ rider: 1, status: 1 });
paymentSchema.index({ driver: 1, status: 1 });
paymentSchema.index({ trip: 1 });

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
