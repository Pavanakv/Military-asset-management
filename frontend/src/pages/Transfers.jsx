import React, { useEffect, useState, useCallback } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext.jsx';

const Transfers = () => {
  const { user } = useAuth();
  const canCreate = user?.role === 'ADMIN' || user?.role === 'LOGISTICS_OFFICER';

  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [form, setForm] = useState({ sourceBaseId: '', destinationBaseId: '', equipmentTypeId: '', quantity: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [basesRes, typesRes, transfersRes] = await Promise.all([
        api.get('/assets/bases'),
        api.get('/assets/equipment-types'),
        api.get('/transfers'),
      ]);
      setBases(basesRes.data);
      setEquipmentTypes(typesRes.data);
      setTransfers(transfersRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load transfers.');
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await api.post('/transfers', {
        sourceBaseId: form.sourceBaseId || undefined,
        destinationBaseId: form.destinationBaseId,
        equipmentTypeId: form.equipmentTypeId,
        quantity: form.quantity,
      });
      setSuccess('Transfer completed successfully.');
      setForm({ sourceBaseId: '', destinationBaseId: '', equipmentTypeId: '', quantity: '' });
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Transfer failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Transfers</h1>
        <p className="text-slate-500 text-sm">Move assets between bases with a full audit trail.</p>
      </div>

      {canCreate && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-4 grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
          {user.role === 'ADMIN' && (
            <div>
              <label className="text-xs font-semibold text-slate-500">Source Base</label>
              <select
                required
                value={form.sourceBaseId}
                onChange={(e) => setForm({ ...form, sourceBaseId: e.target.value })}
                className="mt-1 w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm"
              >
                <option value="">Select source</option>
                {bases.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="text-xs font-semibold text-slate-500">Destination Base</label>
            <select
              required
              value={form.destinationBaseId}
              onChange={(e) => setForm({ ...form, destinationBaseId: e.target.value })}
              className="mt-1 w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm"
            >
              <option value="">Select destination</option>
              {bases.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">Equipment Type</label>
            <select
              required
              value={form.equipmentTypeId}
              onChange={(e) => setForm({ ...form, equipmentTypeId: e.target.value })}
              className="mt-1 w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm"
            >
              <option value="">Select type</option>
              {equipmentTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">Quantity</label>
            <input
              type="number"
              min="1"
              required
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              className="mt-1 w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-md text-sm font-medium disabled:opacity-60"
          >
            <ArrowLeftRight className="w-4 h-4" />
            {submitting ? 'Transferring...' : 'Initiate Transfer'}
          </button>
        </form>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-emerald-600">{success}</p>}

      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-500 uppercase border-b">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">From</th>
              <th className="px-4 py-3">To</th>
              <th className="px-4 py-3">Equipment</th>
              <th className="px-4 py-3">Quantity</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {transfers.map((t) => (
              <tr key={t.id} className="border-b last:border-0 hover:bg-slate-50">
                <td className="px-4 py-2.5">{new Date(t.timestamp).toLocaleDateString()}</td>
                <td className="px-4 py-2.5">{t.sourceBase?.name}</td>
                <td className="px-4 py-2.5">{t.destinationBase?.name}</td>
                <td className="px-4 py-2.5">{t.equipmentType?.name}</td>
                <td className="px-4 py-2.5 font-medium">{t.quantity}</td>
                <td className="px-4 py-2.5">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">{t.status}</span>
                </td>
              </tr>
            ))}
            {transfers.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-400">No transfers recorded yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Transfers;
