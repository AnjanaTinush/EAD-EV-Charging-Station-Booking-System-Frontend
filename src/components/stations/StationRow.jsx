export default function StationRow({ station, onEdit, onDelete }) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="p-2 border">{station.name}</td>
      <td className="p-2 border">{station.location}</td>
      <td className="p-2 border">{station.type}</td>
      <td className="p-2 border">{station.availableSlots}</td>
      <td className="p-2 border">
        <span
          className={`px-2 py-1 rounded text-sm ${
            station.isActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"
          }`}
        >
          {station.isActive ? "Active" : "Inactive"}
        </span>
      </td>
      <td className="p-2 border space-x-2">
        <button
          onClick={() => onEdit(station)}
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(station.id)}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
        >
          Delete
        </button>
      </td>
    </tr>
  );
}
