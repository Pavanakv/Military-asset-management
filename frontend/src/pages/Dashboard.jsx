import React, { useEffect, useState, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../services/api';
import { useAuth } from '../context/AuthContext.jsx';
import StatCard from '../components/StatCard.jsx';
import NetMoveModal from '../components/NetMoveModal.jsx';

const Dashboard = () => {
  const { user } = useAuth();
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [filters, setFilters] = useState({ baseId: '', equipmentTypeId: '', startDate: '', endDate: '' });
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [basesRes, typesRes] = await Promise.all([
          api.get('/assets/bases'),
          api.get('/assets/equipment-types'),
        ]);
        setBases(basesRes.data);
        setEquipmentTypes(typesRes.data);
      } catch (err) {
        // non-fatal — filters just won't populate
      }
    };
    loadFilters();
  }, []);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filters.baseId) params.baseId = filters.baseId;
      if (filters.equipmentTypeId) params.equipmentTypeId = filters.equipmentTypeId;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const { data } = await api.get('/assets/dashboard', { params });
      setMetrics(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const handleFilterChange = (key, value) => setFilters((f) => ({ ...f, [key]: value }));

  const chartData = metrics
    ? [
        { name: 'Opening', value: metrics.openingBalance },
        { name: 'Purchases', value: metrics.purchases },
        { name: 'In', value: metrics.transfersIn },
        { name: 'Out', value: -metrics.transfersOut },
        { name: 'Assigned', value: -metrics.assigned },
        { name: 'Expended', value: -metrics.expended },
        { name: 'Closing', value: metrics.closingBalance },
      ]
    : [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 text-sm">
          {user?.role === 'ADMIN' ? 'Global view across all bases.' : 'Scoped to your assigned base.'}
        </p>
      </div>

      {/* Filter controls */}
      <div className="bg-white rounded-lg shadow-sm p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        {user?.role === 'ADMIN' && (
          <div>
            <label className="text-xs font-semibold text-slate-500">Base</label>
            <select
              value={filters.baseId}
              onChange={(e) => handleFilterChange('baseId', e.target.value)}
              className="mt-1 w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm"
            >
              <option value="">All Bases</option>
              {bases.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className="text-xs font-semibold text-slate-500">Equipment Type</label>
          <select
            value={filters.equipmentTypeId}
            onChange={(e) => handleFilterChange('equipmentTypeId', e.target.value)}
            className="mt-1 w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm"
          >
            <option value="">All Types</option>
            {equipmentTypes.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500">Start Date</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
            className="mt-1 w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500">End Date</label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
            className="mt-1 w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm"
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {loading && !metrics ? (
        <p className="text-slate-500 text-sm">Loading metrics...</p>
      ) : metrics ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title="Opening Balance" value={metrics.openingBalance} color="blue" />
            <StatCard title="Net Movement" value={metrics.netMovement} color="emerald" onClick={() => setShowModal(true)} />
            <StatCard title="Assigned / Expended" value={metrics.assigned + metrics.expended} color="amber" />
            <StatCard title="Closing Balance" value={metrics.closingBalance} color="red" />
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="text-sm font-semibold text-slate-600 mb-3">Balance Flow</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : null}

      {showModal && <NetMoveModal metrics={metrics} onClose={() => setShowModal(false)} />}
    </div>
  );
};

export default Dashboard;
