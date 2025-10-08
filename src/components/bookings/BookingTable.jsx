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
    return (
        <div className="overflow-hidden bg-white rounded-lg shadow">
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
                                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                                    No bookings found
                                </td>
                            </tr>
                        ) : (
                            bookings.map((booking) => (
                                <tr key={booking.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                                        {booking.id.slice(-8)}...
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                        {booking.ownerNIC}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                        {booking.stationId.slice(-8)}...
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                        {formatDateTime(booking.reservationTime)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                                booking.status
                                            )}`}
                                        >
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                        {formatDateTime(booking.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                onClick={() => handleViewDetails(booking)}
                                                className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded hover:text-gray-900"
                                            >
                                                View More
                                            </button>
                                            {booking.status === "Pending" && (
                                                <>
                                                    <button
                                                        onClick={() =>
                                                            handleStatusChange(booking.id, "Approved")
                                                        }
                                                        className="px-2 py-1 text-xs text-green-600 bg-green-100 rounded hover:text-green-900"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleStatusChange(booking.id, "Cancelled")
                                                        }
                                                        className="px-2 py-1 text-xs text-red-600 bg-red-100 rounded hover:text-red-900"
                                                    >
                                                        Cancel
                                                    </button>
                                                </>
                                            )}
                                            {booking.status === "Approved" && (
                                                <button
                                                    onClick={() =>
                                                        handleStatusChange(booking.id, "Completed")
                                                    }
                                                    className="px-2 py-1 text-xs text-blue-600 bg-blue-100 rounded hover:text-blue-900"
                                                >
                                                    Complete
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDeleteBooking(booking.id)}
                                                className="px-2 py-1 text-xs text-red-600 bg-red-100 rounded hover:text-red-900"
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
