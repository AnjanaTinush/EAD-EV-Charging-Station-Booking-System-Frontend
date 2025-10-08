import React, { useState, useEffect } from "react";
import { bookingService } from "../../services/bookingService";
import EnhancedStationService from "../../services/StationService";
import { useNotification } from "../../contexts/NotificationContext";
import ErrorModal from "../ErrorModal";
import { userAPI } from "../../services/api"; // <-- import userAPI

const BookingForm = ({ onBookingCreated, onCancel }) => {
    const [formData, setFormData] = useState({
        stationId: "",
        ownerNIC: "",
        reservationTime: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [stations, setStations] = useState([]);
    const [loadingStations, setLoadingStations] = useState(true);
    const { showSuccess, showError, showWarning } = useNotification();
    const [errorModal, setErrorModal] = useState({ show: false, message: "" });
    const [nicError, setNicError] = useState("");
    const [allUsers, setAllUsers] = useState([]);
    const [relevantUser, setRelevantUser] = useState(null);
    const [usersLoading, setUsersLoading] = useState(false);

    useEffect(() => {
        const fetchStations = async () => {
            setLoadingStations(true);
            const result = await EnhancedStationService.getAll();
            if (result.success) {
                setStations(result.data);
            } else {
                setStations([]);
            }
            setLoadingStations(false);
        };
        fetchStations();
    }, []);

    useEffect(() => {
        // Fetch all users once
        const fetchUsers = async () => {
            setUsersLoading(true);
            try {
                const users = await userAPI.getAllUsers();
                setAllUsers(users);
            } catch {
                setAllUsers([]);
            } finally {
                setUsersLoading(false);
            }
        };
        fetchUsers();
    }, []);

    useEffect(() => {
        // Filter relevant user by NIC
        if (formData.ownerNIC.length === 12) {
            const found = allUsers.find(
                (u) => u.nic && u.nic.toLowerCase() === formData.ownerNIC.toLowerCase()
            );
            setRelevantUser(found || null);
        } else {
            setRelevantUser(null);
        }
    }, [formData.ownerNIC, allUsers]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (name === "ownerNIC") {
            // Validate for exactly 12 characters (Sri Lankan new NIC)
            if (value.length !== 12) {
                setNicError("NIC must be exactly 12 characters.");
            } else {
                setNicError("");
            }
        }
    };

    const showErrorModal = (msg) => setErrorModal({ show: true, message: msg });
    const closeErrorModal = () => setErrorModal({ show: false, message: "" });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (
            !formData.stationId ||
            !formData.ownerNIC ||
            !formData.reservationTime
        ) {
            showError("Please fill in all required fields");
            showErrorModal("Please fill in all required fields");
            return;
        }

        // Sri Lankan NIC validation: exactly 12 characters
        if (formData.ownerNIC.length !== 12) {
            showError("NIC must be exactly 12 characters");
            showErrorModal("NIC must be exactly 12 characters");
            return;
        }

        // Check user active status
        if (relevantUser && relevantUser.isActive === false) {
            showWarning("This user is inactive and cannot make a booking");
            showErrorModal("This user is inactive and cannot make a booking");
            return;
        }

        // Reservation time validation: must be within 7 days from now
        const now = new Date();
        const reservationDate = new Date(formData.reservationTime);
        const diffMs = reservationDate - now;
        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        if (diffDays < 0) {
            showError("Reservation date/time cannot be in the past");
            showErrorModal("Reservation date/time cannot be in the past");
            return;
        }
        if (diffDays > 7) {
            showWarning("Reservation date/time must be within 7 days from today");
            showErrorModal("Reservation date/time must be within 7 days from today");
            return;
        }

        try {
            setIsSubmitting(true);
            const newBooking = await bookingService.createBooking(formData);
            showSuccess(`Booking created successfully! Booking ID: ${newBooking.id.slice(-8)}`);
            onBookingCreated?.(newBooking);

            // Reset form
            setFormData({
                stationId: "",
                ownerNIC: "",
                reservationTime: "",
            });
        } catch (error) {
            showError(`Failed to create booking: ${error.message}`);
            showErrorModal(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
                <h2 className="mb-4 text-xl font-bold text-gray-900">Create Booking</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Station ID Dropdown */}
                    <div className="mb-4">
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                            Station
                        </label>
                        <select
                            name="stationId"
                            value={formData.stationId}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded"
                            required
                            disabled={loadingStations}
                        >
                            <option value="">Select Station</option>
                            {stations.map((station) => (
                                <option
                                    key={station.id}
                                    value={station.id}
                                    disabled={!station.isActive}
                                    style={!station.isActive ? { color: "#aaa" } : {}}
                                >
                                    {station.name} ({station.id.slice(-8)})
                                    {!station.isActive ? " [Inactive]" : ""}
                                </option>
                            ))}
                        </select>
                        <div className="mt-1 text-xs text-gray-500">
                            <span className="font-semibold">Note:</span> Inactive stations are
                            shown but cannot be selected.
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="ownerNIC"
                            className="block mb-1 text-sm font-medium text-gray-700"
                        >
                            Owner NIC *
                        </label>
                        <input
                            type="text"
                            id="ownerNIC"
                            name="ownerNIC"
                            value={formData.ownerNIC}
                            onChange={handleChange}
                            required
                            maxLength={12}
                            minLength={10}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter NIC number"
                        />
                        {nicError && (
                            <div className="mt-1 text-xs text-red-600">{nicError}</div>
                        )}
                        {/* Relevant user info */}
                        {formData.ownerNIC.length === 12 && (
                            <div className="mt-2">
                                {usersLoading ? (
                                    <div className="text-xs text-gray-500">
                                        Loading user info...
                                    </div>
                                ) : relevantUser ? (
                                    <div className="p-2 mt-1 text-xs border border-blue-100 rounded bg-blue-50">
                                        <div>
                                            <span className="font-semibold">Name:</span>{" "}
                                            {relevantUser.username || relevantUser.name}
                                        </div>
                                        <div>
                                            <span className="font-semibold">Email:</span>{" "}
                                            {relevantUser.email}
                                        </div>
                                        <div>
                                            <span className="font-semibold">Phone:</span>{" "}
                                            {relevantUser.phone}
                                        </div>
                                        <div>
                                            <span className="font-semibold">Role:</span>{" "}
                                            {relevantUser.role}
                                        </div>
                                        <div>
                                            <span className="font-semibold">Status:</span>{" "}
                                            {relevantUser.isActive ? (
                                                <span className="text-green-600">Active</span>
                                            ) : (
                                                <span className="text-red-600">
                                                    Inactive (cannot book)
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mt-1 text-xs text-red-500">
                                        No user found for this NIC.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="reservationTime"
                            className="block mb-1 text-sm font-medium text-gray-700"
                        >
                            Reservation Time *
                        </label>
                        <input
                            type="datetime-local"
                            id="reservationTime"
                            name="reservationTime"
                            value={formData.reservationTime}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min={new Date().toISOString().slice(0, 16)}
                        />
                    </div>

                    <div className="flex justify-end pt-4 space-x-3">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "Creating..." : "Create Booking"}
                        </button>
                    </div>
                </form>
            </div>
            {errorModal.show && (
                <ErrorModal message={errorModal.message} onClose={closeErrorModal} />
            )}
        </div>
    );
};

export default BookingForm;

