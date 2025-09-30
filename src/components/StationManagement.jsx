import { useEffect, useState } from "react";
import StationService from "../services/StationService";
import StationFilters from "./stations/StationFilters";
import StationTable from "./stations/StationTable";

export default function StationManagement() {
  const [stations, setStations] = useState([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [error, setError] = useState("");

  useEffect(() => {
    loadStations();
  }, []);

  const loadStations = async () => {
    try {
      const res = await StationService.getAll();
      setStations(res.data);
    } catch  {
      setError("Failed to fetch stations.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await StationService.delete(id);
      setStations(stations.filter((s) => s.id !== id));
    } catch {
      setError("Failed to delete station.");
    }
  };

  const filteredStations = stations.filter((st) =>
    (filterType === "All" || st.type === filterType) &&
    (st.name.toLowerCase().includes(search.toLowerCase()) ||
     st.location.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Station Management</h1>
        <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
          Add New Station
        </button>
      </div>

      <StationFilters search={search} setSearch={setSearch} filterType={filterType} setFilterType={setFilterType} />

      {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}

      <StationTable stations={filteredStations} onEdit={(st) => console.log("Edit", st)} onDelete={handleDelete} />
    </div>
  );
}
