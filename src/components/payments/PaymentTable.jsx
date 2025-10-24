import { useEffect, useState } from 'react';
import paymentAPI from '../../services/PaymentApiService';
import AddPaymentModal from './AddPaymentModal';
import { useConfirmation } from '../../hooks/useConfirmation';

export default function PaymentTable({ filters, reloadKey = 0, onDataChange }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const { showConfirmation, ConfirmationComponent } = useConfirmation();
  const [approvingIds, setApprovingIds] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await paymentAPI.getFinancials(filters);
      setData(res || []);
      // notify parent about loaded data so filter options can be derived
      try {
        onDataChange && onDataChange(res || []);
      } catch (e) {
        // ignore
      }
    } catch (err) {
      setError(err.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, reloadKey]);

  const handleDelete = async (id) => {
    // ask for confirmation using app dialog
    const should = await showConfirmation({
      title: 'Delete payment',
      message: 'Are you sure you want to permanently delete this payment record? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmButtonClass: 'bg-red-500 hover:bg-red-600'
    });
    if (!should) return;

    try {
      await paymentAPI.deleteFinancial(id);
      setData((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      // show friendly error
      await showConfirmation({
        title: 'Delete failed',
        message: err.message || 'Failed to delete the record',
        confirmText: 'OK',
        cancelText: ''
      });
    }
  };

  // Approve using PATCH (partial update)
  const handleApprove = async (id) => {
    const should = await showConfirmation({
      title: 'Approve payment',
      message: 'Mark this payment as Approved?',
      confirmText: 'Approve',
      cancelText: 'Cancel',
      confirmButtonClass: 'bg-ev-primary-600 hover:bg-ev-primary-700'
    });
    if (!should) return;
    // optimistic update: show approved status immediately
    const prevData = data;
    setApprovingIds((s) => [...s, id]);
    setData((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'Approved' } : r)));

    try {
      const updated = await paymentAPI.patchFinancial(id, { status: 'Approved' });
      setData((prev) => prev.map((r) => (r.id === id ? { ...r, ...updated } : r)));
    } catch (err) {
      // revert on error
      setData(prevData);
      await showConfirmation({
        title: 'Approve failed',
        message: err.message || 'Failed to update status',
        confirmText: 'OK',
        cancelText: ''
      });
    } finally {
      setApprovingIds((s) => s.filter((x) => x !== id));
    }
  };

  const openEditModal = (row) => {
    setEditingRecord(row);
    setIsEditOpen(true);
  };

  const closeEditModal = () => {
    setEditingRecord(null);
    setIsEditOpen(false);
  };

  const handleUpdated = (updated) => {
    // update local state with updated record
    setData((prev) => {
      const newData = prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r));
      // notify parent about updated data
      try { onDataChange && onDataChange(newData); } catch (e) {}
      return newData;
    });
    closeEditModal();
  };

  return (
    <div>
      {error && (
        <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 p-3 rounded-xl">{error}</div>
      )}

      <div className="w-full">
        <table className="w-full table-fixed text-left">
          <thead>
            <tr className="text-sm text-ev-primary-600">
              <th className="px-4 py-3 w-1/6">Username</th>
              <th className="px-4 py-3 w-1/6">NIC</th>
              <th className="px-4 py-3 w-1/6">Amount</th>
              <th className="px-4 py-3 w-1/6">Payment Type</th>
              <th className="px-4 py-3 w-1/6">Status</th>
              <th className="px-4 py-3 w-1/6">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center">Loading...</td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-600">No records found</td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={row.id} className="border-t">
                  <td className="px-4 py-3 align-top break-words whitespace-normal">{row.username}</td>
                  <td className="px-4 py-3 align-top break-words whitespace-normal">{row.nic}</td>
                  <td className="px-4 py-3 align-top break-words whitespace-normal">{row.amount}</td>
                  <td className="px-4 py-3 align-top break-words whitespace-normal">{row.paymentType}</td>
                  <td className="px-4 py-3 align-top break-words whitespace-normal">
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${row.status === 'Pending' ? 'ev-badge-warning' : row.status === 'Approved' ? 'ev-badge-success' : 'ev-badge-danger'}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <>
                        <button onClick={() => openEditModal(row)} className="px-3 py-1 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Edit</button>
                        {approvingIds.includes(row.id) ? (
                          <button disabled className="px-3 py-1 text-sm font-medium text-white bg-ev-primary-600 rounded-lg opacity-80 cursor-not-allowed flex items-center space-x-2">
                            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <circle cx="12" cy="12" r="10" strokeWidth="3" className="opacity-20" />
                              <path d="M22 12a10 10 0 00-10-10" strokeWidth="3" className="opacity-80" />
                            </svg>
                            <span>Approving...</span>
                          </button>
                        ) : (String(row.status || '').toLowerCase() === 'pending' ? (
                          <button onClick={() => handleApprove(row.id)} className="px-3 py-1 text-sm font-medium text-white bg-ev-primary-600 rounded-lg hover:bg-ev-primary-700">Approve</button>
                        ) : (
                          <button disabled className="px-3 py-1 text-sm font-medium text-white bg-gray-300 rounded-lg cursor-not-allowed">{row.status || 'Approved'}</button>
                        ))}
                        <button onClick={() => handleDelete(row.id)} className="px-3 py-1 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600">Delete</button>
                      </>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit modal */}
      <AddPaymentModal
        isOpen={isEditOpen}
        onClose={closeEditModal}
        mode="edit"
        initialData={editingRecord}
        onUpdated={handleUpdated}
      />
      {/* Confirmation dialog component rendered by the hook */}
      <ConfirmationComponent />
    </div>
  );
}
