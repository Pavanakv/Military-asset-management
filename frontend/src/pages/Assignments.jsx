import React, { useEffect, useState, useCallback } from 'react';
import { UserCheck, Flame } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext.jsx';

const Assignments = () => {
  const { user } = useAuth();
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [expenditures, setExpenditures] = useState([]);

  const [assignForm, setAssignForm] = useState({ baseId: '', equipmentTypeId: '', quantity: '', assignedTo: '' });
  const [expendForm, setExpendForm] = useState({ baseId: '', equipmentTypeId: '', quantity: '', reason: '' });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [basesRes, typesRes, assignRes, expendRes] = await Promise.all([
        api.get('/assets/bases'),
        api.get('/assets/equipment-types'),
        api.get('/assignments'),
        api.get('/expenditures'),
      ]);
      setBases(basesRes.data);
      setEquipmentTypes(typesRes.data);
      setAssignments(assignRes.data);
      setExpenditures(expendRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data.');
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAssign = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await api.post('/assignments', {
        baseId: assignForm.baseId || undefined,
        equipmentTypeId: assignForm.equipmentTypeId,
        quantity: assignForm.quantity,
        assignedTo: assignForm.assignedTo,
      });
      setSuccess('Assignment recorded.');
      setAssignForm({ baseId: '', equipmentTypeId: '', quantity: '', assignedTo: '' });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record assignment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExpend = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await api.post('/expenditures', {
        baseId: expendForm.baseId || undefined,
        equipmentTypeId: expendForm.equipmentTypeId,
        quantity: expendForm.quantity,
        reason: expendForm.reason,
      });
      setSuccess('Expenditure recorded.');
      setExpendForm({ baseId: '', equipmentTypeId: '', quantity: '', reason: '' });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record expenditure.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Assignments & Expenditures</h1>
        <p className="text-slate-500 text-sm">Track personnel assignments and mark items as expended.</p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-emerald-600">{success}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assignments */}
        <div className="space-y-3">
          <form onSubmit={handleAssign} className="bg-white rounded-lg shadow-sm p-4 space-y-3">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2"><UserCheck className="w-4 h-4" /> New Assignment</h3>
            {user.role === 'ADMIN' && (
              <select required value={assignForm.baseId} onChange={(e) => setAssignForm({ ...assignForm, baseId: e.target.value })} className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm">
                <option value="">Select base</option>
                {bases.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            )}
            <select required value={assignForm.equipmentTypeId} onChange={(e) => setAssignForm({ ...assignForm, equipmentTypeId: e.target.value })} className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm">
              <option value="">Select equipment</option>
              {equipmentTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <input required type="number" min="1" placeholder="Quantity" value={assignForm.quantity} onChange={(e) => setAssignForm({ ...assignForm, quantity: e.target.value })} className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm" />
            <input required type="text" placeholder="Assigned to (personnel / unit)" value={assignForm.assignedTo} onChange={(e) => setAssignForm({ ...assignForm, assignedTo: e.target.value })} className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm" />
            <button type="submit" disabled={submitting} className="w-full bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-md text-sm font-medium disabled:opacity-60">Record Assignment</button>
          </form>

          <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 uppercase border-b">
                  <th className="px-3 py-2">Base</th>
                  <th className="px-3 py-2">Equipment</th>
                  <th className="px-3 py-2">Qty</th>
                  <th className="px-3 py-2">To</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((a) => (
                  <tr key={a.id} className="border-b last:border-0">
                    <td className="px-3 py-2">{a.base?.name}</td>
                    <td className="px-3 py-2">{a.equipmentType?.name}</td>
                    <td className="px-3 py-2 font-medium">{a.quantity}</td>
                    <td className="px-3 py-2">{a.assignedTo}</td>
                  </tr>
                ))}
                {assignments.length === 0 && <tr><td colSpan={4} className="px-3 py-4 text-center text-slate-400">No assignments yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expenditures */}
        <div className="space-y-3">
          <form onSubmit={handleExpend} className="bg-white rounded-lg shadow-sm p-4 space-y-3">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2"><Flame className="w-4 h-4" /> New Expenditure</h3>
            {user.role === 'ADMIN' && (
              <select required value={expendForm.baseId} onChange={(e) => setExpendForm({ ...expendForm, baseId: e.target.value })} className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm">
                <option value="">Select base</option>
                {bases.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            )}
            <select required value={expendForm.equipmentTypeId} onChange={(e) => setExpendForm({ ...expendForm, equipmentTypeId: e.target.value })} className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm">
              <option value="">Select equipment</option>
              {equipmentTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <input required type="number" min="1" placeholder="Quantity" value={expendForm.quantity} onChange={(e) => setExpendForm({ ...expendForm, quantity: e.target.value })} className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm" />
            <input type="text" placeholder="Reason (optional)" value={expendForm.reason} onChange={(e) => setExpendForm({ ...expendForm, reason: e.target.value })} className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm" />
            <button type="submit" disabled={submitting} className="w-full bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-md text-sm font-medium disabled:opacity-60">Record Expenditure</button>
          </form>

          <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 uppercase border-b">
                  <th className="px-3 py-2">Base</th>
                  <th className="px-3 py-2">Equipment</th>
                  <th className="px-3 py-2">Qty</th>
                  <th className="px-3 py-2">Reason</th>
                </tr>
              </thead>
              <tbody>
                {expenditures.map((ex) => (
                  <tr key={ex.id} className="border-b last:border-0">
                    <td className="px-3 py-2">{ex.base?.name}</td>
                    <td className="px-3 py-2">{ex.equipmentType?.name}</td>
                    <td className="px-3 py-2 font-medium">{ex.quantity}</td>
                    <td className="px-3 py-2 text-slate-500">{ex.reason || '—'}</td>
                  </tr>
                ))}
                {expenditures.length === 0 && <tr><td colSpan={4} className="px-3 py-4 text-center text-slate-400">No expenditures yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assignments;
