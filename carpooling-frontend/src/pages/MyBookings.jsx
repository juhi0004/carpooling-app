import React, { useState, useEffect, useContext } from 'react';
import { MapPin, Calendar, Clock, Users, Star, Loader, X, CheckCircle, AlertCircle, DollarSign } from 'lucide-react';
import { bookings, payments } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import PaymentModal from '../components/PaymentModal';

export default function MyBookings() {
  const { isAuthenticated } = useContext(AuthContext);
  const [bookingsList, setBookingsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (isAuthenticated) {
      fetchBookings();
    }
  }, [isAuthenticated]);

  const fetchBookings = async () => {
    try {
      const response = await bookings.getMyBookings();
      setBookingsList(response.bookings || []);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await bookings.cancel(bookingId);
        setBookingsList(bookingsList.filter(b => b._id !== bookingId));
      } catch (error) {
        alert('Failed to cancel booking');
      }
    }
  };

  const handlePayment = (booking) => {
    setSelectedBooking(booking);
    setShowPaymentModal(true);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmed': return 'bg-green-100 text-green-700 border-green-300';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'confirmed': return <CheckCircle size={16} />;
      case 'cancelled': return <X size={16} />;
      default: return <AlertCircle size={16} />;
    }
  };

  const filteredBookings = filterStatus === 'all' 
    ? bookingsList 
    : bookingsList.filter(b => b.status === filterStatus);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mb-6 mx-auto">
            <Loader className="animate-spin text-blue-600" size={40} />
          </div>
          <p className="text-gray-600 font-semibold">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="text-blue-600" size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">My Bookings</h1>
              <p className="text-gray-600 mt-1">Track and manage all your rides</p>
            </div>
          </div>
          <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" />
        </div>

        {/* Filter Tabs */}
        {bookingsList.length > 0 && (
          <div className="flex space-x-3 mb-8 overflow-x-auto pb-2">
            {['all', 'pending', 'confirmed', 'cancelled'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-6 py-2.5 rounded-full font-bold whitespace-nowrap transition-all duration-200 ${
                  filterStatus === status
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300'
                }`}
              >
                {status === 'all' ? 'All Bookings' : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        )}

        {/* Bookings List */}
        {filteredBookings.length > 0 ? (
          <div className="space-y-5">
            {filteredBookings.map((booking, index) => (
              <div
                key={booking._id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-1"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Status Bar */}
                <div className={`h-1.5 ${
                  booking.status === 'confirmed' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                  booking.status === 'cancelled' ? 'bg-gradient-to-r from-red-500 to-pink-500' :
                  'bg-gradient-to-r from-yellow-500 to-orange-500'
                }`} />

                <div className="p-6 lg:p-8">
                  {/* Header Row */}
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className={`inline-flex items-center space-x-1.5 px-4 py-2 rounded-full text-sm font-bold border-2 ${getStatusColor(booking.status)}`}>
                          {getStatusIcon(booking.status)}
                          <span>{booking.status === 'confirmed' ? '✓ Confirmed' : booking.status === 'cancelled' ? '✗ Cancelled' : '⏳ Pending Payment'}</span>
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 font-mono">ID: {booking._id.slice(0, 12)}...</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl lg:text-4xl font-bold text-blue-600">₹{booking.totalPrice}</p>
                      <p className="text-xs text-gray-500 mt-1">Total Amount</p>
                    </div>
                  </div>

                  {/* Driver Info */}
                  <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-gray-100">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                        <span className="font-bold text-white text-xl">{booking.driver.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 rounded-full border-2 border-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-lg">{booking.driver.name}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex items-center space-x-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} className={i < Math.floor(booking.driver.rating || 4.8) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
                          ))}
                        </div>
                        <span className="text-sm font-semibold text-gray-700">{booking.driver.rating || 4.8}</span>
                      </div>
                    </div>
                  </div>

                  {/* Route */}
                  <div className="space-y-3.5 mb-6 pb-6 border-b border-gray-100">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <MapPin size={20} className="text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs uppercase tracking-wide font-bold text-gray-500">Pickup Point</p>
                        <p className="font-semibold text-gray-900 text-sm mt-1">{booking.pickupLocation.address}</p>
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <div className="w-0.5 h-6 bg-gray-300" />
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <MapPin size={20} className="text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs uppercase tracking-wide font-bold text-gray-500">Destination</p>
                        <p className="font-semibold text-gray-900 text-sm mt-1">{booking.dropoffLocation.address}</p>
                      </div>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                      <Calendar size={18} className="text-blue-600 mb-2" />
                      <p className="text-xs text-gray-600 uppercase font-bold">Date</p>
                      <p className="text-sm font-bold text-gray-900 mt-1">{new Date(booking.createdAt).toLocaleDateString()}</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                      <Clock size={18} className="text-purple-600 mb-2" />
                      <p className="text-xs text-gray-600 uppercase font-bold">Time</p>
                      <p className="text-sm font-bold text-gray-900 mt-1">{new Date(booking.createdAt).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</p>
                    </div>

                    <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg p-4 border border-cyan-200">
                      <Users size={18} className="text-cyan-600 mb-2" />
                      <p className="text-xs text-gray-600 uppercase font-bold">Seats</p>
                      <p className="text-sm font-bold text-gray-900 mt-1">{booking.numberOfSeats}</p>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                      <DollarSign size={18} className="text-orange-600 mb-2" />
                      <p className="text-xs text-gray-600 uppercase font-bold">Per Seat</p>
                      <p className="text-sm font-bold text-orange-600 mt-1">₹{Math.floor(booking.totalPrice / booking.numberOfSeats)}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    {booking.status === 'pending' && (
                      <button
                        onClick={() => handlePayment(booking)}
                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 rounded-lg font-bold transition-all duration-200 hover:shadow-lg flex items-center justify-center space-x-2"
                      >
                        <DollarSign size={20} />
                        <span>Pay Now</span>
                      </button>
                    )}
                    {booking.status !== 'cancelled' && (
                      <button
                        onClick={() => handleCancelBooking(booking._id)}
                        className="flex-1 border-2 border-red-500 text-red-600 hover:bg-red-50 py-3 rounded-lg font-bold transition-colors"
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100">
            <div className="inline-block p-6 bg-gray-100 rounded-full mb-6">
              <Users size={56} className="text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-2">No Bookings Yet</p>
            <p className="text-gray-600 mb-8">Start your journey by searching and booking a ride</p>
            <a
              href="/rides"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold transition-colors"
            >
              Search Rides
            </a>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && selectedBooking && (
          <PaymentModal
            booking={selectedBooking}
            onClose={() => setShowPaymentModal(false)}
            onSuccess={() => {
              setShowPaymentModal(false);
              fetchBookings();
            }}
          />
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
