import React, { useEffect } from 'react';

const SuccessNotification = ({ message, isVisible, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (isVisible && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose, duration]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 transform transition-all duration-300 ease-in-out">
      <div className="bg-gradient-to-r from-green-400 to-green-600 text-white px-6 py-4 rounded-xl shadow-lg border border-green-300 max-w-sm">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <svg 
              className="w-6 h-6 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">
              {message || "¡Operación exitosa!"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 text-white hover:text-green-100 transition-colors duration-200"
          >
            <svg 
              className="w-4 h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessNotification;