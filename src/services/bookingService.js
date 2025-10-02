import { apiService } from "./SecureApiService.js";

// Input validation schema for Booking
const bookingValidationSchema = {
  stationId: { required: true, minLength: 1 },
  reservationTime: { required: true },
  ownerNIC: { required: true, minLength: 1 },
};

// Validation utility
const validateInput = (data, schema) => {
  const errors = [];

  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];

    if (rules.required && !value && value !== 0) {
      errors.push(`${field} is required`);
      continue;
    }

    if (value) {
      if (rules.minLength && String(value).length < rules.minLength) {
        errors.push(`${field} must be at least ${rules.minLength} characters`);
      }

      if (rules.maxLength && String(value).length > rules.maxLength) {
        errors.push(
          `${field} must be no more than ${rules.maxLength} characters`
        );
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const bookingService = {
  /**
   * Get all bookings
   * @returns {Promise<Array>} Array of booking objects
   */
  getAllBookings: async () => {
    try {
      const response = await apiService.client.get("/booking/all");
      return response.data;
    } catch (error) {
      console.error("Error fetching all bookings:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch bookings"
      );
    }
  },

  /**
   * Get bookings for a specific user by NIC
   * @param {string} ownerNIC - The NIC of the booking owner
   * @returns {Promise<Array>} Array of booking objects
   */
  getBookingsByOwner: async (ownerNIC) => {
    try {
      if (!ownerNIC) {
        throw new Error("Owner NIC is required");
      }

      const response = await apiService.client.get(
        `/booking/owner/${ownerNIC}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching bookings by owner:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch user bookings"
      );
    }
  },

  /**
   * Get a specific booking by ID
   * @param {string} bookingId - The booking ID
   * @returns {Promise<Object>} Booking object
   */
  getBookingById: async (bookingId) => {
    try {
      if (!bookingId) {
        throw new Error("Booking ID is required");
      }

      const response = await apiService.client.get(`/booking/${bookingId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching booking by ID:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch booking"
      );
    }
  },

  /**
   * Create a new booking
   * @param {Object} bookingData - The booking data
   * @param {string} bookingData.stationId - The station ID
   * @param {string} bookingData.ownerNIC - The owner's NIC
   * @param {string} bookingData.reservationTime - The reservation time
   * @returns {Promise<Object>} Created booking object
   */
  createBooking: async (bookingData) => {
    try {
      // Validate input
      const validation = validateInput(bookingData, bookingValidationSchema);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      const response = await apiService.client.post("/booking", bookingData);
      return response.data;
    } catch (error) {
      console.error("Error creating booking:", error);
      throw new Error(
        error.response?.data?.message || "Failed to create booking"
      );
    }
  },

  /**
   * Update booking status (except approve)
   * @param {string} bookingId - The booking ID
   * @param {string} status - The new status (Pending, Cancelled, Completed)
   * @returns {Promise<Object>} Updated booking object
   */
  updateBookingStatus: async (bookingId, status) => {
    try {
      if (!bookingId) {
        throw new Error("Booking ID is required");
      }

      if (!status) {
        throw new Error("Status is required");
      }

      // Only allow status changes except "Approved"
      const validStatuses = ["Pending", "Cancelled", "Completed"];
      if (!validStatuses.includes(status)) {
        throw new Error(
          `Invalid status for this endpoint. Must be one of: ${validStatuses.join(", ")}`
        );
      }

      const response = await apiService.client.put(
        `/booking/${bookingId}/status`,
        {
          status,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating booking status:", error);
      throw new Error(
        error.response?.data?.message || "Failed to update booking status"
      );
    }
  },

  /**
   * Approve a booking (calls /booking/{id}/approve)
   * @param {string} bookingId - The booking ID
   * @returns {Promise<Object>} Updated booking object
   */
  approveBooking: async (bookingId) => {
    try {
      if (!bookingId) {
        throw new Error("Booking ID is required");
      }
      // POST to /booking/{id}/approve with { approve: true }
      const response = await apiService.client.post(
        `/booking/${bookingId}/approve`,
        { approve: true }
      );
      return response.data;
    } catch (error) {
      console.error("Error approving booking:", error);
      throw new Error(
        error.response?.data?.message || "Failed to approve booking"
      );
    }
  },

  /**
   * Cancel a booking
   * @param {string} bookingId - The booking ID
   * @returns {Promise<Object>} Updated booking object
   */
  cancelBooking: async (bookingId) => {
    try {
      return await bookingService.updateBookingStatus(bookingId, "Cancelled");
    } catch (error) {
      console.error("Error cancelling booking:", error);
      throw new Error("Failed to cancel booking");
    }
  },

  /**
   * Complete a booking
   * @param {string} bookingId - The booking ID
   * @returns {Promise<Object>} Updated booking object
   */
  completeBooking: async (bookingId) => {
    try {
      return await bookingService.updateBookingStatus(bookingId, "Completed");
    } catch (error) {
      console.error("Error completing booking:", error);
      throw new Error("Failed to complete booking");
    }
  },

  /**
   * Delete a booking
   * @param {string} bookingId - The booking ID
   * @returns {Promise<Object>} Success response
   */
  deleteBooking: async (bookingId) => {
    try {
      if (!bookingId) {
        throw new Error("Booking ID is required");
      }

      const response = await apiService.client.delete(`/booking/${bookingId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting booking:", error);
      throw new Error(
        error.response?.data?.message || "Failed to delete booking"
      );
    }
  },

  /**
   * Get bookings by station ID
   * @param {string} stationId - The station ID
   * @returns {Promise<Array>} Array of booking objects
   */
  getBookingsByStation: async (stationId) => {
    try {
      if (!stationId) {
        throw new Error("Station ID is required");
      }

      const response = await apiService.client.get(
        `/booking/station/${stationId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching bookings by station:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch station bookings"
      );
    }
  },

  /**
   * Get bookings by status
   * @param {string} status - The booking status
   * @returns {Promise<Array>} Array of booking objects
   */
  getBookingsByStatus: async (status) => {
    try {
      if (!status) {
        throw new Error("Status is required");
      }

      const response = await apiService.client.get(`/booking/status/${status}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching bookings by status:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch bookings by status"
      );
    }
  },
};

export default bookingService;
