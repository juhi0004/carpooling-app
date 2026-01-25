import React, { useState } from 'react';
import { X, Loader, CreditCard, Lock, Zap, CheckCircle, AlertCircle } from 'lucide-react';
import { payments } from '../services/api';

export default function PaymentModal({ booking, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      // Create Razorpay order
      const orderResponse = await payments.createOrder(booking._id);
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: booking.totalPrice * 100,
        currency: 'INR',
        name: 'CarPool',
        description: `Payment for booking ${booking._id}`,
        order_id: orderResponse.id,
        handler: async (response) => {
          try {
            await payments.verify({
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
              bookingId: booking._id
            });
            setSuccess(true);
            setTimeout(() => onSuccess(), 1500);
          } catch (err) {
            setError('Payment verification failed');
          }
        },
        prefill: {
          email: booking.passenger.email,
          contact: booking.passenger.phone
        },
        theme: {
          color: '#3B82F6'
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-cyan-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <CreditCard className="text-blue-600" size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Complete Payment</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-lg transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Error State */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-bold text-red-900 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Success State */}
          {success && (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 flex items-start space-x-3">
              <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-bold text-green-900 text-sm">Payment Successful!</p>
                <p className="text-green-700 text-xs mt-1">Your booking is confirmed. Redirecting...</p>
              </div>
            </div>
          )}

          {/* Booking Summary */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 space-y-4 border border-blue-200">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-semibold">Booking ID</span>
              <span className="font-mono text-xs font-bold text-gray-900 bg-white px-3 py-1 rounded">{booking._id.slice(0, 12)}...</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-semibold">Number of Seats</span>
              <span className="font-bold text-gray-900">{booking.numberOfSeats}</span>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-blue-200">
              <span className="text-gray-600 font-semibold">Total Amount</span>
              <span className="text-3xl font-bold text-blue-600">₹{booking.totalPrice}</span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="border-2 border-blue-600 rounded-xl p-5 flex items-center space-x-4 bg-blue-50">
            <div className="p-3 bg-blue-600 rounded-full">
              <Lock className="text-white" size={20} />
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-900">Secure Payment</p>
              <p className="text-sm text-gray-600">Via Razorpay - India's Trusted Payment Gateway</p>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center space-x-1">
              <Zap size={16} className="text-yellow-500" />
              <span>Instant Processing</span>
            </div>
            <div className="flex items-center space-x-1">
              <Lock size={16} className="text-green-600" />
              <span>100% Secure</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={loading || success}
              className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-bold hover:border-gray-400 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handlePayment}
              disabled={loading || success}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 rounded-lg font-bold transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2 hover:shadow-lg"
            >
              {loading ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : success ? (
                <>
                  <CheckCircle size={20} />
                  <span>Paid</span>
                </>
              ) : (
                <>
                  <CreditCard size={20} />
                  <span>Pay ₹{booking.totalPrice}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}