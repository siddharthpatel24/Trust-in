import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-purple-600 rounded-full animate-spin animation-delay-75 mx-auto"></div>
        </div>
        <h2 className="mt-6 text-xl font-semibold text-gray-800">Loading your expenses...</h2>
        <p className="text-gray-600 mt-2">Getting everything ready for you</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;