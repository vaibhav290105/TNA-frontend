import React from 'react';
import { Link } from 'react-router-dom';

const EmployeeNavbar = ({ fetchSurveys, onLogout }) => {
  return (
    <nav className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-6 py-4 shadow-xl border-b border-gray-700">
      <div className="flex justify-between items-center">
        {/* Logo and Title */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <img 
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5K42hVGPlbGNM1cnJt7_vKICraUbzYmmlcA&s" 
              alt="IGL Logo" 
              className="h-12 w-auto rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300" 
            />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Employee Dashboard
            </h1>
            <p className="text-sm text-gray-300 font-medium">Indraprastha Gas Limited</p>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-3 items-center">
          <Link
            to="/my-feedback-responses"
            className="group relative bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
          >
            <span className="flex items-center gap-2">
              📄 <span className="hidden sm:inline">View My Feedback Responses</span>
            </span>
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-lg transition-opacity duration-300"></div>
          </Link>
          
          <Link
            to="/training-request"
            className="group relative bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
          >
            <span className="flex items-center gap-2">
              🎓 <span className="hidden sm:inline">Training Request</span>
            </span>
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-lg transition-opacity duration-300"></div>
          </Link>
          
          <Link
            to="/my-training-requests"
            className="group relative bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
          >
            <span className="flex items-center gap-2">
              📋 <span className="hidden sm:inline">My Requests</span>
            </span>
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-lg transition-opacity duration-300"></div>
          </Link>
          
          <Link
            to="/profile"
            className="group relative bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
          >
            <span className="flex items-center gap-2">
              👤 <span className="hidden sm:inline">Profile</span>
            </span>
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-lg transition-opacity duration-300"></div>
          </Link>
          
          <button
            onClick={onLogout}
            className="group relative bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
          >
            <span className="flex items-center gap-2">
              🚪 <span className="hidden sm:inline">Logout</span>
            </span>
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-lg transition-opacity duration-300"></div>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default EmployeeNavbar;