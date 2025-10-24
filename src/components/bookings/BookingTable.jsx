import React from "react";

// BookingTable expects these props:
// bookings, handleStatusChange, handleViewDetails, handleDeleteBooking, formatDateTime, getStatusColor
const BookingTable = ({
    bookings,
    handleStatusChange,
    handleViewDetails,
    handleDeleteBooking,
    formatDateTime,
    getStatusColor,
}) => {
    // Default getStatusColor function with modern pill design
    const defaultGetStatusColor = (status) => {
        if (!status) return "text-gray-700 bg-gray-100 border-gray-200";

        const statusLower = status.toString().toLowerCase().trim();
        switch (statusLower) {
            case "pending":
                return "text-yellow-800 bg-yellow-50 border border-yellow-200 shadow-sm";
            case "approved":
                return "text-green-800 bg-green-50 border border-green-200 shadow-sm";
            case "completed":
                return "text-blue-800 bg-blue-50 border border-blue-200 shadow-sm";
            case "cancelled":
            case "canceled":
                return "text-red-800 bg-red-50 border border-red-200 shadow-sm";
            default:
                return "text-gray-700 bg-gray-50 border border-gray-200 shadow-sm";
        }
    };

    const statusColorClass = getStatusColor || defaultGetStatusColor;

    // Helper function to normalize status for comparison and display
    const normalizeStatus = (status) => {
        if (!status) return "";
        const normalized = status.toString().trim();
        // Return proper case for display
        return normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase();
    };

    // Helper function to check status for actions
    const isStatus = (bookingStatus, targetStatus) => {
        if (!bookingStatus) return false;
        return bookingStatus.toString().toLowerCase().trim() === targetStatus.toLowerCase();
    };

    return (
        <div className="overflow-hidden bg-white rounded-lg shadow-lg">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                Booking ID
                            </th>
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                Owner NIC
                            </th>
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                Station ID
                            </th>
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                Reservation Time
                            </th>
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                Status
                            </th>
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                Created At
                            </th>
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {bookings.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                    <div className="flex flex-col items-center">
                                        <svg
                                            className="w-12 h-12 mb-4 text-gray-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 48 48"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="1"
                                                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4m16 0H4"
                                            />
                                        </svg>
                                        <p className="text-lg font-medium">No bookings found</p>
                                        <p className="text-sm text-gray-400">
                                            There are no bookings to display
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            bookings.map((booking) => (
                                <tr
                                    key={booking.id}
                                    className="transition-colors hover:bg-gray-50"
                                >
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                                        <span className="px-2 py-1 font-mono text-xs bg-gray-100 rounded">
                                            {booking.id.slice(-8)}...
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                        {booking.ownerNIC}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                        <span className="px-2 py-1 font-mono text-xs bg-gray-100 rounded">
                                            {booking.stationId.slice(-8)}...
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                        {formatDateTime(booking.reservationTime)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full ${statusColorClass(
                                                booking.status
                                            )}`}
                                        >
                                            <span
                                                className={`w-1.5 h-1.5 mr-2 rounded-full ${isStatus(booking.status, "pending")
                                                    ? "bg-yellow-400"
                                                    : isStatus(booking.status, "approved")
                                                        ? "bg-green-400"
                                                        : isStatus(booking.status, "completed")
                                                            ? "bg-blue-400"
                                                            : isStatus(booking.status, "cancelled")
                                                                ? "bg-red-400"
                                                                : "bg-gray-400"
                                                    }`}
                                            ></span>
                                            {normalizeStatus(booking.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                        {formatDateTime(booking.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                onClick={() => handleViewDetails(booking)}
                                                className="px-3 py-1 text-xs text-gray-700 transition-colors bg-gray-100 border border-gray-300 rounded hover:bg-gray-200"
                                            >
                                                View More
                                            </button>
                                            {isStatus(booking.status, "pending") && (
                                                <>
                                                    <button
                                                        onClick={() =>
                                                            handleStatusChange(booking.id, "Approved")
                                                        }
                                                        className="px-3 py-1 text-xs text-green-700 transition-colors bg-green-100 border border-green-300 rounded hover:bg-green-200"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleStatusChange(booking.id, "Cancelled")
                                                        }
                                                        className="px-3 py-1 text-xs text-red-700 transition-colors bg-red-100 border border-red-300 rounded hover:bg-red-200"
                                                    >
                                                        Cancel
                                                    </button>
                                                </>
                                            )}
                                            {isStatus(booking.status, "approved") && (
                                                <button
                                                    onClick={() =>
                                                        handleStatusChange(booking.id, "Completed")
                                                    }
                                                    className="px-3 py-1 text-xs text-blue-700 transition-colors bg-blue-100 border border-blue-300 rounded hover:bg-blue-200"
                                                >
                                                    Complete
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDeleteBooking(booking.id)}
                                                className="px-3 py-1 text-xs text-red-700 transition-colors bg-red-100 border border-red-300 rounded hover:bg-red-200"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BookingTable;
