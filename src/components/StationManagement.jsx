import { useEffect, useState, useCallback } from "react";
import EnhancedStationService from "../services/StationService";
import StationFilters from "./stations/StationFilters";
import StationTable from "./stations/StationTable";
import StationForm from "./stations/StationForm";
import StationStats from "./stations/StationStats";
import Toast from "./Toast";
import { useToast } from "../hooks/useToast";
import { useConfirmation } from "../hooks/useConfirmation";

export default function StationManagement() {
  const [stations, setStations] = useState([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingStation, setEditingStation] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const { toasts, showSuccess, showError, showWarning, showInfo, removeToast } = useToast();
  const { showConfirmation, ConfirmationComponent } = useConfirmation();

  const loadStations = useCallback(async () => {
    setLoading(true);
    const res = await EnhancedStationService.getAll();
    if (res.success) {
      setStations(res.data);
    } else {
      showError(`Failed to load stations: ${res.error}`);
    }
    setLoading(false);
  }, [showError]);

  useEffect(() => {
    loadStations();
  }, [loadStations]);

  const handleSave = async (station) => {
    if (editingStation) {
      return await EnhancedStationService.update(editingStation.id, station).then((res) => {
        if (res.success) {
          loadStations();
        }
        return res;
      });
    } else {
      return await EnhancedStationService.create(station).then((res) => {
        if (res.success) {
          loadStations();
        }
        return res;
      });
    }
  };

  const handleDelete = async (id) => {
    const station = stations.find(s => s.id === id);
    
    if (station?.isActive) {
      showWarning("Cannot delete an active station. Please deactivate it first.");
      return;
    }
    
    const confirmed = await showConfirmation({
      title: 'Delete Station',
      message: `Are you sure you want to delete "${station?.name || 'Unknown Station'}"? This action cannot be undone and will permanently remove the station from the system.`,
      confirmText: 'Delete',
      confirmButtonClass: 'bg-red-500 hover:bg-red-600'
    });

    if (confirmed) {
      setLoading(true);
      showInfo("Deleting station...");
      
      const res = await EnhancedStationService.delete(id);
      if (res.success) {
        setStations(stations.filter((s) => s.id !== id));
        showSuccess(`Station "${station?.name}" deleted successfully`);
      } else {
        showError(`Failed to delete station: ${res.error}`);
      }
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, newStatus) => {
    const station = stations.find(s => s.id === id);
    const action = newStatus ? 'activate' : 'deactivate';
    const actionPast = newStatus ? 'activated' : 'deactivated';
    
    const confirmMessage = newStatus
      ? `Are you sure you want to activate "${station?.name || 'Unknown Station'}"? This will make the station available for bookings.`
      : `Are you sure you want to deactivate "${station?.name || 'Unknown Station'}"? This will prevent new bookings but won't affect existing ones.`;
      
    const confirmed = await showConfirmation({
      title: newStatus ? 'Activate Station' : 'Deactivate Station',
      message: confirmMessage,
      confirmText: newStatus ? 'Activate' : 'Deactivate',
      confirmButtonClass: newStatus ? 'bg-green-500 hover:bg-green-600' : 'bg-orange-500 hover:bg-orange-600'
    });

    if (confirmed) {
      setLoading(true);
      showInfo(`${action === 'activate' ? 'Activating' : 'Deactivating'} station...`);
      
      const res = newStatus 
        ? await EnhancedStationService.activate(id)
        : await EnhancedStationService.deactivate(id);
      
      if (res.success) {
        // Update the station in the local state
        setStations(stations.map(s => 
          s.id === id ? { ...s, isActive: newStatus } : s
        ));
        
        // Show success message
        const successMessage = res.message || `Station "${station?.name}" ${actionPast} successfully`;
        showSuccess(successMessage);
      } else {
        showError(`Failed to ${action} station: ${res.error}`);
      }
      setLoading(false);
    }
  };

  const filteredStations = stations.filter(
    (st) =>
      (filterType === "All" || st.type === filterType) &&
      (st.name.toLowerCase().includes(search.toLowerCase()) ||
        st.location.toLowerCase().includes(search.toLowerCase()))
  );



  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Station Management</h1>
            <p className="text-gray-600 mt-1">Manage your EV charging stations and monitor their status</p>
          </div>
          <button
            onClick={() => {
              setEditingStation(null);
              setShowForm(true);
            }}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-sm"
            disabled={loading}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Add New Station</span>
          </button>
        </div>

        <StationStats stations={stations} />

        <StationFilters
          search={search}
          setSearch={setSearch}
          filterType={filterType}
          setFilterType={setFilterType}
        />

        {!loading && stations.length === 0 && !search && filterType === "All" ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <div className="text-center space-y-6">
              <div className="mx-auto w-32 h-32 bg-purple-50 rounded-full flex items-center justify-center">
                <svg className="w-16 h-16 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-900">Welcome to Station Management</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  You don't have any charging stations yet. Create your first station to start managing your EV charging network.
                </p>
              </div>
              <div className="space-y-4">
                <button
                  onClick={() => {
                    setEditingStation(null);
                    setShowForm(true);
                  }}
                  className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 mx-auto"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Create Your First Station</span>
                </button>
                <div className="text-sm text-gray-500">
                  <p>💡 Tip: You can manage station status, charging types, and available slots</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <StationTable
            stations={filteredStations}
            onEdit={(st) => {
              setEditingStation(st);
              setShowForm(true);
            }}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
            loading={loading}
          />
        )}

      {showForm && (
        <StationForm
          initialData={editingStation}
          onSave={handleSave}
          onClose={() => setShowForm(false)}
        />
      )}

      <ConfirmationComponent />

        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
}
