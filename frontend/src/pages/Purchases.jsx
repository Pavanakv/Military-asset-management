import React, { useEffect, useState, useCallback } from 'react';
import { PackagePlus } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext.jsx';

const Purchases = () => {
  const { user } = useAuth();
  const canCreate = user?.role === 'ADMIN' || user?.role === 'LOGISTICS_OFFICER';

  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [form, setForm] = useState({ baseId: '', equipmentTypeId: '', quantity: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [basesRes, typesRes, purchasesRes] = await Promise.all([
        api.get('/assets/bases'),
        api.get('/assets/equipment-types'),
        api.get('/purchases'),
      ]);
      setBases(basesRes.data);
      setEquipmentTypes(typesRes.data);
      setPurchases(purchasesRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load purchases.');
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
      await api.post('/purchases', {
        baseId: form.baseId || undefined,
        equipmentTypeId: form.equipmentTypeId,
        quantity: form.quantity,
      });
      setSuccess('Purchase logged successfully.');
      setForm({ baseId: '', equipmentTypeId: '', quantity: '' });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to log purchase.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Purchases</h1>
        <p className="text-slate-500 text-sm">Log incoming assets and review purchase history.</p>
      </div>

      {canCreate && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-4 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          {user.role === 'ADMIN' && (
            <div>
              <label className="text-xs font-semibold text-slate-500">Base</label>
              <select
                required
                value={form.baseId}
                onChange={(e) => setForm({ ...form, baseId: e.target.value })}
                className="mt-1 w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm"
              >
                <option value="">Select base</option>
                {bases.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          )}
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
            <PackagePlus className="w-4 h-4" />
            {submitting ? 'Logging...' : 'Log Purchase'}
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
              <th className="px-4 py-3">Base</th>
              <th className="px-4 py-3">Equipment</th>
              <th className="px-4 py-3">Quantity</th>
              <th className="px-4 py-3">Logged By</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((p) => (
              <tr key={p.id} className="border-b last:border-0 hover:bg-slate-50">
                <td className="px-4 py-2.5">{new Date(p.date).toLocaleDateString()}</td>
                <td className="px-4 py-2.5">{p.base?.name}</td>
                <td className="px-4 py-2.5">{p.equipmentType?.name}</td>
                <td className="px-4 py-2.5 font-medium">{p.quantity}</td>
                <td className="px-4 py-2.5 text-slate-500">{p.purchasedBy?.username}</td>
              </tr>
            ))}
            {purchases.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">No purchases recorded yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Purchases;
