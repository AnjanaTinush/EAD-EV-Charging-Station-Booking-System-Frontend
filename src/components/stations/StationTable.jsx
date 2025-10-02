import StationRow from "./StationRow";
import StationCard from "./StationCard";

export default function StationTable({ stations, onEdit, onDelete, onToggleStatus, loading }) {
  const LoadingState = () => (
    <div className="p-8 text-center">
      <div className="flex items-center justify-center space-x-2">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
        <span className="text-gray-500">Loading stations...</span>
      </div>
    </div>
  );

  const EmptyState = () => (
    <div className="p-8 text-center">
      <div className="flex flex-col items-center justify-center space-y-3">
        <div className="text-gray-400">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <div className="text-gray-500 text-xl font-medium">No stations found</div>
        <div className="text-gray-400 text-sm max-w-md">
          {stations.length === 0 
            ? "Get started by adding your first charging station to begin managing your EV network."
            : "No stations match your current search criteria. Try adjusting your filters or search terms."
          }
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <LoadingState />
      </div>
    );
  }

  if (stations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <EmptyState />
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 text-left border-b border-gray-200">
                <th className="p-4 text-sm font-semibold text-gray-700">Name</th>
                <th className="p-4 text-sm font-semibold text-gray-700">Location</th>
                <th className="p-4 text-sm font-semibold text-gray-700">Type</th>
                <th className="p-4 text-sm font-semibold text-gray-700">Slots</th>
                <th className="p-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="p-4 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stations.map((st) => (
                <StationRow 
                  key={st.id} 
                  station={st} 
                  onEdit={onEdit} 
                  onDelete={onDelete} 
                  onToggleStatus={onToggleStatus}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {stations.map((st) => (
          <StationCard
            key={st.id}
            station={st}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleStatus={onToggleStatus}
          />
        ))}
      </div>
    </>
  );
}
