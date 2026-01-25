// Wallet Service
// Handles all wallet and payment-related business logic
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');

class WalletService {
  constructor() {
    // In-memory storage (will be replaced with MongoDB)
    this.wallets = {};
    this.transactions = [];
    this.transactionIdCounter = 1;
  }

  // Get wallet for user
async getWallet(userId) {
  try {
    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = await Wallet.create({ userId, balance: 0 });
    }
    return { success: true, wallet };
  } catch (error) {
    return { success: false, error: error.message };
  }
}


  // Get wallet balance
  async getBalance(userId) {
    try {
      if (!this.wallets[userId]) {
        this.wallets[userId] = {
          userId: userId,
          balance: 0,
          currency: 'INR',
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }

      return {
        success: true,
        balance: this.wallets[userId].balance,
        currency: 'INR',
        message: 'Balance retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Add money to wallet
  async addMoney(userId, amount, paymentMethod, transactionId) {
    try {
      // Validation
      if (!amount || amount <= 0) {
        return {
          success: false,
          error: 'Invalid amount. Must be greater than 0',
          statusCode: 400
        };
      }

      if (!paymentMethod) {
        return {
          success: false,
          error: 'Payment method required',
          statusCode: 400
        };
      }

      // Initialize wallet if doesn't exist
      if (!this.wallets[userId]) {
        this.wallets[userId] = {
          userId: userId,
          balance: 0,
          currency: 'INR',
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }

      // Add money
      const previousBalance = this.wallets[userId].balance;
      this.wallets[userId].balance += amount;
      this.wallets[userId].updatedAt = new Date();

      // Create transaction record
      const transaction = {
        transactionId: transactionId || `TXN-${this.transactionIdCounter++}`,
        userId: userId,
        amount: amount,
        type: 'credit',
        paymentMethod: paymentMethod,
        status: 'success',
        previousBalance: previousBalance,
        newBalance: this.wallets[userId].balance,
        timestamp: new Date(),
        description: `Added ${amount} INR via ${paymentMethod}`
      };

      // TODO: Save transaction to Transaction model
      this.transactions.push(transaction);

      return {
        success: true,
        transaction: transaction,
        newBalance: this.wallets[userId].balance,
        message: `₹${amount} added successfully`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Withdraw money from wallet
  async withdrawMoney(userId, amount, bankAccount) {
    try {
      // Validation
      if (!amount || amount <= 0) {
        return {
          success: false,
          error: 'Invalid amount',
          statusCode: 400
        };
      }

      if (!bankAccount) {
        return {
          success: false,
          error: 'Bank account required for withdrawal',
          statusCode: 400
        };
      }

      // Check wallet exists
      if (!this.wallets[userId]) {
        return {
          success: false,
          error: 'Wallet not found',
          statusCode: 404
        };
      }

      // Check sufficient balance
      if (this.wallets[userId].balance < amount) {
        return {
          success: false,
          error: 'Insufficient balance',
          statusCode: 400
        };
      }

      // Process withdrawal
      const previousBalance = this.wallets[userId].balance;
      this.wallets[userId].balance -= amount;
      this.wallets[userId].updatedAt = new Date();

      // Create withdrawal transaction
      const transaction = {
        transactionId: `WD-${this.transactionIdCounter++}`,
        userId: userId,
        amount: amount,
        type: 'debit',
        bankAccount: bankAccount,
        status: 'pending',
        previousBalance: previousBalance,
        newBalance: this.wallets[userId].balance,
        timestamp: new Date(),
        estimatedCompletion: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        description: `Withdrawal to ${bankAccount}`
      };

      // TODO: Save transaction to Transaction model
      this.transactions.push(transaction);

      return {
        success: true,
        transaction: transaction,
        newBalance: this.wallets[userId].balance,
        message: 'Withdrawal initiated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get transaction history
  async getTransactionHistory(userId, limit = 10, offset = 0) {
    try {
      // Filter transactions for user
      const userTransactions = this.transactions
        .filter(t => t.userId === userId)
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(offset, offset + limit);

      return {
        success: true,
        transactions: userTransactions,
        count: userTransactions.length,
        total: this.transactions.filter(t => t.userId === userId).length,
        limit: limit,
        offset: offset,
        message: 'Transaction history retrieved'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Pay for a ride
  async payForRide(userId, rideId, amount, driverId) {
    try {
      // Validation
      if (!rideId || !amount || !driverId) {
        return {
          success: false,
          error: 'Missing required fields: rideId, amount, driverId',
          statusCode: 400
        };
      }

      if (amount <= 0) {
        return {
          success: false,
          error: 'Invalid amount',
          statusCode: 400
        };
      }

      // Check wallet exists
      if (!this.wallets[userId]) {
        return {
          success: false,
          error: 'Wallet not found',
          statusCode: 404
        };
      }

      // Check sufficient balance
      if (this.wallets[userId].balance < amount) {
        return {
          success: false,
          error: 'Insufficient balance for ride payment',
          statusCode: 400
        };
      }

      // Process payment
      const previousBalance = this.wallets[userId].balance;
      this.wallets[userId].balance -= amount;
      this.wallets[userId].updatedAt = new Date();

      // Create payment transaction
      const transaction = {
        transactionId: `PAY-${this.transactionIdCounter++}`,
        rideId: rideId,
        passengerId: userId,
        driverId: driverId,
        amount: amount,
        type: 'ride_payment',
        status: 'success',
        previousBalance: previousBalance,
        newBalance: this.wallets[userId].balance,
        timestamp: new Date(),
        receipt: `REC-${rideId}-${userId}`,
        description: `Payment for ride ${rideId}`
      };

      // TODO: Save transaction to Transaction model
      // TODO: Add amount to driver's wallet
      this.transactions.push(transaction);

      return {
        success: true,
        payment: transaction,
        newBalance: this.wallets[userId].balance,
        receipt: transaction.receipt,
        message: `Payment of ₹${amount} processed`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Check if user has sufficient balance
  async hasSufficientBalance(userId, amount) {
    try {
      if (!this.wallets[userId]) {
        return {
          success: false,
          sufficient: false,
          currentBalance: 0
        };
      }

      return {
        success: true,
        sufficient: this.wallets[userId].balance >= amount,
        currentBalance: this.wallets[userId].balance,
        requiredAmount: amount,
        shortage: Math.max(0, amount - this.wallets[userId].balance)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get wallet statistics
  async getWalletStats(userId) {
    try {
      const userTransactions = this.transactions.filter(t => t.userId === userId);
      
      const stats = {
        userId: userId,
        currentBalance: this.wallets[userId]?.balance || 0,
        totalCredit: userTransactions
          .filter(t => t.type === 'credit')
          .reduce((sum, t) => sum + t.amount, 0),
        totalDebit: userTransactions
          .filter(t => t.type === 'debit')
          .reduce((sum, t) => sum + t.amount, 0),
        totalRidePayments: userTransactions
          .filter(t => t.type === 'ride_payment')
          .reduce((sum, t) => sum + t.amount, 0),
        transactionCount: userTransactions.length,
        lastTransaction: userTransactions?.timestamp || null
      };

      return {
        success: true,
        stats: stats,
        message: 'Wallet statistics retrieved'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Create singleton instance
const walletService = new WalletService();

module.exports = walletService;
