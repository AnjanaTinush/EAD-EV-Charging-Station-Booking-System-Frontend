import { useState, useEffect, useRef } from 'react';
import paymentAPI from '../../services/PaymentApiService';
import { useNotification } from '../../contexts/NotificationContext';

export default function AddPaymentModal({ isOpen, onClose, onCreated, initialData = null, mode = 'add', onUpdated, paymentTypeOptions = ['Cash', 'Card'] }) {
  const [form, setForm] = useState({ username: '', nic: '', amount: '', paymentType: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useNotification();
  const firstInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setForm({ username: '', nic: '', amount: '', paymentType: '' });
      setErrors({});
    }

    // if opened for edit and initialData provided, prefill form
    if (isOpen && initialData) {
      setForm({
        username: initialData.username || '',
        nic: initialData.nic || '',
        amount: initialData.amount ?? '',
        paymentType: initialData.paymentType || '',
      });
    }

    // focus first input when opened
    if (isOpen) {
      setTimeout(() => firstInputRef.current && firstInputRef.current.focus(), 0);
    }
    // also react to changes in initialData while open
  }, [isOpen, initialData]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((s) => ({ ...s, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.username.trim()) errs.username = 'Username is required';
    if (!form.nic.trim()) errs.nic = 'NIC is required';
    if (!form.amount || Number(form.amount) <= 0) errs.amount = 'Enter a valid amount';
    if (!form.paymentType.trim()) errs.paymentType = 'Payment type required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        username: form.username.trim(),
        nic: form.nic.trim(),
        amount: Number(form.amount),
        paymentType: form.paymentType.trim(),
      };

      if (mode === 'edit' && initialData && initialData.id) {
        const updated = await paymentAPI.updateFinancial(initialData.id, payload);
        showSuccess('Payment updated successfully');
        onUpdated && onUpdated(updated);
        onClose();
      } else {
        const created = await paymentAPI.createFinancial(payload);
        showSuccess('Payment created successfully');
        onCreated && onCreated(created);
        onClose();
      }
    } catch (err) {
      console.error('Create payment error', err);
      showError(err.message || 'Failed to create payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
      <div className="ev-card w-full max-w-md" aria-labelledby="add-payment-title">
        <div className="ev-card-gradient p-5 flex items-center justify-between">
          <div>
            <h3 id="add-payment-title" className="text-xl font-bold text-white">Add Payment</h3>
            <p className="text-white/80 text-sm mt-1">Create a new payment record</p>
          </div>
          <button onClick={onClose} aria-label="Close add payment" className="text-white/80 hover:text-white p-2 rounded-md">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

  <form onSubmit={handleSubmit} className="p-6 space-y-4" noValidate>
          <div>
            <label className="ev-label">Username *</label>
            <input ref={firstInputRef} name="username" value={form.username} onChange={handleChange} className={`ev-input w-full ${errors.username ? 'border-red-500' : ''}`} placeholder="e.g. john_doe" />
            {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username}</p>}
          </div>

          <div>
            <label className="ev-label">NIC *</label>
            <input name="nic" value={form.nic} onChange={handleChange} className={`ev-input w-full ${errors.nic ? 'border-red-500' : ''}`} placeholder="NIC number" />
            {errors.nic && <p className="text-xs text-red-500 mt-1">{errors.nic}</p>}
          </div>

          <div>
            <label className="ev-label">Amount *</label>
            <input name="amount" value={form.amount} onChange={handleChange} type="number" step="0.01" className={`ev-input w-full ${errors.amount ? 'border-red-500' : ''}`} placeholder="1500" />
            {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}
          </div>

          <div>
            <label className="ev-label">Payment Type *</label>
            {(() => {
              // merge passed options with current value so it's always selectable
              const opts = Array.from(new Set([...(paymentTypeOptions || []), ...(initialData && initialData.paymentType ? [initialData.paymentType] : [])]));
              return (
                <select name="paymentType" value={form.paymentType} onChange={handleChange} className={`ev-input w-full ${errors.paymentType ? 'border-red-500' : ''}`}>
                  <option value="">Select payment type</option>
                  {opts.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              );
            })()}
            {errors.paymentType && <p className="text-xs text-red-500 mt-1">{errors.paymentType}</p>}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="text-sm text-gray-500">Fields marked * are required</div>
            <div className="flex items-center space-x-3">
              <button type="button" onClick={onClose} className="btn-ev-secondary">Cancel</button>
              <button type="submit" disabled={loading} className={`btn-ev-primary flex items-center space-x-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7"/></svg>
                <span>{loading ? (mode === 'edit' ? 'Updating...' : 'Creating...') : (mode === 'edit' ? 'Update Payment' : 'Create Payment')}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
