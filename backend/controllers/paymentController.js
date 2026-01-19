const paymentService = require('../services/paymentService');

class PaymentController {
  // Create payment order
  async createOrder(req, res) {
    try {
      const { tripId, amount } = req.body;

      if (!tripId || !amount) {
        return res.status(400).json({
          success: false,
          message: 'tripId and amount are required',
        });
      }

      const order = await paymentService.createOrder(tripId, req.user.id, amount);

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        order,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Verify payment
  async verifyPayment(req, res) {
    try {
      const { orderId, paymentId, signature } = req.body;

      if (!orderId || !paymentId || !signature) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields',
        });
      }

      const payment = await paymentService.verifyPayment(orderId, paymentId, signature);

      res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        payment,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Handle payment failure
  async handlePaymentFailure(req, res) {
    try {
      const { orderId, reason } = req.body;

      if (!orderId) {
        return res.status(400).json({
          success: false,
          message: 'orderId is required',
        });
      }

      const payment = await paymentService.handlePaymentFailure(orderId, reason);

      res.status(200).json({
        success: true,
        message: 'Payment failure recorded',
        payment,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get wallet
  async getWallet(req, res) {
    try {
      const wallet = await paymentService.getWallet(req.user.id);

      res.status(200).json({
        success: true,
        wallet,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get payment history
  async getPaymentHistory(req, res) {
    try {
      const { status, page, limit } = req.query;

      const result = await paymentService.getPaymentHistory(req.user.id, {
        status,
        page,
        limit,
      });

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get transaction history
  async getTransactionHistory(req, res) {
    try {
      const { type, reason, page, limit } = req.query;

      const result = await paymentService.getTransactionHistory(req.user.id, {
        type,
        reason,
        page,
        limit,
      });

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Process refund
  async processRefund(req, res) {
    try {
      const { paymentId, reason } = req.body;

      if (!paymentId || !reason) {
        return res.status(400).json({
          success: false,
          message: 'paymentId and reason are required',
        });
      }

      const payment = await paymentService.processRefund(paymentId, req.user.id, reason);

      res.status(200).json({
        success: true,
        message: 'Refund processed successfully',
        payment,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Request withdrawal
  async requestWithdrawal(req, res) {
    try {
      const { amount, bankDetails } = req.body;

      if (!amount || !bankDetails) {
        return res.status(400).json({
          success: false,
          message: 'amount and bankDetails are required',
        });
      }

      const result = await paymentService.requestWithdrawal(
        req.user.id,
        amount,
        bankDetails
      );

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new PaymentController();
