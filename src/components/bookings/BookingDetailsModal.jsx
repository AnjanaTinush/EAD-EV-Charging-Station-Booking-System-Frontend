import React from 'react';

const BookingDetailsModal = ({ booking, onClose }) => {
    if (!booking) return null;

    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved':
                return 'text-green-600 bg-green-100';
            case 'Pending':
                return 'text-yellow-600 bg-yellow-100';
            case 'Cancelled':
                return 'text-red-600 bg-red-100';
            case 'Completed':
                return 'text-blue-600 bg-blue-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
                <div className="mt-3">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-semibold text-gray-900">
                            Booking Details
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                        >
                            ×
                        </button>
                    </div>

                    {/* Content */}
                    <div className="space-y-6">
                        {/* Basic Information */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="text-lg font-medium text-gray-900 mb-3">Basic Information</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Booking ID</label>
                                    <p className="mt-1 text-sm text-gray-900 font-mono">{booking.id}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Status</label>
                                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full mt-1 ${getStatusColor(booking.status)}`}>
                                        {booking.status}
                                    </span>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Owner NIC</label>
                                    <p className="mt-1 text-sm text-gray-900">{booking.ownerNIC}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Station ID</label>
                                    <p className="mt-1 text-sm text-gray-900 font-mono">{booking.stationId}</p>
                                </div>
                            </div>
                        </div>

                        {/* Time Information */}
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h4 className="text-lg font-medium text-gray-900 mb-3">Time Information</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Reservation Time</label>
                                    <p className="mt-1 text-sm text-gray-900">{formatDateTime(booking.reservationTime)}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Created At</label>
                                    <p className="mt-1 text-sm text-gray-900">{formatDateTime(booking.createdAt)}</p>
                                </div>
                                {booking.updatedAt && (
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-500">Last Updated</label>
                                        <p className="mt-1 text-sm text-gray-900">{formatDateTime(booking.updatedAt)}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* QR Code Section */}
                        {booking.qrCodeBase64 && (
                            <div className="bg-green-50 p-4 rounded-lg">
                                <h4 className="text-lg font-medium text-gray-900 mb-3">QR Code</h4>
                                <div className="flex flex-col items-center space-y-3">
                                    <img
                                        src={`data:image/png;base64,${booking.qrCodeBase64}`}
                                        alt={`QR Code for booking ${booking.id}`}
                                        className="w-48 h-48 border border-gray-300 rounded-lg shadow-sm"
                                    />
                                    <p className="text-sm text-gray-600 text-center">
                                        Show this QR code at the charging station
                                    </p>
                                    <button
                                        onClick={() => {
                                            const link = document.createElement('a');
                                            link.href = `data:image/png;base64,${booking.qrCodeBase64}`;
                                            link.download = `booking-${booking.id.slice(-8)}-qr.png`;
                                            link.click();
                                        }}
                                        className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition duration-200"
                                    >
                                        Download QR Code
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Booking Timeline */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="text-lg font-medium text-gray-900 mb-3">Booking Timeline</h4>
                            <div className="space-y-3">
                                <div className="flex items-center space-x-3">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Booking Created</p>
                                        <p className="text-xs text-gray-500">{formatDateTime(booking.createdAt)}</p>
                                    </div>
                                </div>

                                {booking.updatedAt && booking.updatedAt !== booking.createdAt && (
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-3 h-3 rounded-full ${booking.status === 'Approved' ? 'bg-green-500' :
                                                booking.status === 'Cancelled' ? 'bg-red-500' :
                                                    booking.status === 'Completed' ? 'bg-purple-500' :
                                                        'bg-yellow-500'
                                            }`}></div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Status Updated to {booking.status}</p>
                                            <p className="text-xs text-gray-500">{formatDateTime(booking.updatedAt)}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center space-x-3">
                                    <div className={`w-3 h-3 rounded-full ${new Date(booking.reservationTime) > new Date() ? 'bg-gray-300' : 'bg-orange-500'
                                        }`}></div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {new Date(booking.reservationTime) > new Date() ? 'Scheduled' : 'Time Passed'}
                                        </p>
                                        <p className="text-xs text-gray-500">{formatDateTime(booking.reservationTime)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Additional Information */}
                        <div className="bg-yellow-50 p-4 rounded-lg">
                            <h4 className="text-lg font-medium text-gray-900 mb-3">Additional Information</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-500">Booking Duration:</span>
                                    <span className="text-sm text-gray-900">
                                        {Math.ceil((new Date(booking.updatedAt || booking.createdAt) - new Date(booking.createdAt)) / (1000 * 60 * 60 * 24))} days active
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-500">Time until reservation:</span>
                                    <span className="text-sm text-gray-900">
                                        {new Date(booking.reservationTime) > new Date()
                                            ? `${Math.ceil((new Date(booking.reservationTime) - new Date()) / (1000 * 60 * 60 * 24))} days`
                                            : 'Past due'
                                        }
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-500">Has QR Code:</span>
                                    <span className={`text-sm ${booking.qrCodeBase64 ? 'text-green-600' : 'text-red-600'}`}>
                                        {booking.qrCodeBase64 ? 'Yes' : 'No'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition duration-200"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingDetailsModal;