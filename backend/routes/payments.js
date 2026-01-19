const express = require('express');
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Protected routes
router.post('/order', authMiddleware, paymentController.createOrder);
router.post('/verify', paymentController.verifyPayment); // Webhook - no auth needed
router.post('/failure', paymentController.handlePaymentFailure); // Webhook - no auth needed
router.get('/history', authMiddleware, paymentController.getPaymentHistory);
router.post('/refund', authMiddleware, paymentController.processRefund);
router.get('/wallet', authMiddleware, paymentController.getWallet);
router.get('/transactions', authMiddleware, paymentController.getTransactionHistory);
router.post('/withdraw', authMiddleware, paymentController.requestWithdrawal);

module.exports = router;
