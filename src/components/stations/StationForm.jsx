import { useState, useEffect } from "react";
import LocationPicker from "./LocationPicker";

export default function StationForm({ initialData, onSave, onClose }) {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    location: "",
    coordinates: [0, 0], // [longitude, latitude] - MongoDB standard
    type: "AC",
    availableSlots: 0,
    isActive: true
  });
  const [errors, setErrors] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  useEffect(() => {
    if (initialData) {
      // Ensure coordinates array exists and has proper format
      const data = {
        ...initialData,
        coordinates: initialData.coordinates || [0, 0]
      };
      setFormData(data);
    }
  }, [initialData]);

  const validateField = (name, value) => {
    const newFieldErrors = { ...fieldErrors };
    
    switch (name) {
      case 'name':
        if (!value || value.trim().length < 2) {
          newFieldErrors.name = 'Station name must be at least 2 characters long';
        } else {
          delete newFieldErrors.name;
        }
        break;
      case 'location':
        if (!value || value.trim().length < 3) {
          newFieldErrors.location = 'Location must be at least 3 characters long';
        } else {
          delete newFieldErrors.location;
        }
        break;
      case 'availableSlots':
        if (!value || parseInt(value) < 1 || parseInt(value) > 50) {
          newFieldErrors.availableSlots = 'Available slots must be between 1 and 50';
        } else {
          delete newFieldErrors.availableSlots;
        }
        break;
      case 'coordinates':
        if (!value || !Array.isArray(value) || value.length !== 2) {
          newFieldErrors.coordinates = 'Coordinates must be an array with longitude and latitude';
        } else {
          const [lng, lat] = value;
          if (isNaN(parseFloat(lng)) || parseFloat(lng) < -180 || parseFloat(lng) > 180) {
            newFieldErrors.coordinates = 'Longitude must be between -180 and 180';
          } else if (isNaN(parseFloat(lat)) || parseFloat(lat) < -90 || parseFloat(lat) > 90) {
            newFieldErrors.coordinates = 'Latitude must be between -90 and 90';
          } else {
            delete newFieldErrors.coordinates;
          }
        }
        break;
      default:
        break;
    }
    
    setFieldErrors(newFieldErrors);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    
    setFormData({
      ...formData,
      [name]: newValue
    });
    
    // Validate field on change
    if (name !== 'type' && name !== 'isActive') {
      validateField(name, newValue);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields before submission
    validateField('name', formData.name);
    validateField('location', formData.location);
    validateField('coordinates', formData.coordinates);
    validateField('availableSlots', formData.availableSlots);
    
    // Check if there are any field errors
    if (Object.keys(fieldErrors).length > 0) {
      return;
    }
    
    setIsSubmitting(true);
    const result = await onSave(formData);

    if (!result.success && result.validationErrors) {
      setErrors(result.validationErrors);
    } else {
      setErrors([]);
      onClose();
    }
    setIsSubmitting(false);
  };

  const handleLocationChange = (lat, lng, locationName) => {
    const coordinates = [parseFloat(lng), parseFloat(lat)]; // [longitude, latitude] - MongoDB standard

    // Truncate location name if it's too long for validation/backend
    const maxLocationLength = 250;
    const truncatedLocation = locationName
      ? (locationName.length > maxLocationLength ? locationName.slice(0, maxLocationLength) : locationName)
      : formData.location;

    setFormData({
      ...formData,
      coordinates: coordinates,
      location: truncatedLocation // Use the fetched (possibly truncated) location name or keep existing
    });
    
    // Validate the new coordinates
    validateField('coordinates', coordinates);
    if (locationName) {
      validateField('location', locationName);
    }
  };

  const openLocationPicker = () => {
    setShowLocationPicker(true);
  };

  const closeLocationPicker = () => {
    setShowLocationPicker(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {initialData ? "Edit Station" : "Add New Station"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 mb-4 rounded-lg">
            <div className="flex items-center mb-1">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Validation Errors</span>
            </div>
            {errors.map((err, idx) => (
              <p key={idx} className="text-sm">{err}</p>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Station Name *
            </label>
            <input
              type="text"
              name="name"
              placeholder="Enter station name"
              className={`w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                fieldErrors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              value={formData.name}
              onChange={handleChange}
              required
            />
            {fieldErrors.name && (
              <p className="text-red-600 text-sm mt-1">{fieldErrors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location *
            </label>
            <input
              type="text"
              name="location"
              placeholder="Enter station location"
              className={`w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                fieldErrors.location ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              value={formData.location}
              maxLength={250}
              onChange={handleChange}
              required
            />
            {fieldErrors.location && (
              <p className="text-red-600 text-sm mt-1">{fieldErrors.location}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Longitude *
              </label>
              <input
                type="number"
                name="longitude"
                placeholder="e.g., 79.8612"
                step="any"
                className={`w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                  fieldErrors.coordinates ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                value={formData.coordinates[0] || ''}
                onChange={(e) => {
                  const newCoordinates = [parseFloat(e.target.value) || 0, formData.coordinates[1] || 0];
                  setFormData({...formData, coordinates: newCoordinates});
                  validateField('coordinates', newCoordinates);
                }}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Latitude *
              </label>
              <input
                type="number"
                name="latitude"
                placeholder="e.g., 6.9271"
                step="any"
                className={`w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                  fieldErrors.coordinates ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                value={formData.coordinates[1] || ''}
                onChange={(e) => {
                  const newCoordinates = [formData.coordinates[0] || 0, parseFloat(e.target.value) || 0];
                  setFormData({...formData, coordinates: newCoordinates});
                  validateField('coordinates', newCoordinates);
                }}
                required
              />
            </div>
          </div>
          
          {fieldErrors.coordinates && (
            <div className="text-center">
              <p className="text-red-600 text-sm">{fieldErrors.coordinates}</p>
            </div>
          )}

          <div className="flex justify-center">
            <button
              type="button"
              onClick={openLocationPicker}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Select Location on Map</span>
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Charging Type
            </label>
            <select
              name="type"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
              value={formData.type}
              onChange={handleChange}
            >
              <option value="AC">AC Charging</option>
              <option value="DC">DC Fast Charging</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available Slots *
            </label>
            <input
              type="number"
              name="availableSlots"
              placeholder="Number of charging slots"
              min="1"
              max="50"
              className={`w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                fieldErrors.availableSlots ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              value={formData.availableSlots}
              onChange={handleChange}
              required
            />
            {fieldErrors.availableSlots && (
              <p className="text-red-600 text-sm mt-1">{fieldErrors.availableSlots}</p>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="isActive"
              id="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Station is active and available for bookings
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              disabled={isSubmitting || Object.keys(fieldErrors).length > 0}
            >
              {isSubmitting && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <span>{isSubmitting ? 'Saving...' : 'Save Station'}</span>
            </button>
          </div>
        </form>

        <LocationPicker
          coordinates={formData.coordinates}
          onLocationChange={handleLocationChange}
          isOpen={showLocationPicker}
          onClose={closeLocationPicker}
        />
      </div>
    </div>
  );
}
