import React from "react";

const BookingStatus = ({ bookings }) => {
  // Helper function to filter bookings by status
  const getBookingCountByStatus = (status) => {
    return bookings.filter((b) => b.status && b.status.toLowerCase() === status.toLowerCase()).length;
  };

  return (
    <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-4">
      <div className="p-6 bg-white border-2 border-gray-200 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
        <div className="flex items-center">
          <div className="p-3 bg-blue-100 rounded-full">
            <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">Total Bookings</h3>
            <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
          </div>
        </div>
      </div>

      <div className="p-6 bg-white border-2 border-yellow-200 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
        <div className="flex items-center">
          <div className="p-3 bg-yellow-100 rounded-full">
            <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V5z" />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">Pending</h3>
            <p className="text-2xl font-bold text-yellow-600">
              {getBookingCountByStatus("pending")}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 bg-white border-2 border-green-200 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
        <div className="flex items-center">
          <div className="p-3 bg-green-100 rounded-full">
            <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0L3 10.414a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">Approved</h3>
            <p className="text-2xl font-bold text-green-600">
              {getBookingCountByStatus("approved")}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 bg-white border-2 border-blue-200 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
        <div className="flex items-center">
          <div className="p-3 bg-blue-100 rounded-full">
            <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">Completed</h3>
            <p className="text-2xl font-bold text-blue-600">
              {getBookingCountByStatus("completed")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingStatus;
