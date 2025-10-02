import React, { useState, useEffect, useCallback } from "react";
import { bookingService } from "../services/bookingService";
import { useToast } from "../hooks/useToast";
import BookingForm from "./bookings/BookingForm";
import BookingDetailsModal from "./bookings/BookingDetailsModal";
import BookingTable from "./bookings/BookingTable";
import BookingStatus from "./bookings/BookingStatus";
import CancelBookingModal from "./bookings/CancelBookingModal";
import ErrorModal from "./ErrorModal";

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
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [errorModal, setErrorModal] = useState({ show: false, message: "" });
  const { showToast } = useToast();

  const showErrorModal = (msg) => setErrorModal({ show: true, message: msg });
  const closeErrorModal = () => setErrorModal({ show: false, message: "" });

  const fetchAllBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await bookingService.getAllBookings();
      setBookings(data);
    } catch (err) {
      setError(err.message);
      showToast(err.message, "error");
      showErrorModal(err.message);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Fetch all bookings on component mount
  useEffect(() => {
    fetchAllBookings();
  }, [fetchAllBookings]);

  const handleStatusChange = async (bookingId, newStatus) => {
    if (newStatus === "Cancelled") {
      setCancelBookingId(bookingId);
      setShowCancelModal(true);
      return;
    }
    try {
      if (newStatus === "Approved") {
        await bookingService.approveBooking(bookingId);
      } else if (newStatus === "Completed") {
        await bookingService.completeBooking(bookingId);
      } else {
        await bookingService.updateBookingStatus(bookingId, newStatus);
      }
      showToast(`Booking ${newStatus.toLowerCase()} successfully`, "success");
      fetchAllBookings();
    } catch (err) {
      showToast(err.message, "error");
      showErrorModal(err.message);
    }
  };

  const handleConfirmCancel = async (reason) => {
    try {
      await bookingService.cancelBooking(cancelBookingId, reason);
      showToast("Booking cancelled successfully", "success");
      fetchAllBookings();
    } catch (err) {
      showToast(err.message, "error");
      showErrorModal(err.message);
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
      showToast("Booking deleted successfully", "success");
      // Refresh bookings
      fetchAllBookings();
    } catch (err) {
      showToast(err.message, "error");
      showErrorModal(err.message);
    }
  };

  const handleBookingCreated = () => {
    setShowCreateForm(false);
    fetchAllBookings(); // Refresh the list
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

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "text-green-600 bg-green-100";
      case "Pending":
        return "text-yellow-600 bg-yellow-100";
      case "Cancelled":
        return "text-red-600 bg-red-100";
      case "Completed":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  // Filter bookings based on status and search term
  const filteredBookings = bookings.filter((booking) => {
    const matchesFilter = filter === "all" || booking.status === filter;
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

      {error && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 border border-red-400 rounded">
          <p>Error: {error}</p>
          <button
            onClick={fetchAllBookings}
            className="px-4 py-2 mt-2 text-white bg-red-600 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

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
        >
          Refresh
        </button>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 text-white transition duration-200 bg-green-600 rounded-lg hover:bg-green-700"
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
        />
      )}

      {/* Cancel Booking Modal */}
      {showCancelModal && (
        <CancelBookingModal
          onConfirm={handleConfirmCancel}
          onClose={handleCancelModalClose}
        />
      )}
    </div>
  );
};

export default BookingManagement;
