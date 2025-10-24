import React, { createContext, useContext, useState } from 'react';

const ErrorContext = createContext();

export const useErrorContext = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useErrorContext must be used within an ErrorProvider');
  }
  return context;
};

export const ErrorProvider = ({ children }) => {
  const [error, setError] = useState({
    isOpen: false,
    message: '',
  });

  const showError = (message) => {
    setError({
      isOpen: true,
      message,
    });
  };

  const hideError = () => {
    setError({
      isOpen: false,
      message: '',
    });
  };

  return (
    <ErrorContext.Provider value={{ showError, hideError }}>
      {children}
      {error.isOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="ev-card w-full max-w-md mx-4">
            {/* Header */}
            <div className="p-6 bg-red-500">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-white mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.866-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <h3 className="text-xl font-bold text-white">
                  Validation Error
                </h3>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-gray-700 mb-6">
                {error.message}
              </p>

              {/* Button */}
              <div className="flex justify-end">
                <button
                  onClick={hideError}
                  className="btn-ev-primary"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ErrorContext.Provider>
  );
};