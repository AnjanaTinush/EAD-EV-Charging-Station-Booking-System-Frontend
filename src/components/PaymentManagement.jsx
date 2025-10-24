import { useState } from 'react';
import PaymentTable from './payments/PaymentTable';
import AddPaymentModal from './payments/AddPaymentModal';

// Helper to merge base options with discovered options while keeping order
const mergeOptions = (base, discovered) => {
  const set = new Set(base);
  (discovered || []).forEach((d) => { if (d && !set.has(d)) set.add(d); });
  return Array.from(set);
};

export default function PaymentManagement() {
  const [filters, setFilters] = useState({ 
    nic: '', 
    status: '', 
    paymentType: '' 
  });
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [statusOptions, setStatusOptions] = useState(['Pending', 'Approved', 'Failed']);
  const [paymentTypeOptions, setPaymentTypeOptions] = useState(['Cash', 'Card']);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleClearFilters = () => {
    setFilters({ nic: '', status: '', paymentType: '' });
  };

  const handleCreated = () => {
    setReloadKey((k) => k + 1);
  };

  const handleTableDataChange = (rows) => {
    const statuses = Array.from(new Set((rows || []).map((r) => r.status).filter(Boolean)));
    const ptypes = Array.from(new Set((rows || []).map((r) => r.paymentType).filter(Boolean)));

    setStatusOptions((prev) => mergeOptions(['Pending', 'Approved', 'Failed'], statuses));
    setPaymentTypeOptions((prev) => mergeOptions(['Cash', 'Card'], ptypes));
  };

  const hasActiveFilters = filters.nic || filters.status || filters.paymentType;

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
      <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
          </h3>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear all
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* NIC Filter */}
          <div>
            <label htmlFor="nic" className="block text-xs font-medium text-gray-700 mb-1">
              NIC
            </label>
            <input
              id="nic"
              name="nic"
              type="text"
              value={filters.nic}
              onChange={handleChange}
              placeholder="Search by NIC..."
              className="ev-input w-full"
            />
          </div>
          
          {/* Status Filter */}
          <div>
            <label htmlFor="status" className="block text-xs font-medium text-gray-700 mb-1">
              Status
            </label>
            <select 
              id="status"
              name="status" 
              value={filters.status} 
              onChange={handleChange} 
              className="ev-input w-full"
            >
              <option value="">All Statuses</option>
              {statusOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          
          {/* Payment Type Filter */}
          <div>
            <label htmlFor="paymentType" className="block text-xs font-medium text-gray-700 mb-1">
              Payment Type
            </label>
            <select 
              id="paymentType"
              name="paymentType" 
              value={filters.paymentType} 
              onChange={handleChange} 
              className="ev-input w-full"
            >
              <option value="">All Types</option>
              {paymentTypeOptions.map((pt) => (
                <option key={pt} value={pt}>{pt}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Active filters display */}
        {hasActiveFilters && (
          <div className="mt-3 flex items-center flex-wrap gap-2">
            <span className="text-xs font-medium text-gray-600">Active filters:</span>
            {filters.nic && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                NIC: {filters.nic}
                <button
                  onClick={() => setFilters(prev => ({ ...prev, nic: '' }))}
                  className="ml-1 hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            )}
            {filters.status && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Status: {filters.status}
                <button
                  onClick={() => setFilters(prev => ({ ...prev, status: '' }))}
                  className="ml-1 hover:text-green-900"
                >
                  ×
                </button>
              </span>
            )}
            {filters.paymentType && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Type: {filters.paymentType}
                <button
                  onClick={() => setFilters(prev => ({ ...prev, paymentType: '' }))}
                  className="ml-1 hover:text-purple-900"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      <PaymentTable 
        filters={filters} 
        reloadKey={reloadKey} 
        onDataChange={handleTableDataChange} 
      />

      <AddPaymentModal 
        isOpen={isAddOpen} 
        onClose={() => setIsAddOpen(false)} 
        onCreated={handleCreated} 
      />
    </div>
  );
}