const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Wallet = require('../models/Wallet');
const Trip = require('../models/Trip');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});

class PaymentService {
  // Create payment order
  async createOrder(tripId, riderId, amount) {
    try {
      // Create Razorpay order
      const options = {
        amount: Math.round(amount * 100), // Amount in paise
        currency: 'INR',
        receipt: `trip_${tripId}_${riderId}`,
      };

      const razorpayOrder = await razorpay.orders.create(options);

      // Get trip details
      const trip = await Trip.findById(tripId).populate('driver');

      if (!trip) {
        throw new Error('Trip not found');
      }

      // Create payment record
      const payment = new Payment({
        rider: riderId,
        driver: trip.driver._id,
        trip: tripId,
        amount,
        razorpayOrderId: razorpayOrder.id,
        status: 'pending',
      });

      await payment.save();

      return {
        orderId: razorpayOrder.id,
        amount,
        currency: 'INR',
        paymentId: payment._id,
      };
    } catch (error) {
      throw new Error(`Error creating order: ${error.message}`);
    }
  }

  // Verify payment
  async verifyPayment(orderId, paymentId, signature) {
    try {
      // Verify signature
      const signatureBody = `${orderId}|${paymentId}`;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_SECRET_KEY)
        .update(signatureBody)
        .digest('hex');

      if (expectedSignature !== signature) {
        throw new Error('Invalid signature - payment not verified');
      }

      // Update payment
      const payment = await Payment.findOne({ razorpayOrderId: orderId });

      if (!payment) {
        throw new Error('Payment record not found');
      }

      payment.razorpayPaymentId = paymentId;
      payment.razorpaySignature = signature;
      payment.status = 'completed';
      payment.completedAt = new Date();

      await payment.save();

      // Add rider to trip
      const trip = await Trip.findById(payment.trip);
      trip.riders.push({
        rider: payment.rider,
        seatsBooked: payment.seatsBooked,
        status: 'confirmed',
      });
      trip.availableSeats -= payment.seatsBooked;
      await trip.save();

      // Update wallets
      await this.addTransaction(
        payment.rider,
        'debit',
        payment.amount,
        'trip_payment',
        payment._id,
        payment.trip
      );

      await this.addTransaction(
        payment.driver,
        'credit',
        payment.amount,
        'trip_earning',
        payment._id,
        payment.trip
      );

      return payment;
    } catch (error) {
      throw new Error(`Error verifying payment: ${error.message}`);
    }
  }

  // Handle payment failure
  async handlePaymentFailure(orderId, reason) {
    try {
      const payment = await Payment.findOne({ razorpayOrderId: orderId });

      if (!payment) {
        throw new Error('Payment not found');
      }

      payment.status = 'failed';
      payment.failureReason = reason;

      await payment.save();

      return payment;
    } catch (error) {
      throw new Error(`Error handling payment failure: ${error.message}`);
    }
  }

  // Get wallet
  async getWallet(userId) {
    try {
      let wallet = await Wallet.findOne({ user: userId });

      if (!wallet) {
        // Create wallet if doesn't exist
        wallet = new Wallet({ user: userId });
        await wallet.save();
      }

      return wallet;
    } catch (error) {
      throw new Error(`Error fetching wallet: ${error.message}`);
    }
  }

  // Add transaction to wallet
  async addTransaction(userId, type, amount, reason, paymentId, tripId, description = '') {
    try {
      let wallet = await Wallet.findOne({ user: userId });

      if (!wallet) {
        wallet = new Wallet({ user: userId });
      }

      // Update balance
      if (type === 'credit') {
        wallet.balance += amount;
        wallet.totalEarned += amount;
        wallet.pendingAmount += amount;
      } else if (type === 'debit') {
        if (wallet.balance < amount) {
          throw new Error('Insufficient wallet balance');
        }
        wallet.balance -= amount;
        wallet.totalSpent += amount;
      }

      // Add transaction record
      wallet.transactions.push({
        type,
        amount,
        reason,
        payment: paymentId,
        trip: tripId,
        description,
        timestamp: new Date(),
      });

      await wallet.save();

      return wallet;
    } catch (error) {
      throw new Error(`Error adding transaction: ${error.message}`);
    }
  }

  // Process refund
  async processRefund(paymentId, userId, reason) {
    try {
      const payment = await Payment.findById(paymentId);

      if (!payment) {
        throw new Error('Payment not found');
      }

      if (payment.status !== 'completed') {
        throw new Error('Can only refund completed payments');
      }

      if (payment.rider.toString() !== userId && payment.driver.toString() !== userId) {
        throw new Error('Unauthorized to refund this payment');
      }

      // Create Razorpay refund
      const refund = await razorpay.payments.refund(payment.razorpayPaymentId, {
        amount: Math.round(payment.amount * 100),
      });

      // Update payment
      payment.status = 'refunded';
      payment.refundAmount = payment.amount;
      payment.refundId = refund.id;
      payment.refundReason = reason;
      payment.refundStatus = 'completed';
      payment.refundedAt = new Date();

      await payment.save();

      // Remove rider from trip
      const trip = await Trip.findById(payment.trip);
      const riderIndex = trip.riders.findIndex(
        (r) => r.rider.toString() === payment.rider.toString()
      );

      if (riderIndex !== -1) {
        const seatsBooked = trip.riders[riderIndex].seatsBooked;
        trip.riders.splice(riderIndex, 1);
        trip.availableSeats += seatsBooked;
        await trip.save();
      }

      // Refund to wallet
      await this.addTransaction(
        payment.rider,
        'credit',
        payment.amount,
        'refund',
        payment._id,
        payment.trip,
        `Refund for cancelled trip: ${reason}`
      );

      return payment;
    } catch (error) {
      throw new Error(`Error processing refund: ${error.message}`);
    }
  }

  // Get payment history
  async getPaymentHistory(userId, filters = {}) {
    try {
      const query = {
        $or: [{ rider: userId }, { driver: userId }],
      };

      if (filters.status) {
        query.status = filters.status;
      }

      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 10;
      const skip = (page - 1) * limit;

      const payments = await Payment.find(query)
        .populate('rider', 'name email')
        .populate('driver', 'name email')
        .populate('trip', 'source destination')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip);

      const total = await Payment.countDocuments(query);

      return {
        payments,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new Error(`Error fetching payment history: ${error.message}`);
    }
  }

  // Withdraw from wallet
  async requestWithdrawal(userId, amount, bankDetails) {
    try {
      const wallet = await this.getWallet(userId);

      if (wallet.balance < amount) {
        throw new Error('Insufficient balance');
      }

      if (!wallet.kycVerified) {
        throw new Error('KYC verification required for withdrawal');
      }

      // Create withdrawal record
      wallet.balance -= amount;

      wallet.transactions.push({
        type: 'debit',
        amount,
        reason: 'withdrawal',
        description: 'Withdrawal to bank account',
        timestamp: new Date(),
      });

      await wallet.save();

      // In production: Integrate with payout service (Razorpay Payouts)
      // For now: Just record the transaction

      return {
        success: true,
        message: 'Withdrawal request submitted',
        amount,
      };
    } catch (error) {
      throw new Error(`Error requesting withdrawal: ${error.message}`);
    }
  }

  // Get transaction history for wallet
  async getTransactionHistory(userId, filters = {}) {
    try {
      const wallet = await this.getWallet(userId);

      let transactions = wallet.transactions;

      if (filters.type) {
        transactions = transactions.filter((t) => t.type === filters.type);
      }

      if (filters.reason) {
        transactions = transactions.filter((t) => t.reason === filters.reason);
      }

      // Sort by timestamp (newest first)
      transactions.sort((a, b) => b.timestamp - a.timestamp);

      // Pagination
      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 20;
      const skip = (page - 1) * limit;

      const paginatedTransactions = transactions.slice(skip, skip + limit);

      return {
        transactions: paginatedTransactions,
        pagination: {
          total: transactions.length,
          page,
          limit,
          pages: Math.ceil(transactions.length / limit),
        },
      };
    } catch (error) {
      throw new Error(`Error fetching transaction history: ${error.message}`);
    }
  }
}

module.exports = new PaymentService();
