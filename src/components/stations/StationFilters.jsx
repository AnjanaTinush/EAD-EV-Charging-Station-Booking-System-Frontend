export default function StationFilters({ search, setSearch, filterType, setFilterType }) {
  return (
    <div className="flex gap-4 mb-4">
      <input
        type="text"
        placeholder="Search by name or location..."
        className="border rounded px-3 py-2 flex-1"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <select
        className="border rounded px-3 py-2"
        value={filterType}
        onChange={(e) => setFilterType(e.target.value)}
      >
        <option value="All">All Types</option>
        <option value="AC">AC</option>
        <option value="DC">DC</option>
      </select>
    </div>
  );
}
