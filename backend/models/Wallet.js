const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema(
  {
    // User reference
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    // Balance Info
    balance: {
      type: Number,
      default: 0,
    },

    totalEarned: {
      type: Number,
      default: 0, // For drivers
    },

    totalSpent: {
      type: Number,
      default: 0, // For riders
    },

    // Pending Amount (from rides, awaiting settlement)
    pendingAmount: {
      type: Number,
      default: 0,
    },

    // Transactions History
    transactions: [
      {
        type: {
          type: String,
          enum: ['credit', 'debit'],
        },

        amount: Number,

        reason: {
          type: String,
          enum: [
            'trip_payment',
            'trip_earning',
            'refund',
            'wallet_topup',
            'withdrawal',
            'admin_credit',
            'admin_debit',
          ],
        },

        payment: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Payment',
        },

        trip: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Trip',
        },

        description: String,

        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // KYC for Drivers (for payouts)
    kycVerified: {
      type: Boolean,
      default: false,
    },

    bankDetails: {
      accountHolderName: String,
      accountNumber: String,
      ifscCode: String,
      bankName: String,
    },

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for searching
walletSchema.index({ user: 1 });

const Wallet = mongoose.model('Wallet', walletSchema);

module.exports = Wallet;
