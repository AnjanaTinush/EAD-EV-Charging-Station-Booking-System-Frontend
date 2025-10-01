import React, { useState, useEffect, useCallback } from 'react';
import { bookingService } from '../services/bookingService';
import { useToast } from '../hooks/useToast';
import BookingForm from './BookingForm';

const BookingManagement = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const { showToast } = useToast();

    const fetchAllBookings = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await bookingService.getAllBookings();
            setBookings(data);
        } catch (err) {
            setError(err.message);
            showToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    // Fetch all bookings on component mount
    useEffect(() => {
        fetchAllBookings();
    }, [fetchAllBookings]);

    const handleStatusChange = async (bookingId, newStatus) => {
        try {
            await bookingService.updateBookingStatus(bookingId, newStatus);
            showToast(`Booking ${newStatus.toLowerCase()} successfully`, 'success');
            // Refresh bookings
            fetchAllBookings();
        } catch (err) {
            showToast(err.message, 'error');
        }
    };

    const handleDeleteBooking = async (bookingId) => {
        if (!window.confirm('Are you sure you want to delete this booking?')) {
            return;
        }

        try {
            await bookingService.deleteBooking(bookingId);
            showToast('Booking deleted successfully', 'success');
            // Refresh bookings
            fetchAllBookings();
        } catch (err) {
            showToast(err.message, 'error');
        }
    };

    const handleBookingCreated = (newBooking) => {
        setShowCreateForm(false);
        fetchAllBookings(); // Refresh the list
    };

    const handleCancelCreate = () => {
        setShowCreateForm(false);
    };

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

    // Filter bookings based on status and search term
    const filteredBookings = bookings.filter(booking => {
        const matchesFilter = filter === 'all' || booking.status === filter;
        const matchesSearch =
            booking.ownerNIC.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.stationId.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesFilter && matchesSearch;
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Management</h1>
                <p className="text-gray-600">Manage all charging station bookings</p>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                    <p>Error: {error}</p>
                    <button
                        onClick={fetchAllBookings}
                        className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Filters and Search */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Search by NIC, Booking ID, or Station ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                <div>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="all">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Completed">Completed</option>
                    </select>
                </div>
                <button
                    onClick={fetchAllBookings}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                >
                    Refresh
                </button>
                <button
                    onClick={() => setShowCreateForm(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200"
                >
                    Create Booking
                </button>
            </div>

            {/* Bookings Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow border">
                    <h3 className="text-sm font-medium text-gray-500">Total Bookings</h3>
                    <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow border">
                    <h3 className="text-sm font-medium text-gray-500">Pending</h3>
                    <p className="text-2xl font-bold text-yellow-600">
                        {bookings.filter(b => b.status === 'Pending').length}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow border">
                    <h3 className="text-sm font-medium text-gray-500">Approved</h3>
                    <p className="text-2xl font-bold text-green-600">
                        {bookings.filter(b => b.status === 'Approved').length}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow border">
                    <h3 className="text-sm font-medium text-gray-500">Completed</h3>
                    <p className="text-2xl font-bold text-blue-600">
                        {bookings.filter(b => b.status === 'Completed').length}
                    </p>
                </div>
            </div>

            {/* Bookings Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Booking ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Owner NIC
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Station ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Reservation Time
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Created At
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredBookings.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                                        No bookings found
                                    </td>
                                </tr>
                            ) : (
                                filteredBookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {booking.id.slice(-8)}...
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {booking.ownerNIC}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {booking.stationId.slice(-8)}...
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDateTime(booking.reservationTime)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDateTime(booking.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                {booking.status === 'Pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleStatusChange(booking.id, 'Approved')}
                                                            className="text-green-600 hover:text-green-900 px-2 py-1 text-xs bg-green-100 rounded"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusChange(booking.id, 'Cancelled')}
                                                            className="text-red-600 hover:text-red-900 px-2 py-1 text-xs bg-red-100 rounded"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </>
                                                )}
                                                {booking.status === 'Approved' && (
                                                    <button
                                                        onClick={() => handleStatusChange(booking.id, 'Completed')}
                                                        className="text-blue-600 hover:text-blue-900 px-2 py-1 text-xs bg-blue-100 rounded"
                                                    >
                                                        Complete
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDeleteBooking(booking.id)}
                                                    className="text-red-600 hover:text-red-900 px-2 py-1 text-xs bg-red-100 rounded"
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

            {/* QR Code Display for Approved Bookings */}
            {filteredBookings.some(booking => booking.status === 'Approved' && booking.qrCodeBase64) && (
                <div className="mt-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">QR Codes for Approved Bookings</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredBookings
                            .filter(booking => booking.status === 'Approved' && booking.qrCodeBase64)
                            .map(booking => (
                                <div key={booking.id} className="bg-white p-4 rounded-lg shadow border">
                                    <h3 className="font-medium text-gray-900 mb-2">
                                        Booking: {booking.id.slice(-8)}...
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-3">
                                        NIC: {booking.ownerNIC}
                                    </p>
                                    <div className="flex justify-center">
                                        <img
                                            src={`data:image/png;base64,${booking.qrCodeBase64}`}
                                            alt={`QR Code for booking ${booking.id}`}
                                            className="w-32 h-32 border"
                                        />
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
            )}

            {/* Create Booking Form Modal */}
            {showCreateForm && (
                <BookingForm
                    onBookingCreated={handleBookingCreated}
                    onCancel={handleCancelCreate}
                />
            )}
        </div>
    );
};

export default BookingManagement;
