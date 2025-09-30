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

  useEffect(() => {
    if (initialData) setFormData(initialData);
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await onSave(formData);

    if (!result.success && result.validationErrors) {
      setErrors(result.validationErrors);
    } else {
      setErrors([]);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-lg font-bold mb-4">
          {initialData ? "Edit Station" : "Add New Station"}
        </h2>

        {errors.length > 0 && (
          <div className="bg-red-100 text-red-700 p-2 mb-3 rounded">
            {errors.map((err, idx) => (
              <p key={idx}>{err}</p>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            name="name"
            placeholder="Station Name"
            className="w-full border rounded px-3 py-2"
            value={formData.name}
            onChange={handleChange}
          />
          <input
            type="text"
            name="location"
            placeholder="Location"
            className="w-full border rounded px-3 py-2"
            value={formData.location}
            onChange={handleChange}
          />
          <select
            name="type"
            className="w-full border rounded px-3 py-2"
            value={formData.type}
            onChange={handleChange}
          >
            <option value="AC">AC</option>
            <option value="DC">DC</option>
          </select>
          <input
            type="number"
            name="availableSlots"
            placeholder="Available Slots"
            className="w-full border rounded px-3 py-2"
            value={formData.availableSlots}
            onChange={handleChange}
          />
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
            />
            <span>Active</span>
          </label>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
