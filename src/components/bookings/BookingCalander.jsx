import React, { useState, useEffect } from "react";
import { bookingService } from "../../services/bookingService";
import EnhancedStationService from "../../services/StationService";
import { useNotification } from "../../contexts/NotificationContext";

const BookingCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState([]);
  const [stations, setStations] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedStation, setSelectedStation] = useState("all");
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("month"); // month, week, day
  const { showError, showInfo } = useNotification();

  // Fetch bookings and stations
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [bookingsData, stationsData] = await Promise.all([
          bookingService.getAllBookings(),
          EnhancedStationService.getAll(),
        ]);

        setBookings(bookingsData);
        setStations(stationsData.success ? stationsData.data : []);
      } catch (error) {
        showError(`Failed to load calendar data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [showError]);

  // Calendar navigation
  const navigateCalendar = (direction) => {
    const newDate = new Date(currentDate);
    if (viewMode === "month") {
      newDate.setMonth(currentDate.getMonth() + direction);
    } else if (viewMode === "week") {
      newDate.setDate(currentDate.getDate() + direction * 7);
    } else {
      newDate.setDate(currentDate.getDate() + direction);
    }
    setCurrentDate(newDate);
  };

  // Get calendar days for month view
  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const current = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  // Get bookings for a specific date
  const getBookingsForDate = (date) => {
    return bookings.filter((booking) => {
      const bookingDate = new Date(booking.reservationTime);
      return (
        bookingDate.toDateString() === date.toDateString() &&
        (selectedStation === "all" || booking.stationId === selectedStation)
      );
    });
  };

  // Enhanced status colors for badges
  const getStatusColor = (status) => {
    if (!status) return "bg-gray-500";

    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "pending":
        return "bg-yellow-500";
      case "approved":
        return "bg-green-500";
      case "completed":
        return "bg-blue-500";
      case "cancelled":
      case "canceled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  // Get lighter background colors for status cards
  const getStatusBgColor = (status) => {
    if (!status) return "bg-gray-50 border-gray-200";

    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "pending":
        return "bg-yellow-50 border-yellow-200";
      case "approved":
        return "bg-green-50 border-green-200";
      case "completed":
        return "bg-blue-50 border-blue-200";
      case "cancelled":
      case "canceled":
        return "bg-red-50 border-red-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  // Get text colors for status
  const getStatusTextColor = (status) => {
    if (!status) return "text-gray-700";

    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "pending":
        return "text-yellow-800";
      case "approved":
        return "text-green-800";
      case "completed":
        return "text-blue-800";
      case "cancelled":
      case "canceled":
        return "text-red-800";
      default:
        return "text-gray-700";
    }
  };

  // Get border colors for status
  const getStatusBorderColor = (status) => {
    if (!status) return "border-gray-500";

    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "pending":
        return "border-yellow-500";
      case "approved":
        return "border-green-500";
      case "completed":
        return "border-blue-500";
      case "cancelled":
      case "canceled":
        return "border-red-500";
      default:
        return "border-gray-500";
    }
  };

  // Check if date is today
  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Check if date is in current month
  const isCurrentMonth = (date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format time for display
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get station name by ID
  const getStationName = (stationId) => {
    const station = stations.find((s) => s.id === stationId);
    return station ? station.name : "Unknown Station";
  };

  // Month view component
  const MonthView = () => {
    const days = getCalendarDays();
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
      <div className="bg-white rounded-lg shadow">
        {/* Week headers - Enhanced with color */}
        <div className="grid grid-cols-7 rounded-t-lg bg-slate-600">
          {weekDays.map((day) => (
            <div
              key={day}
              className="p-3 font-medium text-center text-white border-r border-slate-500 last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {days.map((date, index) => {
            const dayBookings = getBookingsForDate(date);
            const isCurrentMonthDay = isCurrentMonth(date);

            return (
              <div
                key={index}
                className={`min-h-[120px] p-2 border-r border-b border-gray-200 cursor-pointer transition-colors hover:bg-slate-50 ${!isCurrentMonthDay ? "bg-gray-100 text-gray-400" : ""
                  } ${isToday(date) ? "bg-blue-50 border-blue-300" : ""}`}
                onClick={() => setSelectedDate(date)}
              >
                <div
                  className={`text-sm font-medium mb-1 ${isToday(date) ? "text-blue-600 font-bold" : ""
                    }`}
                >
                  {date.getDate()}
                </div>

                {/* Booking indicators */}
                <div className="space-y-1">
                  {dayBookings.slice(0, 3).map((booking) => (
                    <div
                      key={booking.id}
                      className={`text-xs p-1.5 rounded-md text-white font-medium truncate ${getStatusColor(
                        booking.status
                      )} shadow-sm`}
                      title={`${getStationName(
                        booking.stationId
                      )} - ${formatTime(booking.reservationTime)} - ${booking.status
                        }`}
                    >
                      {formatTime(booking.reservationTime)} -{" "}
                      {getStationName(booking.stationId).substring(0, 10)}
                    </div>
                  ))}
                  {dayBookings.length > 3 && (
                    <div className="p-1 text-xs font-bold rounded text-slate-600 bg-slate-100">
                      +{dayBookings.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Day view component
  const DayView = () => {
    const dayBookings = getBookingsForDate(selectedDate || currentDate);
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200 bg-slate-600">
          <h3 className="text-lg font-semibold text-white">
            {formatDate(selectedDate || currentDate)}
          </h3>
        </div>

        <div className="overflow-y-auto max-h-96">
          {hours.map((hour) => {
            const hourBookings = dayBookings.filter((booking) => {
              const bookingHour = new Date(booking.reservationTime).getHours();
              return bookingHour === hour;
            });

            return (
              <div key={hour} className="flex border-b border-gray-100">
                <div className="w-16 p-2 text-sm font-medium border-r border-gray-200 text-slate-600 bg-slate-50">
                  {hour.toString().padStart(2, "0")}:00
                </div>
                <div className="flex-1 p-2">
                  {hourBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className={`mb-2 p-3 rounded-lg border-l-4 ${getStatusBgColor(booking.status)} ${getStatusBorderColor(booking.status)}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-slate-800">
                            {formatTime(booking.reservationTime)} - {getStationName(booking.stationId)}
                          </div>
                          <div className="text-sm text-slate-600">
                            Owner: {booking.ownerNIC}
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 text-xs font-bold text-white rounded-full ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Selected date details
  const DateDetails = () => {
    if (!selectedDate) return null;

    const dayBookings = getBookingsForDate(selectedDate);

    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <h3 className="mb-3 text-lg font-semibold text-slate-700">
          Bookings for {formatDate(selectedDate)}
        </h3>

        {dayBookings.length === 0 ? (
          <p className="text-slate-500">No bookings for this date</p>
        ) : (
          <div className="space-y-3">
            {dayBookings.map((booking) => (
              <div
                key={booking.id}
                className={`p-4 border-l-4 rounded-lg ${getStatusBgColor(booking.status)} ${getStatusBorderColor(booking.status)}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-lg font-semibold text-slate-800">
                      {getStationName(booking.stationId)}
                    </div>
                    <div className={`text-sm font-medium ${getStatusTextColor(booking.status)}`}>
                      Time: {formatTime(booking.reservationTime)}
                    </div>
                    <div className="text-sm text-slate-600">
                      Owner: {booking.ownerNIC}
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 text-sm font-bold text-white rounded-full ${getStatusColor(
                      booking.status
                    )}`}
                  >
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-b-2 rounded-full border-slate-600 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="mb-6 space-y-6">
      {/* Header */}
      <div className="p-6 bg-white rounded-lg shadow">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Booking Calendar
            </h2>
            <p className="mt-1 text-slate-600">
              {currentDate.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-col gap-4 sm:flex-row">
            {/* Station Filter */}
            <select
              value={selectedStation}
              onChange={(e) => setSelectedStation(e.target.value)}
              className="px-3 py-2 text-sm border rounded-md border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Stations</option>
              {stations.map((station) => (
                <option key={station.id} value={station.id}>
                  {station.name}
                </option>
              ))}
            </select>

            {/* View Mode */}
            <div className="flex rounded-md bg-slate-100">
              {["month", "day"].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${viewMode === mode
                      ? "bg-slate-600 text-white"
                      : "text-slate-700 hover:text-slate-900"
                    }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex gap-2">
              <button
                onClick={() => navigateCalendar(-1)}
                className="px-3 py-2 text-sm font-medium bg-white border rounded-md text-slate-700 border-slate-300 hover:bg-slate-50"
              >
                ← Previous
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-md hover:bg-blue-700"
              >
                Today
              </button>
              <button
                onClick={() => navigateCalendar(1)}
                className="px-3 py-2 text-sm font-medium bg-white border rounded-md text-slate-700 border-slate-300 hover:bg-slate-50"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="p-4 bg-white rounded-lg shadow">
        <h3 className="mb-3 text-sm font-medium text-slate-800">
          Status Legend
        </h3>
        <div className="flex flex-wrap gap-4">
          {[
            { status: "Pending", color: "bg-yellow-500" },
            { status: "Approved", color: "bg-green-500" },
            { status: "Completed", color: "bg-blue-500" },
            { status: "Cancelled", color: "bg-red-500" },
          ].map((item) => (
            <div key={item.status} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded ${item.color}`}></div>
              <span className="text-sm text-slate-700">{item.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar Views */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {viewMode === "month" ? <MonthView /> : <DayView />}
        </div>
        <div>
          <DateDetails />
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="p-4 bg-white rounded-lg shadow">
          <div className="text-2xl font-bold text-slate-700">
            {bookings.length}
          </div>
          <div className="text-sm text-slate-600">Total Bookings</div>
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <div className="text-2xl font-bold text-yellow-600">
            {bookings.filter((b) => b.status === "Pending").length}
          </div>
          <div className="text-sm text-slate-600">Pending</div>
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">
            {bookings.filter((b) => b.status === "Approved").length}
          </div>
          <div className="text-sm text-slate-600">Approved</div>
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">
            {bookings.filter((b) => b.status === "Completed").length}
          </div>
          <div className="text-sm text-slate-600">Completed</div>
        </div>
      </div>
    </div>
  );
};

export default BookingCalendar;