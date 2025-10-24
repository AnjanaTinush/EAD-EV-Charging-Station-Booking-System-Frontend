import { useEffect, useState, useMemo } from 'react';
import paymentAPI from '../../services/PaymentApiService';
import AddPaymentModal from './AddPaymentModal';
import { useConfirmation } from '../../hooks/useConfirmation';

export default function PaymentTable({ filters, reloadKey = 0, onDataChange }) {
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const { showConfirmation, ConfirmationComponent } = useConfirmation();
  const [approvingIds, setApprovingIds] = useState([]);

  // Fetch all data WITHOUT filters
  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch ALL data without any filters
      const res = await paymentAPI.getFinancials({});
      setAllData(res || []);
      
      if (onDataChange) {
        try {
          onDataChange(res || []);
        } catch (e) {
          console.error('Error in onDataChange:', e);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load payments');
      setAllData([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on mount and when reloadKey changes
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadKey]);

  // CLIENT-SIDE FILTERING - Filter data in browser
  const filteredData = useMemo(() => {
    let filtered = [...allData];

    // Filter by NIC
    if (filters.nic && filters.nic.trim() !== '') {
      const nicLower = filters.nic.toLowerCase().trim();
      filtered = filtered.filter(row => 
        (row.nic || '').toLowerCase().includes(nicLower)
      );
    }

    // Filter by Status
    if (filters.status && filters.status.trim() !== '') {
      filtered = filtered.filter(row => 
        row.status === filters.status
      );
    }

    // Filter by Payment Type
    if (filters.paymentType && filters.paymentType.trim() !== '') {
      filtered = filtered.filter(row => 
        row.paymentType === filters.paymentType
      );
    }

    return filtered;
  }, [allData, filters]);

  const handleDelete = async (id) => {
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
      setAllData((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      await showConfirmation({
        title: 'Delete failed',
        message: err.message || 'Failed to delete the record',
        confirmText: 'OK',
        cancelText: ''
      });
    }
  };

  const handleApprove = async (id) => {
    const should = await showConfirmation({
      title: 'Approve payment',
      message: 'Mark this payment as Approved?',
      confirmText: 'Approve',
      cancelText: 'Cancel',
      confirmButtonClass: 'bg-ev-primary-600 hover:bg-ev-primary-700'
    });
    if (!should) return;

    const prevData = allData;
    setApprovingIds((s) => [...s, id]);
    setAllData((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'Approved' } : r)));

    try {
      const updated = await paymentAPI.patchFinancial(id, { status: 'Approved' });
      setAllData((prev) => prev.map((r) => (r.id === id ? { ...r, ...updated } : r)));
    } catch (err) {
      setAllData(prevData);
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
    setAllData((prev) => {
      const newData = prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r));
      if (onDataChange) {
        try {
          onDataChange(newData);
        } catch (e) {
          console.error('Error in onDataChange:', e);
        }
      }
      return newData;
    });
    closeEditModal();
  };

  return (
    <div>
      {error && (
        <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 p-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Show filtered count */}
      {!loading && allData.length > 0 && (
        <div className="mb-3 text-sm text-gray-600">
          Showing <span className="font-semibold text-gray-900">{filteredData.length}</span> of <span className="font-semibold text-gray-900">{allData.length}</span> records
        </div>
      )}

      <div className="w-full overflow-x-auto">
        <table className="w-full table-fixed text-left">
          <thead>
            <tr className="text-sm text-ev-primary-600 bg-gray-50">
              <th className="px-4 py-3 w-1/6 font-semibold">Username</th>
              <th className="px-4 py-3 w-1/6 font-semibold">NIC</th>
              <th className="px-4 py-3 w-1/6 font-semibold">Amount</th>
              <th className="px-4 py-3 w-1/6 font-semibold">Payment Type</th>
              <th className="px-4 py-3 w-1/6 font-semibold">Status</th>
              <th className="px-4 py-3 w-1/6 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center">
                  <div className="flex items-center justify-center">
                    <svg className="w-6 h-6 animate-spin text-ev-primary-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="10" strokeWidth="3" className="opacity-20" />
                      <path d="M22 12a10 10 0 00-10-10" strokeWidth="3" className="opacity-80" />
                    </svg>
                    <span className="ml-2 text-gray-600">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-600">
                  <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="font-medium">No records found</p>
                  {allData.length > 0 && (
                    <p className="text-sm text-gray-500 mt-1">Try adjusting your filters</p>
                  )}
                </td>
              </tr>
            ) : (
              filteredData.map((row) => (
                <tr key={row.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 align-top">{row.username || '-'}</td>
                  <td className="px-4 py-3 align-top">{row.nic || '-'}</td>
                  <td className="px-4 py-3 align-top">{row.amount || '-'}</td>
                  <td className="px-4 py-3 align-top">{row.paymentType || '-'}</td>
                  <td className="px-4 py-3 align-top">
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                      row.status === 'Pending' ? 'ev-badge-warning' : 
                      row.status === 'Approved' ? 'ev-badge-success' : 
                      'ev-badge-danger'
                    }`}>
                      {row.status || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => openEditModal(row)} 
                        className="px-3 py-1 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                      >
                        Edit
                      </button>
                      {approvingIds.includes(row.id) ? (
                        <button 
                          disabled 
                          className="px-3 py-1 text-sm font-medium text-white bg-ev-primary-600 rounded-lg opacity-80 cursor-not-allowed flex items-center space-x-2"
                        >
                          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <circle cx="12" cy="12" r="10" strokeWidth="3" className="opacity-20" />
                            <path d="M22 12a10 10 0 00-10-10" strokeWidth="3" className="opacity-80" />
                          </svg>
                          <span>Approving...</span>
                        </button>
                      ) : String(row.status || '').toLowerCase() === 'pending' ? (
                        <button 
                          onClick={() => handleApprove(row.id)} 
                          className="px-3 py-1 text-sm font-medium text-white bg-ev-primary-600 rounded-lg hover:bg-ev-primary-700"
                        >
                          Approve
                        </button>
                      ) : (
                        <button 
                          disabled 
                          className="px-3 py-1 text-sm font-medium text-white bg-gray-300 rounded-lg cursor-not-allowed"
                        >
                          {row.status || 'Approved'}
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(row.id)} 
                        className="px-3 py-1 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AddPaymentModal
        isOpen={isEditOpen}
        onClose={closeEditModal}
        mode="edit"
        initialData={editingRecord}
        onUpdated={handleUpdated}
      />
      <ConfirmationComponent />
    </div>
  );
}