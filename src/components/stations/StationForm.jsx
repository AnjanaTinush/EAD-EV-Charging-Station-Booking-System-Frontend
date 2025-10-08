import { useState, useEffect } from "react";

export default function StationForm({ initialData, onSave, onClose }) {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    location: "",
    type: "AC",
    availableSlots: 0,
    isActive: true
  });
  const [errors, setErrors] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) setFormData(initialData);
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
              onChange={handleChange}
              required
            />
            {fieldErrors.location && (
              <p className="text-red-600 text-sm mt-1">{fieldErrors.location}</p>
            )}
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
      </div>
    </div>
  );
}
