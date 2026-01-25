// src/pages/CreateRide.jsx
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Clock, Users, DollarSign, Car, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import { rides } from '../services/api';
import { AuthContext } from '../context/AuthContext';

export default function CreateRide() {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    from: { address: '', latitude: 0, longitude: 0 },
    to: { address: '', latitude: 0, longitude: 0 },
    departureTime: '',
    totalSeats: 4,
    pricePerSeat: 500,
    rideType: 'shared',
    description: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('from.') || name.startsWith('to.')) {
      const [location, field] = name.split('.');
      setFormData({
        ...formData,
        [location]: { ...formData[location], [field]: value }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await rides.create(formData);
      setSuccess(true);
      setTimeout(() => navigate('/bookings'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create ride');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md border border-gray-100">
          <div className="inline-block p-4 bg-red-100 rounded-full mb-6">
            <AlertCircle className="text-red-600" size={32} />
          </div>
          <p className="text-lg font-semibold text-gray-900 mb-2">Authentication Required</p>
          <p className="text-gray-600 mb-6">Please login to create a ride</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-block p-3 bg-blue-100 rounded-full mb-4">
            <Car className="text-blue-600" size={32} />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-3">Create Your Ride</h1>
          <p className="text-gray-600 text-lg">Share your journey and earn money</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-8 flex items-start space-x-4">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={24} />
            <div>
              <p className="font-bold text-red-900">Error</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-8 flex items-start space-x-4">
            <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={24} />
            <div>
              <p className="font-bold text-green-900">Success!</p>
              <p className="text-green-700 text-sm mt-1">Your ride has been created. Redirecting...</p>
            </div>
          </div>
        )}

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-12">
          {[1, 2, 3].map((step) => (
            <React.Fragment key={step}>
              <div
                className={`w-12 h-12 rounded-full font-bold text-lg flex items-center justify-center transition-all duration-300 ${
                  currentStep >= step
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step}
              </div>
              {step < 3 && (
                <div
                  className={`flex-1 h-1 mx-2 transition-all duration-300 ${
                    currentStep > step ? 'bg-gradient-to-r from-blue-600 to-cyan-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1: Route Details */}
          {currentStep === 1 && (
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Route Details</h2>

              {/* From */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center space-x-2">
                  <MapPin size={18} className="text-blue-600" />
                  <span>Pickup Location</span>
                </label>
                <input
                  type="text"
                  name="from.address"
                  value={formData.from.address}
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white text-gray-900 font-medium"
                  placeholder="Enter pickup location (e.g., Bangalore Central)"
                  required
                />
              </div>

              {/* To */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center space-x-2">
                  <MapPin size={18} className="text-green-600" />
                  <span>Drop Location</span>
                </label>
                <input
                  type="text"
                  name="to.address"
                  value={formData.to.address}
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white text-gray-900 font-medium"
                  placeholder="Enter destination (e.g., Mumbai Central)"
                  required
                />
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-end space-x-4 mt-8">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-3 rounded-lg font-bold transition-all duration-200 hover:shadow-lg"
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Schedule */}
          {currentStep === 2 && (
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Schedule & Price</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Date */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center space-x-2">
                    <Calendar size={18} className="text-purple-600" />
                    <span>Departure Date</span>
                  </label>
                  <input
                    type="date"
                    name="departureTime"
                    value={formData.departureTime.split('T')[0]}
                    onChange={(e) => {
                      const date = e.target.value;
                      const time = formData.departureTime.split('T')[1] || '08:00';
                      setFormData({ ...formData, departureTime: `${date}T${time}` });
                    }}
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white text-gray-900 font-medium"
                    required
                  />
                </div>

                {/* Time */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center space-x-2">
                    <Clock size={18} className="text-orange-600" />
                    <span>Departure Time</span>
                  </label>
                  <input
                    type="time"
                    value={formData.departureTime.split('T')[1] || '08:00'}
                    onChange={(e) => {
                      const date = formData.departureTime.split('T')[0] || new Date().toISOString().split('T')[0];
                      setFormData({ ...formData, departureTime: `${date}T${e.target.value}` });
                    }}
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white text-gray-900 font-medium"
                    required
                  />
                </div>
              </div>

              {/* Price Per Seat */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center space-x-2">
                  <DollarSign size={18} className="text-green-600" />
                  <span>Price Per Seat (₹)</span>
                </label>
                <input
                  type="number"
                  name="pricePerSeat"
                  value={formData.pricePerSeat}
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white text-gray-900 font-medium"
                  min="100"
                  step="50"
                  required
                />
              </div>

              {/* Ride Type */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-3">Ride Type</label>
                <div className="grid grid-cols-2 gap-4">
                  {['shared', 'private'].map((type) => (
                    <label key={type} className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.rideType === type
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        name="rideType"
                        value={type}
                        checked={formData.rideType === type}
                        onChange={handleInputChange}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <span className="font-semibold text-gray-900 capitalize">{type} Ride</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between space-x-4 mt-8">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-8 py-3 rounded-lg font-bold transition-colors"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-3 rounded-lg font-bold transition-all duration-200 hover:shadow-lg"
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Details & Seats */}
          {currentStep === 3 && (
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Ride Details</h2>

              {/* Total Seats */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center space-x-2">
                  <Users size={18} className="text-cyan-600" />
                  <span>Total Seats Available</span>
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setFormData({ ...formData, totalSeats: num })}
                      className={`py-3 rounded-lg font-bold transition-all ${
                        formData.totalSeats === num
                          ? 'bg-cyan-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-3">Ride Description (Optional)</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white text-gray-900 font-medium"
                  placeholder="Share details about your car, preferred stops, music preference, etc."
                  rows="4"
                />
                <p className="text-xs text-gray-500 mt-2">This helps passengers choose your ride</p>
              </div>

              {/* Summary Card */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
                <h3 className="font-bold text-gray-900 mb-4">Ride Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600">Total Seats</p>
                    <p className="text-2xl font-bold text-gray-900">{formData.totalSeats}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Price Per Seat</p>
                    <p className="text-2xl font-bold text-green-600">₹{formData.pricePerSeat}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Total Potential</p>
                    <p className="text-2xl font-bold text-blue-600">₹{formData.totalSeats * formData.pricePerSeat}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Type</p>
                    <p className="text-2xl font-bold text-purple-600 capitalize">{formData.rideType}</p>
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between space-x-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-8 py-3 rounded-lg font-bold transition-colors"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 rounded-lg font-bold transition-all duration-200 disabled:opacity-50 flex items-center space-x-2"
                >
                  {loading && <Loader size={20} className="animate-spin" />}
                  <span>{loading ? 'Creating Ride...' : 'Create Ride'}</span>
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
