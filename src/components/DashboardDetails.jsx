import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { bookingService } from "../services/bookingService";
import { useToast } from "../hooks/useToast";
import BookingManagement from "./BookingManagement";

const DashboardDetails = ({ user }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookingManagement, setShowBookingManagement] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await bookingService.getAllBookings();
        setBookings(data);
      } catch (err) {
        showToast(err.message, "error");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [showToast]);

  // Filter today's bookings
  const today = new Date();
  const todayBookings = bookings.filter((booking) => {
    const bookingDate = new Date(booking.reservationTime);
    return bookingDate.toDateString() === today.toDateString();
  });

  // Filter upcoming bookings (next 7 days)
  const upcomingBookings = bookings.filter((booking) => {
    const bookingDate = new Date(booking.reservationTime);
    const diffTime = bookingDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 7;
  });

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  // Chart data for booking status distribution - Fixed status matching
  const statusCounts = {
    Pending: bookings.filter(
      (b) =>
        b.status &&
        (b.status.toLowerCase() === "pending" || b.status === "pending")
    ).length,
    Approved: bookings.filter(
      (b) =>
        b.status &&
        (b.status.toLowerCase() === "approved" || b.status === "approved")
    ).length,
    Completed: bookings.filter(
      (b) =>
        b.status &&
        (b.status.toLowerCase() === "completed" || b.status === "completed")
    ).length,
    Cancelled: bookings.filter(
      (b) =>
        b.status &&
        (b.status.toLowerCase() === "cancelled" ||
          b.status.toLowerCase() === "canceled" ||
          b.status === "cancelled")
    ).length,
  };

  // Debug log to see what data we're working with
  console.log("Bookings data:", bookings);
  console.log("Status counts:", statusCounts);
  console.log(
    "Sample booking statuses:",
    bookings.slice(0, 3).map((b) => ({ id: b.id, status: b.status }))
  );

  const chartData = [
    { status: "Pending", count: statusCounts.Pending, color: "#f59e0b" },
    { status: "Approved", count: statusCounts.Approved, color: "#10b981" },
    { status: "Completed", count: statusCounts.Completed, color: "#3b82f6" },
    { status: "Cancelled", count: statusCounts.Cancelled, color: "#ef4444" },
  ];

  const maxCount = Math.max(...Object.values(statusCounts), 1);

  const getStatusColor = (status) => {
    if (!status) return "text-gray-700 bg-gray-50 border-gray-200";

    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "approved":
        return "text-green-800 bg-green-50 border-green-200";
      case "pending":
        return "text-yellow-800 bg-yellow-50 border-yellow-200";
      case "cancelled":
      case "canceled":
        return "text-red-800 bg-red-50 border-red-200";
      case "completed":
        return "text-blue-800 bg-blue-50 border-blue-200";
      default:
        return "text-gray-700 bg-gray-50 border-gray-200";
    }
  };

  if (showBookingManagement) {
    return <BookingManagement />;
  }

  return (
    <div className="space-y-8">
      <div className="p-8 ev-card">
        <div className="flex items-center mb-6 space-x-4">
          <div className="flex items-center justify-center w-16 h-16 bg-ev-gradient rounded-2xl charging-animation">
            <svg
              className="w-8 h-8 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" />
            </svg>
          </div>
          <div>
            <h2 className="mb-2 text-3xl font-bold ev-gradient-text">
              Welcome back, {user.username || user.name || "User"}!
            </h2>
            <p className="text-lg text-gray-600">
              Ready to power up your next journey with smart EV charging.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 mt-8 md:grid-cols-4">
          <div className="border-2 ev-stat-card bg-gradient-to-br from-ev-primary-50 to-ev-primary-100 border-ev-primary-200">
            {/* <div className="ev-stat-icon">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div> */}
            <h3 className="mb-1 text-lg font-bold text-ev-primary-800">
              Total Bookings
            </h3>
            <p className="mb-2 text-3xl font-bold text-ev-primary-600">
              {bookings.length}
            </p>
            <p className="text-sm text-ev-primary-700">All time bookings</p>
          </div>

          <div className="border-2 ev-stat-card bg-gradient-to-br from-ev-energy-400/10 to-ev-energy-500/20 border-ev-energy-400/30">
            {/* <div className="flex items-center justify-center w-12 h-12 mb-4 text-white bg-gradient-to-r from-ev-energy-400 to-ev-energy-600 rounded-xl">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9l-5.91 5.74L18 22l-6-3.27L6 22l1.91-7.26L2 9l6.91-0.74L12 2z" />
              </svg>
            </div> */}
            <h3 className="mb-1 text-lg font-bold text-ev-energy-800">
              Today's Bookings
            </h3>
            <p className="mb-2 text-3xl font-bold text-ev-energy-600">
              {todayBookings.length}
            </p>
            <p className="text-sm text-ev-energy-700">Scheduled for today</p>
          </div>

          <div className="border-2 ev-stat-card bg-gradient-to-br from-ev-secondary-50 to-ev-secondary-100 border-ev-secondary-200">
            {/* <div className="flex items-center justify-center w-12 h-12 mb-4 text-white bg-ev-secondary-gradient rounded-xl">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div> */}
            <h3 className="mb-1 text-lg font-bold text-ev-secondary-800">
              Upcoming
            </h3>
            <p className="mb-2 text-3xl font-bold text-ev-secondary-600">
              {upcomingBookings.length}
            </p>
            <p className="text-sm text-ev-secondary-700">Next 7 days</p>
          </div>

          <div className="border-2 border-green-200 ev-stat-card bg-gradient-to-br from-green-50 to-green-100">
            {/* <div className="flex items-center justify-center w-12 h-12 mb-4 text-white bg-gradient-to-r from-green-400 to-green-600 rounded-xl">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div> */}
            <h3 className="mb-1 text-lg font-bold text-green-800">Completed</h3>
            <p className="mb-2 text-3xl font-bold text-green-600">
              {statusCounts.Completed}
            </p>
            <p className="text-sm text-green-700">Successfully completed</p>
          </div>
        </div>
      </div>

      {/* Booking Status Chart */}
      <div className="p-8 bg-white rounded-lg shadow-lg">
        <h3 className="mb-6 text-2xl font-bold text-gray-900">
          Booking Status Overview
        </h3>
        <div className="space-y-4">
          {chartData.map((item) => (
            <div key={item.status} className="flex items-center space-x-4">
              <div className="w-20 text-sm font-medium text-gray-700">
                {item.status}
              </div>
              <div className="flex-1 h-6 bg-gray-200 rounded-full">
                <div
                  className="h-6 transition-all duration-300 rounded-full"
                  style={{
                    width: `${(item.count / maxCount) * 100}%`,
                    backgroundColor: item.color,
                  }}
                ></div>
              </div>
              <div className="w-12 text-sm font-bold text-gray-900">
                {item.count}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Today's Bookings */}
      <div className="p-8 bg-white rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Today's Bookings</h3>
          <button
            onClick={() => setShowBookingManagement(true)}
            className="px-4 py-2 text-sm font-medium text-white transition duration-200 bg-green-600 rounded-lg hover:bg-green-700"
          >
            View All
          </button>
        </div>
        {loading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : todayBookings.length === 0 ? (
          <div className="text-center text-gray-500">No bookings for today</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Station ID
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Owner NIC
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Time
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {todayBookings.slice(0, 5).map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                      {booking.stationId.slice(-8)}...
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {booking.ownerNIC}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {formatDateTime(booking.reservationTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full border shadow-sm ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 mr-2 rounded-full ${booking.status?.toLowerCase() === "pending"
                              ? "bg-yellow-400"
                              : booking.status?.toLowerCase() === "approved"
                                ? "bg-green-400"
                                : booking.status?.toLowerCase() === "completed"
                                  ? "bg-blue-400"
                                  : booking.status?.toLowerCase() === "cancelled"
                                    ? "bg-red-400"
                                    : "bg-gray-400"
                            }`}
                        ></span>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {todayBookings.length > 5 && (
              <div className="px-6 py-3 text-sm text-center text-gray-500 bg-gray-50">
                Showing 5 of {todayBookings.length} bookings
              </div>
            )}
          </div>
        )}
      </div>

      {/* Upcoming Bookings */}
      <div className="p-8 bg-white rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            Upcoming Bookings (Next 7 Days)
          </h3>
          <button
            onClick={() => setShowBookingManagement(true)}
            className="px-4 py-2 text-sm font-medium text-white transition duration-200 bg-green-600 rounded-lg hover:bg-green-700"
          >
            View All
          </button>
        </div>
        {loading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : upcomingBookings.length === 0 ? (
          <div className="text-center text-gray-500">No upcoming bookings</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Station ID
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Owner NIC
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Time
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Days Until
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {upcomingBookings.slice(0, 5).map((booking) => {
                  const daysUntil = Math.ceil(
                    (new Date(booking.reservationTime) - new Date()) /
                    (1000 * 60 * 60 * 24)
                  );
                  return (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                        {booking.stationId.slice(-8)}...
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {booking.ownerNIC}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {formatDateTime(booking.reservationTime)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full border shadow-sm ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 mr-2 rounded-full ${booking.status?.toLowerCase() === "pending"
                                ? "bg-yellow-400"
                                : booking.status?.toLowerCase() === "approved"
                                  ? "bg-green-400"
                                  : booking.status?.toLowerCase() === "completed"
                                    ? "bg-blue-400"
                                    : booking.status?.toLowerCase() === "cancelled"
                                      ? "bg-red-400"
                                      : "bg-gray-400"
                              }`}
                          ></span>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {daysUntil} day{daysUntil !== 1 ? "s" : ""}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {upcomingBookings.length > 5 && (
              <div className="px-6 py-3 text-sm text-center text-gray-500 bg-gray-50">
                Showing 5 of {upcomingBookings.length} bookings
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardDetails;
