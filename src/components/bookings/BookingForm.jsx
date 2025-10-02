import React, { useState, useEffect } from 'react';
import { bookingService } from '../../services/bookingService';
import EnhancedStationService from '../../services/StationService';
import { useToast } from '../../hooks/useToast';

const BookingForm = ({ onBookingCreated, onCancel }) => {
    const [formData, setFormData] = useState({
        stationId: '',
        ownerNIC: '',
        reservationTime: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [stations, setStations] = useState([]);
    const [loadingStations, setLoadingStations] = useState(true);
    const { showToast } = useToast();

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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.stationId || !formData.ownerNIC || !formData.reservationTime) {
            showToast('Please fill in all required fields', 'error');
            return;
        }

        try {
            setIsSubmitting(true);
            const newBooking = await bookingService.createBooking(formData);
            showToast('Booking created successfully', 'success');
            onBookingCreated?.(newBooking);

            // Reset form
            setFormData({
                stationId: '',
                ownerNIC: '',
                reservationTime: ''
            });
        } catch (error) {
            showToast(error.message, 'error');
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
                                <option key={station.id} value={station.id}>
                                    {station.name} ({station.id.slice(-8)})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="ownerNIC" className="block mb-1 text-sm font-medium text-gray-700">
                            Owner NIC *
                        </label>
                        <input
                            type="text"
                            id="ownerNIC"
                            name="ownerNIC"
                            value={formData.ownerNIC}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter NIC number"
                        />
                    </div>

                    <div>
                        <label htmlFor="reservationTime" className="block mb-1 text-sm font-medium text-gray-700">
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
                            {isSubmitting ? 'Creating...' : 'Create Booking'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BookingForm;