export default function StationCard({ station, onEdit, onDelete, onToggleStatus }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg">{station.name}</h3>
          <p className="text-gray-600 text-sm mt-1">{station.location}</p>
        </div>
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
      </div>

      <div className="grid grid-cols-2 gap-4 py-2 border-t border-gray-100">
        <div>
          <span className="text-sm text-gray-500">Type</span>
          <div className="mt-1">
            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
              station.type === 'AC' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-purple-100 text-purple-800'
            }`}>
              {station.type}
            </span>
          </div>
        </div>
        <div>
          <span className="text-sm text-gray-500">Available Slots</span>
          <div className="mt-1 text-lg font-semibold text-gray-900">
            {station.availableSlots}
          </div>
        </div>
      </div>

      <div className="flex flex-col space-y-2 pt-2 border-t border-gray-100">
        <button
          onClick={() => onEdit(station)}
          className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit Station
        </button>
        
        <div className="grid grid-cols-2 gap-2">
          {station.isActive ? (
            <button
              onClick={() => onToggleStatus(station.id, false)}
              className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-orange-600 bg-orange-50 rounded-md hover:bg-orange-100 transition-colors"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14L21 3m0 0h-5.586A1.414 1.414 0 0014 4.414L21 3zM7 7l8 8M3 21l8-8" />
              </svg>
              Deactivate
            </button>
          ) : (
            <button
              onClick={() => onToggleStatus(station.id, true)}
              className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-md hover:bg-green-100 transition-colors"
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
            className={`inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              station.isActive
                ? "text-gray-400 bg-gray-50 cursor-not-allowed"
                : "text-red-600 bg-red-50 hover:bg-red-100"
            }`}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}