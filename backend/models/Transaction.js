const mongoose = require('mongoose');

// Transaction Schema
const transactionSchema = new mongoose.Schema(
  {
    // User Reference
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide a user ID']
    },
    
    // Transaction Identifier
    transactionId: {
      type: String,
      required: [true, 'Please provide a transaction ID'],
      unique: true,
      trim: true
    },
    
    // Amount Information
    amount: {
      type: Number,
      required: [true, 'Please provide an amount'],
      min: [0.01, 'Amount must be greater than 0']
    },
    
    // Transaction Type
    type: {
      type: String,
      enum: ['credit', 'debit', 'ride_payment', 'refund', 'bonus'],
      required: [true, 'Please specify transaction type']
    },
    
    // Payment Method
    paymentMethod: {
      type: String,
      enum: ['upi', 'credit_card', 'debit_card', 'net_banking', 'wallet', 'cash'],
      required: function() {
        return this.type === 'credit';
      }
    },
    
    // Transaction Status
    status: {
      type: String,
      enum: ['success', 'pending', 'failed', 'cancelled'],
      default: 'pending'
    },
    
    // For Ride Payments
    rideId: {
      type: String,
      default: null
    },
    
    passengerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    
    // For Withdrawals
    bankAccount: {
      accountNumber: String,
      accountHolderName: String,
      bankName: String,
      ifscCode: String
    },
    
    // Balance Information
    previousBalance: {
      type: Number,
      required: true
    },
    
    newBalance: {
      type: Number,
      required: true
    },
    
    // Transaction Details
    description: {
      type: String,
      required: true,
      trim: true
    },
    
    notes: {
      type: String,
      default: ''
    },
    
    // Receipt Information
    receipt: {
      type: String,
      default: null
    },
    
    // Refund Information
    refundTransactionId: {
      type: String,
      default: null
    },
    
    // Metadata
    metadata: {
      ipAddress: String,
      deviceInfo: String,
      location: String
    },
    
    // Timestamps
    completedAt: Date,
    
    // For Scheduled Transactions
    scheduledFor: Date,
    
    // Tax and Fees
    fee: {
      type: Number,
      default: 0,
      min: [0, 'Fee cannot be negative']
    },
    
    tax: {
      type: Number,
      default: 0,
      min: [0, 'Tax cannot be negative']
    }
  },
  {
    timestamps: true // Adds createdAt and updatedAt
  }
);

// Indexes for faster queries
transactionSchema.index({ userId: 1 });
transactionSchema.index({ transactionId: 1 });
transactionSchema.index({ createdAt: -1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ rideId: 1 });

// Virtual for transaction duration (pending time)
transactionSchema.virtual('pendingDuration').get(function() {
  if (this.status === 'success' && this.completedAt) {
    return this.completedAt - this.createdAt;
  }
  return null;
});

// Method to mark transaction as completed
transactionSchema.methods.markAsCompleted = function() {
  this.status = 'success';
  this.completedAt = new Date();
};

// Method to mark transaction as failed
transactionSchema.methods.markAsFailed = function(reason = '') {
  this.status = 'failed';
  this.notes = reason;
};

// Method to cancel transaction
transactionSchema.methods.cancel = function() {
  if (this.status === 'success') {
    throw new Error('Cannot cancel completed transaction');
  }
  this.status = 'cancelled';
};

// Method to get transaction summary
transactionSchema.methods.getSummary = function() {
  return {
    transactionId: this.transactionId,
    amount: this.amount,
    type: this.type,
    status: this.status,
    date: this.createdAt,
    description: this.description
  };
};

// Static method to find transactions by user
transactionSchema.statics.findByUser = function(userId, limit = 10, offset = 0) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(offset);
};

// Static method to get transaction statistics
transactionSchema.statics.getStats = function(userId) {
  return this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId), status: 'success' } },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        total: { $sum: '$amount' },
        average: { $avg: '$amount' }
      }
    }
  ]);
};

// Create Model
const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
