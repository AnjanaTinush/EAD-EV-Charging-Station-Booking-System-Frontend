import React, { useState, useEffect, useCallback } from "react";
import { bookingService } from "../services/bookingService";
import { useNotification } from "../contexts/NotificationContext";
import BookingForm from "./bookings/BookingForm";
import BookingDetailsModal from "./bookings/BookingDetailsModal";
import BookingTable from "./bookings/BookingTable";
import BookingStatus from "./bookings/BookingStatus";
import CancelBookingModal from "./bookings/CancelBookingModal";
import ErrorModal from "./ErrorModal";
import BookingCalendar from "./bookings/BookingCalander";

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [cancelBookingId, setCancelBookingId] = useState(null);
  const [cancelReservationTime, setCancelReservationTime] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [errorModal, setErrorModal] = useState({ show: false, message: "" });
  const [connectionError, setConnectionError] = useState(false);
  const { showSuccess, showError, showWarning, showInfo } = useNotification();

  const showErrorModal = (msg) => setErrorModal({ show: true, message: msg });
  const closeErrorModal = () => setErrorModal({ show: false, message: "" });

  const fetchAllBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setConnectionError(false);
      const data = await bookingService.getAllBookings();
      setBookings(data);
      showInfo(`Loaded ${data.length} bookings successfully`);
    } catch (err) {
      setError(err.message);

      // Check if it's a connection/CORS error
      if (err.message.includes("Unable to connect") || err.message.includes("Network error")) {
        setConnectionError(true);
        showError("Unable to connect to API server. Please check connection.");
      } else {
        showError(`Failed to load bookings: ${err.message}`);
      }

      showErrorModal(err.message);
    } finally {
      setLoading(false);
    }
  }, [showError, showInfo]);

  // Fetch all bookings on component mount
  useEffect(() => {
    fetchAllBookings();
  }, [fetchAllBookings]);

  const handleStatusChange = async (bookingId, newStatus) => {
    if (newStatus === "Cancelled") {
      const booking = bookings.find((b) => b.id === bookingId);
      setCancelBookingId(bookingId);
      setCancelReservationTime(booking ? booking.reservationTime : null);
      setShowCancelModal(true);
      return;
    }
    
    try {
      console.log('Changing status for booking:', bookingId, 'to:', newStatus);
      
      if (newStatus === "Approved") {
        await bookingService.approveBooking(bookingId);
        showSuccess(`Booking approved successfully! QR code generated.`);
      } else if (newStatus === "Completed") {
        await bookingService.completeBooking(bookingId);
        showSuccess(`Booking completed successfully!`);
      } else {
        // For direct status updates, ensure proper case
        const normalizedStatus = newStatus.charAt(0).toUpperCase() + newStatus.slice(1).toLowerCase();
        await bookingService.updateBookingStatus(bookingId, normalizedStatus);
        showSuccess(`Booking status updated to ${normalizedStatus}`);
      }
      fetchAllBookings();
    } catch (err) {
      console.error("Status change error:", err);
      const errorMessage = err.response?.data?.message || err.message || 'Unknown error occurred';
      showError(`Failed to update booking status: ${errorMessage}`);
      showErrorModal(errorMessage);
    }
  };

  const handleConfirmCancel = async (reason) => {
    try {
      console.log('Cancelling booking:', cancelBookingId, 'with reason:', reason);
      await bookingService.cancelBooking(cancelBookingId, reason);
      showSuccess(`Booking cancelled successfully. Reason: ${reason}`);
      fetchAllBookings();
    } catch (err) {
      console.error('Cancel booking error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Unknown error occurred';
      showError(`Failed to cancel booking: ${errorMessage}`);
      showErrorModal(errorMessage);
    } finally {
      setShowCancelModal(false);
      setCancelBookingId(null);
    }
  };

  const handleCancelModalClose = () => {
    setShowCancelModal(false);
    setCancelBookingId(null);
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to delete this booking?")) {
      return;
    }

    try {
      await bookingService.deleteBooking(bookingId);
      showSuccess("Booking deleted successfully");
      fetchAllBookings();
    } catch (err) {
      showError(`Failed to delete booking: ${err.message}`);
      showErrorModal(err.message);
    }
  };

  const handleBookingCreated = () => {
    setShowCreateForm(false);
    fetchAllBookings();
    showSuccess("New booking created and list refreshed");
  };

  const handleCancelCreate = () => {
    setShowCreateForm(false);
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setSelectedBooking(null);
  };

  const handleBookingUpdated = () => {
    fetchAllBookings();
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status) => {
    if (!status) return "text-gray-600 bg-gray-100";

    const statusLower = status.toString().toLowerCase().trim();
    switch (statusLower) {
      case "approved":
        return "text-green-600 bg-green-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "cancelled":
      case "canceled":
        return "text-red-600 bg-red-100";
      case "completed":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  // Filter bookings based on status and search term
  const filteredBookings = bookings.filter((booking) => {
    const matchesFilter = filter === "all" ||
      (booking.status && booking.status.toLowerCase().trim() === filter.toLowerCase());
    const matchesSearch =
      booking.ownerNIC.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.stationId.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Booking Management
        </h1>
        <p className="text-gray-600">Manage all charging station bookings</p>
      </div>

      <BookingCalendar />

      {error && (
        <div className={`p-4 mb-4 border rounded ${connectionError
          ? 'text-orange-700 bg-orange-100 border-orange-400'
          : 'text-red-700 bg-red-100 border-red-400'
          }`}>
          <div className="flex items-start">
            <div className="flex-1">
              <h3 className="font-semibold">
                {connectionError ? 'Connection Error' : 'Error'}
              </h3>
              <p className="mt-1">{error}</p>
              {connectionError && (
                <div className="mt-2 text-sm">
                  <p>Possible solutions:</p>
                  <ul className="ml-4 list-disc">
                    <li>Make sure the API server is running on https://localhost:7179</li>
                    <li>Check if CORS is properly configured on the server</li>
                    <li>Verify your network connection</li>
                  </ul>
                </div>
              )}
            </div>
            <button
              onClick={fetchAllBookings}
              className={`px-4 py-2 ml-4 text-white rounded hover:opacity-80 ${connectionError ? 'bg-orange-600' : 'bg-red-600'
                }`}
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Show mock data or empty state when there's a connection error */}
      {connectionError && bookings.length === 0 ? (
        <div className="p-8 text-center bg-gray-100 rounded-lg">
          <div className="mb-4 text-4xl">🔌</div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">Unable to Connect to API</h3>
          <p className="text-gray-600">
            Please check your API server connection and try again.
          </p>
          <button
            onClick={fetchAllBookings}
            className="px-4 py-2 mt-4 text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      ) : (
        <>
          {/* Error Modal */}
          {errorModal.show && (
            <ErrorModal message={errorModal.message} onClose={closeErrorModal} />
          )}

          {/* Filters and Search */}
          <div className="flex flex-col gap-4 mb-6 sm:flex-row">
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
              className="px-4 py-2 text-white transition duration-200 bg-blue-600 rounded-lg hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 text-white transition duration-200 bg-green-600 rounded-lg hover:bg-green-700"
              disabled={connectionError}
            >
              Create Booking
            </button>
          </div>

          {/* Bookings Stats */}
          <BookingStatus bookings={bookings} />

          {/* Bookings Table */}
          <BookingTable
            bookings={filteredBookings}
            handleStatusChange={handleStatusChange}
            handleViewDetails={handleViewDetails}
            handleDeleteBooking={handleDeleteBooking}
            formatDateTime={formatDateTime}
            getStatusColor={getStatusColor}
          />
        </>
      )}

      {/* Create Booking Form Modal */}
      {showCreateForm && (
        <BookingForm
          onBookingCreated={handleBookingCreated}
          onCancel={handleCancelCreate}
        />
      )}

      {/* Booking Details Modal */}
      {showDetailsModal && selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          onClose={handleCloseModal}
          onBookingUpdated={handleBookingUpdated}
        />
      )}

      {/* Cancel Booking Modal */}
      {showCancelModal && (
        <CancelBookingModal
          onConfirm={handleConfirmCancel}
          onClose={handleCancelModalClose}
          reservationTime={cancelReservationTime}
        />
      )}
    </div>
  );
};

export default BookingManagement;
