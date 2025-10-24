import { apiService } from "./SecureApiService.js";

// Input validation schema for Booking
const bookingValidationSchema = {
  stationId: { required: true, minLength: 1 },
  reservationTime: { required: true },
  ownerNIC: { required: true, minLength: 10, maxLength: 12 }, // Sri Lankan NIC: exactly 12 chars
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

// Helper function to handle API requests with better error handling
const makeApiRequest = async (requestFn) => {
  try {
    return await requestFn();
  } catch (error) {
    // Handle CORS and network errors specifically
    if (error.code === "ERR_NETWORK" || error.message.includes("CORS")) {
      throw new Error(
        "Unable to connect to the API server. Please check if the server is running and CORS is properly configured."
      );
    }

    if (error.response?.status === 0) {
      throw new Error(
        "Network error: Unable to reach the API server. Please check your connection and server status."
      );
    }

    throw new Error(
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred"
    );
  }
};

export const bookingService = {
  /**
   * Get all bookings
   * @returns {Promise<Array>} Array of booking objects
   */
  getAllBookings: async () => {
    return makeApiRequest(async () => {
      const response = await apiService.client.get("/booking/all");
      return response.data;
    });
  },

  /**
   * Get bookings for a specific user by NIC
   * @param {string} ownerNIC - The NIC of the booking owner
   * @returns {Promise<Array>} Array of booking objects
   */
  getBookingsByOwner: async (ownerNIC) => {
    if (!ownerNIC) {
      throw new Error("Owner NIC is required");
    }

    return makeApiRequest(async () => {
      const response = await apiService.client.get(
        `/booking/owner/${ownerNIC}`
      );
      return response.data;
    });
  },

  /**
   * Get a specific booking by ID
   * @param {string} bookingId - The booking ID
   * @returns {Promise<Object>} Booking object
   */
  getBookingById: async (bookingId) => {
    if (!bookingId) {
      throw new Error("Booking ID is required");
    }

    return makeApiRequest(async () => {
      const response = await apiService.client.get(`/booking/${bookingId}`);
      return response.data;
    });
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
    // Validate input
    const validation = validateInput(bookingData, bookingValidationSchema);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
    }

    return makeApiRequest(async () => {
      const response = await apiService.client.post("/booking", bookingData);
      return response.data;
    });
  },

  /**
   * Update booking status (except approve)
   * @param {string} bookingId - The booking ID
   * @param {string} status - The new status (Pending, Cancelled, Completed)
   * @returns {Promise<Object>} Updated booking object
   */
  updateBookingStatus: async (bookingId, status) => {
    if (!bookingId) {
      throw new Error("Booking ID is required");
    }

    if (!status) {
      throw new Error("Status is required");
    }

    // Validate status - API expects exact case: Pending, Cancelled, Completed
    const validStatuses = ["Pending", "Cancelled", "Completed"];
    if (!validStatuses.includes(status)) {
      throw new Error(
        `Invalid status for this endpoint. Must be one of: ${validStatuses.join(
          ", "
        )}`
      );
    }

    return makeApiRequest(async () => {
      const response = await apiService.client.put(
        `/booking/${bookingId}/status`,
        { status }
      );
      return response.data;
    });
  },

  /**
   * Approve a booking (calls /booking/{id}/approve)
   * @param {string} bookingId - The booking ID
   * @returns {Promise<Object>} Updated booking object
   */
  approveBooking: async (bookingId) => {
    if (!bookingId) {
      throw new Error("Booking ID is required");
    }

    return makeApiRequest(async () => {
      const response = await apiService.client.post(
        `/booking/${bookingId}/approve`,
        true // Send boolean true directly as shown in the API response
      );
      return response.data;
    });
  },

  /**
   * Cancel a booking with reason
   * @param {string} bookingId - The booking ID
   * @param {string} reason - Reason for cancellation
   * @returns {Promise<Object>} Updated booking object
   */
  cancelBooking: async (bookingId, reason) => {
    if (!bookingId) throw new Error("Booking ID is required");
    if (!reason) throw new Error("Cancellation reason is required");

    return makeApiRequest(async () => {
      // Try sending as JSON object first
      try {
        const response = await apiService.client.post(
          `/booking/${bookingId}/cancel`,
          { reason: reason }
        );
        return response.data;
      } catch (error) {
        // If that fails, try sending as plain string
        const response = await apiService.client.post(
          `/booking/${bookingId}/cancel`,
          reason,
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        return response.data;
      }
    });
  },

  /**
   * Complete a booking (calls /booking/{id}/complete with notes)
   * @param {string} bookingId - The booking ID
   * @returns {Promise<Object>} Updated booking object
   */
  completeBooking: async (bookingId) => {
    if (!bookingId) throw new Error("Booking ID is required");

    return makeApiRequest(async () => {
      // Try sending as JSON object first
      try {
        const response = await apiService.client.post(
          `/booking/${bookingId}/complete`,
          { notes: "Charging session completed successfully" }
        );
        return response.data;
      } catch (error) {
        // If that fails, try sending as plain string
        const response = await apiService.client.post(
          `/booking/${bookingId}/complete`,
          "Charging session completed successfully",
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        return response.data;
      }
    });
  },

  /**
   * Delete a booking
   * @param {string} bookingId - The booking ID
   * @returns {Promise<Object>} Success response
   */
  deleteBooking: async (bookingId) => {
    if (!bookingId) {
      throw new Error("Booking ID is required");
    }

    return makeApiRequest(async () => {
      const response = await apiService.client.delete(`/booking/${bookingId}`);
      return response.data;
    });
  },

  /**
   * Get bookings by station ID
   * @param {string} stationId - The station ID
   * @returns {Promise<Array>} Array of booking objects
   */
  getBookingsByStation: async (stationId) => {
    if (!stationId) {
      throw new Error("Station ID is required");
    }

    return makeApiRequest(async () => {
      const response = await apiService.client.get(
        `/booking/station/${stationId}`
      );
      return response.data;
    });
  },

  /**
   * Get bookings by status
   * @param {string} status - The booking status
   * @returns {Promise<Array>} Array of booking objects
   */
  getBookingsByStatus: async (status) => {
    if (!status) {
      throw new Error("Status is required");
    }

    return makeApiRequest(async () => {
      const response = await apiService.client.get(`/booking/status/${status}`);
      return response.data;
    });
  },

  /**
   * Update reservation time (must be at least 12 hours before the current reservation)
   * @param {string} bookingId
   * @param {string} newReservationTime (ISO string)
   * @param {string} currentReservationTime (ISO string)
   * @returns {Promise<Object>} Updated booking object
   */
  updateReservationTime: async (
    bookingId,
    newReservationTime,
    currentReservationTime
  ) => {
    // Check if update is at least 12 hours before the current reservation
    const now = new Date();
    const currentResDate = new Date(currentReservationTime);
    const diffMs = currentResDate - now;
    const diffHours = diffMs / (1000 * 60 * 60);
    if (diffHours < 12) {
      throw new Error(
        "You can only update reservations at least 12 hours before the reservation time."
      );
    }
    // Optionally: You may want to check that the newReservationTime is valid (not in the past)
    const newResDate = new Date(newReservationTime);
    if (newResDate < now) {
      throw new Error("New reservation time cannot be in the past.");
    }

    return makeApiRequest(async () => {
      const response = await apiService.client.put(
        `/booking/${bookingId}`,
        { newReservationTime }
      );
      return response.data;
    });
  },
};

export default bookingService;
