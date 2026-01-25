// src/pages/SearchRides.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Search, MapPin, Calendar, Users, Loader, ArrowRight, MapIcon } from 'lucide-react';
import { rides } from '../services/api';
import RideCard from '../components/RideCard';
import { AuthContext } from '../context/AuthContext';

export default function SearchRides() {
  const { isAuthenticated } = useContext(AuthContext);
  const [filters, setFilters] = useState({
    from: '',
    to: '',
    date: '',
    seats: 1
  });
  const [ridesList, setRidesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);

    try {
      const response = await rides.search(filters);
      setRidesList(response.rides || []);
    } catch (error) {
      console.error('Search failed:', error);
      setRidesList([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Enhanced Search Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600 text-white py-16 px-4 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white opacity-5 rounded-full -ml-36 -mb-36" />

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Header Text */}
          <div className="mb-10">
            <div className="flex items-center space-x-3 mb-4">
              <MapIcon size={32} className="text-cyan-200" />
              <h1 className="text-5xl font-bold">Find Your Perfect Ride</h1>
            </div>
            <p className="text-blue-100 text-lg">Search and book shared rides instantly</p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-2xl p-8 backdrop-blur-md">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              {/* From */}
              <div className="group">
                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center space-x-2">
                  <MapPin size={16} className="text-blue-600" />
                  <span>Pickup Location</span>
                </label>
                <input
                  type="text"
                  name="from"
                  value={filters.from}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white text-gray-900 font-medium"
                  placeholder="Enter city or location"
                  required
                />
              </div>

              {/* To */}
              <div className="group">
                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center space-x-2">
                  <MapPin size={16} className="text-green-600" />
                  <span>Destination</span>
                </label>
                <input
                  type="text"
                  name="to"
                  value={filters.to}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white text-gray-900 font-medium"
                  placeholder="Enter destination"
                  required
                />
              </div>

              {/* Date */}
              <div className="group">
                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center space-x-2">
                  <Calendar size={16} className="text-purple-600" />
                  <span>Date</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={filters.date}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white text-gray-900 font-medium"
                  required
                />
              </div>

              {/* Seats */}
              <div className="group">
                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center space-x-2">
                  <Users size={16} className="text-cyan-600" />
                  <span>Seats</span>
                </label>
                <select
                  name="seats"
                  value={filters.seats}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white text-gray-900 font-medium"
                >
                  {[1, 2, 3, 4, 5].map(num => (
                    <option key={num} value={num}>{num} {num === 1 ? 'Seat' : 'Seats'}</option>
                  ))}
                </select>
              </div>

              {/* Search Button */}
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg py-3.5 font-bold hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 text-base"
                >
                  <Search size={20} />
                  <span>Search Rides</span>
                </button>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 mt-6">
              <p className="text-sm text-gray-700 font-medium">💡 <span className="font-bold">Tip:</span> Search for rides departing tomorrow or later for better availability</p>
            </div>
          </form>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        {loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative w-16 h-16 mb-6">
              <Loader className="animate-spin text-blue-600" size={40} />
            </div>
            <p className="text-gray-600 font-semibold">Finding available rides...</p>
          </div>
        )}

        {searched && !loading && (
          <>
            {/* Results Header */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-3xl font-bold text-gray-900">
                  {ridesList.length > 0 ? `${ridesList.length} Rides Found` : 'No Rides Available'}
                </h2>
                {ridesList.length > 0 && (
                  <p className="text-sm text-gray-600">Showing all available options</p>
                )}
              </div>
              <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" />
            </div>

            {ridesList.length > 0 ? (
              <div className="grid grid-cols-1 gap-5">
                {ridesList.map((ride, index) => (
                  <div key={ride._id} className="animate-fadeIn" style={{ animationDelay: `${index * 50}ms` }}>
                    <RideCard ride={ride} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100">
                <div className="inline-block p-4 bg-gray-100 rounded-full mb-6">
                  <Search size={48} className="text-gray-400" />
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-2">No Rides Found</p>
                <p className="text-gray-600 mb-8">Try adjusting your filters or search for a different route</p>
                <button
                  onClick={() => {
                    setFilters({ from: '', to: '', date: '', seats: 1 });
                    setSearched(false);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  New Search
                </button>
              </div>
            )}
          </>
        )}

        {!searched && (
          <div className="bg-white rounded-2xl p-24 text-center shadow-sm border border-gray-100">
            <div className="inline-block p-6 bg-blue-50 rounded-full mb-6">
              <MapIcon size={56} className="text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-2">Start Your Journey</p>
            <p className="text-gray-600">Fill in your route details above to find available rides</p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}