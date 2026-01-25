const mongoose = require('mongoose');

// Wallet Schema
const walletSchema = new mongoose.Schema(
  {
    // User Reference
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide a user ID'],
      unique: true
    },
    
    // Balance Information
    balance: {
      type: Number,
      default: 0,
      min: [0, 'Balance cannot be negative'],
      required: true
    },
    
    currency: {
      type: String,
      default: 'INR',
      enum: ['INR', 'USD', 'EUR']
    },
    
    // Statistics
    totalCredit: {
      type: Number,
      default: 0,
      min: [0, 'Total credit cannot be negative']
    },
    
    totalDebit: {
      type: Number,
      default: 0,
      min: [0, 'Total debit cannot be negative']
    },
    
    totalRidePayments: {
      type: Number,
      default: 0,
      min: [0, 'Total ride payments cannot be negative']
    },
    
    transactionCount: {
      type: Number,
      default: 0,
      min: [0, 'Transaction count cannot be negative']
    },
    
    // Wallet Status
    isActive: {
      type: Boolean,
      default: true
    },
    
    // Bank Account for Withdrawals
    bankAccount: {
      accountHolderName: String,
      accountNumber: String,
      ifscCode: String,
      bankName: String,
      isVerified: {
        type: Boolean,
        default: false
      }
    },
    
    // Payment Methods
    paymentMethods: [
      {
        type: {
          type: String,
          enum: ['credit_card', 'debit_card', 'upi', 'net_banking'],
          required: true
        },
        isDefault: Boolean,
        isVerified: {
          type: Boolean,
          default: false
        },
        addedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    
    // Last Transaction
    lastTransactionAt: Date,
    lastTransactionType: String
  },
  {
    timestamps: true
  }
);

// Index for faster queries
walletSchema.index({ userId: 1 });
walletSchema.index({ balance: 1 });

// Virtual for wallet status
walletSchema.virtual('balanceStatus').get(function() {
  if (this.balance === 0) return 'empty';
  if (this.balance < 100) return 'low';
  if (this.balance < 1000) return 'moderate';
  return 'healthy';
});

// Method to add money
walletSchema.methods.addMoney = function(amount) {
  this.balance += amount;
  this.totalCredit += amount;
  this.transactionCount += 1;
  this.lastTransactionAt = new Date();
  this.lastTransactionType = 'credit';
};

// Method to deduct money
walletSchema.methods.deductMoney = function(amount) {
  if (this.balance < amount) {
    throw new Error('Insufficient balance');
  }
  this.balance -= amount;
  this.totalDebit += amount;
  this.transactionCount += 1;
  this.lastTransactionAt = new Date();
  this.lastTransactionType = 'debit';
};

// Method to process ride payment
walletSchema.methods.payForRide = function(amount) {
  if (this.balance < amount) {
    throw new Error('Insufficient balance for ride payment');
  }
  this.balance -= amount;
  this.totalRidePayments += amount;
  this.totalDebit += amount;
  this.transactionCount += 1;
  this.lastTransactionAt = new Date();
  this.lastTransactionType = 'ride_payment';
};

// Create Model
const Wallet = mongoose.model('Wallet', walletSchema);

module.exports = Wallet;
