import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Users, DollarSign, Star, Calendar, Clock, ArrowRight } from 'lucide-react';
import { formatDate, formatTime } from '../utils/dateUtils';

export default function RideCard({ ride, onClick }) {
  return (
    <Link to={`/ride/${ride._id}`} className="block group">
      <div className="bg-white rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden border border-gray-100">
        {/* Status Bar */}
        <div className="h-1.5 bg-gradient-to-r from-blue-500 to-cyan-500" />

        <div className="p-6">
          {/* Driver Info Section */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4 flex-1">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                  <span className="font-bold text-white text-lg">{ride.driver.name.charAt(0).toUpperCase()}</span>
                </div>
                <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900 text-base">{ride.driver.name}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="flex items-center space-x-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className={i < Math.floor(ride.driver.rating || 4.8) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{ride.driver.rating || 4.8}</span>
                </div>
              </div>
            </div>
            <div className="text-right bg-blue-50 rounded-lg px-4 py-3">
              <p className="text-2xl font-bold text-blue-600">₹{ride.pricePerSeat}</p>
              <p className="text-xs text-blue-600 font-medium">per seat</p>
            </div>
          </div>

          {/* Route Section */}
          <div className="space-y-3.5 mb-6 pb-6 border-b border-gray-100">
            {/* From */}
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <MapPin size={16} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-wide font-bold text-gray-500">Pickup</p>
                <p className="font-semibold text-gray-900 text-sm mt-1 truncate">{ride.from.address}</p>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center py-1">
              <div className="w-0.5 h-4 bg-gray-200 mx-4" />
            </div>

            {/* To */}
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <MapPin size={16} className="text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-wide font-bold text-gray-500">Destination</p>
                <p className="font-semibold text-gray-900 text-sm mt-1 truncate">{ride.to.address}</p>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {/* Date */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3.5 text-center border border-blue-200">
              <div className="flex justify-center mb-2">
                <Calendar size={18} className="text-blue-600" />
              </div>
              <p className="text-xs font-bold text-gray-900">{formatDate(ride.departureTime)}</p>
              <p className="text-xs text-gray-600 mt-1">Date</p>
            </div>

            {/* Time */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3.5 text-center border border-purple-200">
              <div className="flex justify-center mb-2">
                <Clock size={18} className="text-purple-600" />
              </div>
              <p className="text-xs font-bold text-gray-900">{formatTime(ride.departureTime)}</p>
              <p className="text-xs text-gray-600 mt-1">Time</p>
            </div>

            {/* Seats */}
            <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg p-3.5 text-center border border-cyan-200">
              <div className="flex justify-center mb-2">
                <Users size={18} className="text-cyan-600" />
              </div>
              <p className="text-xs font-bold text-gray-900">{ride.availableSeats}</p>
              <p className="text-xs text-gray-600 mt-1">Seats</p>
            </div>
          </div>

          {/* View Details Button */}
          <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 group-hover:shadow-lg">
            <span>View Details</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </Link>
  );
}