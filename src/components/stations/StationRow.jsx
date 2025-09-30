export default function StationRow({ station, onEdit, onDelete, onToggleStatus }) {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="p-4">
        <div className="font-medium text-gray-900">{station.name}</div>
      </td>
      <td className="p-4">
        <div className="text-gray-600">{station.location}</div>
      </td>
      <td className="p-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          station.type === 'AC' 
            ? 'bg-blue-100 text-blue-800' 
            : 'bg-purple-100 text-purple-800'
        }`}>
          {station.type}
        </span>
      </td>
      <td className="p-4">
        <div className="flex items-center">
          <span className="text-gray-900 font-medium">{station.availableSlots}</span>
          <span className="text-gray-500 text-sm ml-1">slots</span>
        </div>
      </td>
      <td className="p-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          station.isActive 
            ? "bg-green-100 text-green-800" 
            : "bg-gray-100 text-gray-800"
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
            station.isActive ? 'bg-green-400' : 'bg-gray-400'
          }`}></div>
          {station.isActive ? "Active" : "Inactive"}
        </span>
      </td>
      <td className="p-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(station)}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
            title="Edit station"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
          
          {station.isActive ? (
            <button
              onClick={() => onToggleStatus(station.id, false)}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-orange-600 bg-orange-50 rounded-md hover:bg-orange-100 transition-colors"
              title="Deactivate station"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14L21 3m0 0h-5.586A1.414 1.414 0 0014 4.414L21 3zM7 7l8 8M3 21l8-8" />
              </svg>
              Deactivate
            </button>
          ) : (
            <button
              onClick={() => onToggleStatus(station.id, true)}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-green-600 bg-green-50 rounded-md hover:bg-green-100 transition-colors"
              title="Activate station"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Activate
            </button>
          )}
          
          <button
            onClick={() => onDelete(station.id)}
            disabled={station.isActive}
            className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              station.isActive
                ? "text-gray-400 bg-gray-50 cursor-not-allowed"
                : "text-red-600 bg-red-50 hover:bg-red-100"
            }`}
            title={station.isActive ? "Deactivate station first to delete" : "Delete station"}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}
