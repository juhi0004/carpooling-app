import React from 'react';
import { Link } from 'react-router-dom';
import { Car, MapPin, Users, Shield } from 'lucide-react';

export default function Home() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">Share Your Journey</h1>
          <p className="text-xl mb-8">Safe, affordable, and eco-friendly carpooling</p>
          <div className="space-x-4">
            <Link to="/rides" className="bg-white text-blue-600 px-8 py-3 rounded font-medium hover:bg-gray-100">
              Find a Ride
            </Link>
            <Link to="/create-ride" className="bg-blue-500 text-white px-8 py-3 rounded font-medium hover:bg-blue-700">
              Offer a Ride
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose CarPool?</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <Car className="w-16 h-16 mx-auto mb-4 text-blue-600" />
              <h3 className="font-bold text-lg mb-2">Easy to Use</h3>
              <p className="text-gray-600">Book a ride in just a few clicks</p>
            </div>
            <div className="text-center">
              <MapPin className="w-16 h-16 mx-auto mb-4 text-blue-600" />
              <h3 className="font-bold text-lg mb-2">Real-time Tracking</h3>
              <p className="text-gray-600">Track your ride in real-time</p>
            </div>
            <div className="text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-blue-600" />
              <h3 className="font-bold text-lg mb-2">Community</h3>
              <p className="text-gray-600">Connect with verified riders</p>
            </div>
            <div className="text-center">
              <Shield className="w-16 h-16 mx-auto mb-4 text-blue-600" />
              <h3 className="font-bold text-lg mb-2">Safe & Secure</h3>
              <p className="text-gray-600">Your safety is our priority</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Share Your Journey?</h2>
          <Link to="/register" className="bg-white text-blue-600 px-8 py-3 rounded font-medium hover:bg-gray-100">
            Get Started Now
          </Link>
        </div>
      </div>
    </div>
  );
}
