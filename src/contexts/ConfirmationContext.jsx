import React, { createContext, useContext, useState } from 'react';

const ConfirmationContext = createContext();

export const useConfirmationContext = () => {
  const context = useContext(ConfirmationContext);
  if (!context) {
    throw new Error('useConfirmationContext must be used within a ConfirmationProvider');
  }
  return context;
};

export const ConfirmationProvider = ({ children }) => {
  const [confirmation, setConfirmation] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    onConfirm: null,
    onCancel: null,
  });

  const showConfirmation = ({
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
  }) => {
    return new Promise((resolve) => {
      setConfirmation({
        isOpen: true,
        title,
        message,
        confirmText,
        cancelText,
        onConfirm: () => {
          setConfirmation(prev => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: () => {
          setConfirmation(prev => ({ ...prev, isOpen: false }));
          resolve(false);
        },
      });
    });
  };

  const hideConfirmation = () => {
    setConfirmation(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <ConfirmationContext.Provider value={{ showConfirmation, hideConfirmation }}>
      {children}
      {confirmation.isOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="ev-card w-full max-w-md mx-4">
            {/* Header */}
            <div className="ev-card-gradient p-6">
              <h3 className="text-xl font-bold text-white">
                {confirmation.title}
              </h3>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-gray-700 mb-6">
                {confirmation.message}
              </p>

              {/* Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={confirmation.onCancel}
                  className="btn-ev-secondary"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  {confirmation.cancelText}
                </button>
                <button
                  onClick={confirmation.onConfirm}
                  className="btn-ev-danger"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  {confirmation.confirmText}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ConfirmationContext.Provider>
  );
};