import React, { useState } from 'react';
import { bookingService } from '../services/bookingService';
import { useToast } from '../hooks/useToast';

const BookingForm = ({ onBookingCreated, onCancel }) => {
    const [formData, setFormData] = useState({
        stationId: '',
        ownerNIC: '',
        reservationTime: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showToast } = useToast();

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
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Booking</h3>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="stationId" className="block text-sm font-medium text-gray-700 mb-1">
                                Station ID *
                            </label>
                            <input
                                type="text"
                                id="stationId"
                                name="stationId"
                                value={formData.stationId}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter station ID"
                            />
                        </div>

                        <div>
                            <label htmlFor="ownerNIC" className="block text-sm font-medium text-gray-700 mb-1">
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
                            <label htmlFor="reservationTime" className="block text-sm font-medium text-gray-700 mb-1">
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

                        <div className="flex justify-end space-x-3 pt-4">
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
        </div>
    );
};

export default BookingForm;