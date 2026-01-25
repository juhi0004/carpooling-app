import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Menu, X, LogOut, User } from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-blue-600">
            🚗 CarPool
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-700 hover:text-blue-600">Home</Link>
            <Link to="/rides" className="text-gray-700 hover:text-blue-600">Find Rides</Link>
            {isAuthenticated && (
              <>
                <Link to="/create-ride" className="text-gray-700 hover:text-blue-600">Create Ride</Link>
                <Link to="/bookings" className="text-gray-700 hover:text-blue-600">My Bookings</Link>
              </>
            )}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="flex items-center space-x-2 text-gray-700 hover:text-blue-600">
                  <User size={20} />
                  <span>{user?.name}</span>
                </Link>
                <button onClick={handleLogout} className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded">
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-blue-600">Login</Link>
                <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded">Sign Up</Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link to="/" className="block text-gray-700 hover:text-blue-600 py-2">Home</Link>
            <Link to="/rides" className="block text-gray-700 hover:text-blue-600 py-2">Find Rides</Link>
            {isAuthenticated && (
              <>
                <Link to="/create-ride" className="block text-gray-700 hover:text-blue-600 py-2">Create Ride</Link>
                <Link to="/bookings" className="block text-gray-700 hover:text-blue-600 py-2">My Bookings</Link>
                <Link to="/profile" className="block text-gray-700 hover:text-blue-600 py-2">Profile</Link>
                <button onClick={handleLogout} className="w-full text-left bg-red-500 text-white px-4 py-2 rounded">Logout</button>
              </>
            )}
            {!isAuthenticated && (
              <>
                <Link to="/login" className="block text-gray-700 hover:text-blue-600 py-2">Login</Link>
                <Link to="/register" className="block bg-blue-600 text-white px-4 py-2 rounded">Sign Up</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
