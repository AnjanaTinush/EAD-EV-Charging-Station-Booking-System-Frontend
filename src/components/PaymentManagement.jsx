import { useState } from 'react';
import PaymentTable from './payments/PaymentTable';
import AddPaymentModal from './payments/AddPaymentModal';

export default function PaymentManagement() {
  const [filters, setFilters] = useState({ username: '', nic: '', status: '' });
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreated = () => {
    // trigger table reload
    setReloadKey((k) => k + 1);
  };

  return (
    <div className="p-8 ev-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-12 h-12 bg-ev-gradient rounded-xl">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 10h18v4H3z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold ev-gradient-text">Payments</h2>
        </div>

        <div className="flex items-center space-x-3">
          <button onClick={() => setIsAddOpen(true)} className="btn-ev-primary">
            <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Payment
          </button>
        </div>
      </div>

      {/* Filter section */}
      <div className="mb-6 space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <input
            name="username"
            value={filters.username}
            onChange={handleChange}
            placeholder="Username"
            className="ev-input"
          />
          <input
            name="nic"
            value={filters.nic}
            onChange={handleChange}
            placeholder="NIC"
            className="ev-input"
          />
          <select name="status" value={filters.status} onChange={handleChange} className="ev-input">
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Failed">Failed</option>
          </select>
        </div>
      </div>

      <PaymentTable filters={filters} reloadKey={reloadKey} />

      <AddPaymentModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onCreated={handleCreated} />
    </div>
  );
}
