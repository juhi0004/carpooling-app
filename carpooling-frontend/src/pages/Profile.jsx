// src/pages/Profile.jsx
import React, { useState, useContext, useEffect } from 'react';
import { User, Mail, Phone, Edit2, Save, Loader, LogOut, Camera, MapPin, Heart, AlertCircle, CheckCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, logout, updateProfile } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    location: user?.location || ''
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      await updateProfile(formData);
      setSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <User className="text-blue-600" size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Profile Settings</h1>
              <p className="text-gray-600 mt-1">Manage your account and preferences</p>
            </div>
          </div>
          <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" />
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-8 flex items-start space-x-4">
            <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={24} />
            <div>
              <p className="font-bold text-green-900">Success!</p>
              <p className="text-green-700 text-sm mt-1">Your profile has been updated</p>
            </div>
          </div>
        )}

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

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          {/* Banner */}
          <div className="h-40 bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full -mr-48 -mt-48" />
          </div>

          {/* Content */}
          <div className="px-6 lg:px-8 pb-8">
            {/* Avatar and Header */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 -mt-20 mb-8 relative z-10">
              <div className="flex items-end space-x-6">
                <div className="relative">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 border-4 border-white rounded-full flex items-center justify-center shadow-xl">
                    <span className="text-5xl font-bold text-white">{user?.name?.charAt(0).toUpperCase()}</span>
                  </div>
                  <button className="absolute bottom-0 right-0 bg-white border-4 border-blue-600 rounded-full p-3 hover:bg-gray-50 transition-colors shadow-lg">
                    <Camera size={20} className="text-blue-600" />
                  </button>
                </div>
                <div className="pb-2">
                  <h2 className="text-3xl font-bold text-gray-900">{user?.name}</h2>
                  <p className="text-gray-600 flex items-center space-x-1 mt-2">
                    {user?.role === 'driver' ? (
                      <>
                        <span className="text-2xl">🚗</span>
                        <span className="font-semibold">Driver</span>
                      </>
                    ) : (
                      <>
                        <span className="text-2xl">👤</span>
                        <span className="font-semibold">Passenger</span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Edit Toggle */}
              <div className="flex space-x-3">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition-all duration-200 hover:shadow-lg"
                  >
                    <Edit2 size={20} />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex items-center space-x-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-bold transition-colors"
                    >
                      <span>Cancel</span>
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      disabled={loading}
                      className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-bold transition-all duration-200 disabled:opacity-50 hover:shadow-lg"
                    >
                      {loading ? <Loader size={20} className="animate-spin" /> : <Save size={20} />}
                      <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Form Sections */}
            <div className="space-y-8 border-t pt-8">
              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center space-x-2">
                  <Mail size={20} className="text-blue-600" />
                  <span>Contact Information</span>
                </h3>

                <div className="space-y-4">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                    <div className="flex items-center border-2 border-gray-200 rounded-lg px-5 py-3.5 bg-gray-50">
                      <Mail size={20} className="text-gray-400 flex-shrink-0" />
                      <input
                        type="email"
                        value={user?.email}
                        disabled
                        className="w-full ml-3 outline-none text-gray-600 bg-gray-50 font-medium"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                    <div className="flex items-center border-2 border-gray-200 rounded-lg px-5 py-3.5 focus-within:border-blue-500 focus-within:bg-white transition-colors">
                      <Phone size={20} className="text-blue-600 flex-shrink-0" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full ml-3 outline-none text-gray-900 bg-transparent font-medium disabled:bg-gray-50"
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center space-x-2">
                  <User size={20} className="text-blue-600" />
                  <span>Personal Information</span>
                </h3>

                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                    <div className="flex items-center border-2 border-gray-200 rounded-lg px-5 py-3.5 focus-within:border-blue-500 focus-within:bg-white transition-colors">
                      <User size={20} className="text-blue-600 flex-shrink-0" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full ml-3 outline-none text-gray-900 bg-transparent font-medium disabled:bg-gray-50"
                        placeholder="Enter full name"
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
                    <div className="flex items-center border-2 border-gray-200 rounded-lg px-5 py-3.5 focus-within:border-blue-500 focus-within:bg-white transition-colors">
                      <MapPin size={20} className="text-purple-600 flex-shrink-0" />
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full ml-3 outline-none text-gray-900 bg-transparent font-medium disabled:bg-gray-50"
                        placeholder="Enter your city"
                      />
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">About You (Bio)</label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full border-2 border-gray-200 rounded-lg px-5 py-3.5 outline-none text-gray-900 font-medium focus:border-blue-500 focus:bg-white transition-colors disabled:bg-gray-50"
                      placeholder="Tell other users about yourself..."
                      rows="4"
                    />
                    <p className="text-xs text-gray-500 mt-2">This helps other users know more about you</p>
                  </div>
                </div>
              </div>

              {/* Account Statistics */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center space-x-2">
                  <Heart size={20} className="text-blue-600" />
                  <span>Account Statistics</span>
                </h3>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                    <p className="text-xs uppercase tracking-wide font-bold text-gray-600 mb-2">Rides Completed</p>
                    <p className="text-3xl font-bold text-blue-600">0</p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                    <p className="text-xs uppercase tracking-wide font-bold text-gray-600 mb-2">Rating</p>
                    <p className="text-3xl font-bold text-green-600">4.8 ⭐</p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                    <p className="text-xs uppercase tracking-wide font-bold text-gray-600 mb-2">Total Trips</p>
                    <p className="text-3xl font-bold text-purple-600">0</p>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                    <p className="text-xs uppercase tracking-wide font-bold text-gray-600 mb-2">Member Since</p>
                    <p className="text-sm font-bold text-orange-600">Jan 2024</p>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="border-t pt-8 border-red-200">
                <h3 className="text-lg font-bold text-red-600 mb-5 flex items-center space-x-2">
                  <AlertCircle size={20} />
                  <span>Danger Zone</span>
                </h3>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white py-3.5 rounded-lg font-bold transition-all duration-200 hover:shadow-lg"
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>

                <p className="text-xs text-gray-500 mt-4 text-center">You will be signed out from your account</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}