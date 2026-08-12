import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldHalf, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(username, password);
    if (success) navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-emerald-600 p-3 rounded-full mb-3">
            <ShieldHalf className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-800">Military Asset Management</h1>
          <p className="text-slate-500 text-sm mt-1">Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g. admin_user"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-md font-medium flex items-center justify-center gap-2 disabled:opacity-60 transition"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-xs text-slate-400 mt-6 text-center">
          Sample accounts: admin_user / commander_alpha / logistics_officer — see README for passwords.
        </p>
      </div>
    </div>
  );
};

export default Login;
