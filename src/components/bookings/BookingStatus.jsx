import React from "react";

const BookingStatus = ({ bookings }) => {
  return (
    <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-4">
      <div className="p-4 bg-white border rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">Total Bookings</h3>
        <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
      </div>
      <div className="p-4 bg-white border rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">Pending</h3>
        <p className="text-2xl font-bold text-yellow-600">
          {bookings.filter((b) => b.status === "Pending").length}
        </p>
      </div>
      <div className="p-4 bg-white border rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">Approved</h3>
        <p className="text-2xl font-bold text-green-600">
          {bookings.filter((b) => b.status === "Approved").length}
        </p>
      </div>
      <div className="p-4 bg-white border rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">Completed</h3>
        <p className="text-2xl font-bold text-blue-600">
          {bookings.filter((b) => b.status === "Completed").length}
        </p>
      </div>
    </div>
  );
};

export default BookingStatus;
