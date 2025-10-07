import React, { useState } from "react";

const CancelBookingModal = ({ onConfirm, onClose }) => {
    const [reason, setReason] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (reason.trim()) {
            onConfirm(reason);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-lg">
                <h2 className="mb-4 text-lg font-bold text-gray-900">Cancel Booking</h2>
                <form onSubmit={handleSubmit}>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                        Reason for cancellation
                    </label>
                    <textarea
                        className="w-full px-3 py-2 border rounded"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        required
                        rows={3}
                        placeholder="Enter reason..."
                    />
                    <div className="flex justify-end mt-4 space-x-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                        >
                            Close
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm text-white bg-red-600 rounded hover:bg-red-700"
                        >
                            Cancel Booking
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CancelBookingModal;
