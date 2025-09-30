import StationRow from "./StationRow";

export default function StationTable({ stations, onEdit, onDelete }) {
  return (
    <table className="w-full border-collapse shadow-sm">
      <thead>
        <tr className="bg-gray-100 text-left">
          <th className="p-2 border">Name</th>
          <th className="p-2 border">Location</th>
          <th className="p-2 border">Type</th>
          <th className="p-2 border">Slots</th>
          <th className="p-2 border">Status</th>
          <th className="p-2 border">Actions</th>
        </tr>
      </thead>
      <tbody>
        {stations.map((st) => (
          <StationRow key={st.id} station={st} onEdit={onEdit} onDelete={onDelete} />
        ))}
        {stations.length === 0 && (
          <tr>
            <td colSpan="6" className="p-4 text-center text-gray-500">
              No stations found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
