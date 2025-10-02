import React from "react";

const ErrorModal = ({ message, onClose }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-lg">
            <h2 className="mb-4 text-lg font-bold text-red-700">Error</h2>
            <div className="mb-4 text-gray-800">{message}</div>
            <div className="flex justify-end">
                <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm text-white bg-red-600 rounded hover:bg-red-700"
                >
                    Close
                </button>
            </div>
        </div>
    </div>
);

export default ErrorModal;
