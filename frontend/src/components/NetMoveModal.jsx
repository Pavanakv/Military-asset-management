import React from 'react';
import { X } from 'lucide-react';

const NetMoveModal = ({ metrics, onClose }) => {
  if (!metrics) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg max-w-md w-full shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">Net Movement Breakdown</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">Purchases (+)</span>
            <span className="font-semibold text-slate-800">{metrics.purchases}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Transfers In (+)</span>
            <span className="font-semibold text-emerald-600">+{metrics.transfersIn}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Transfers Out (-)</span>
            <span className="font-semibold text-red-600">-{metrics.transfersOut}</span>
          </div>
          <hr />
          <div className="flex justify-between font-bold text-slate-900">
            <span>Total Net Movement</span>
            <span>{metrics.netMovement}</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full bg-slate-800 text-white py-2 rounded-md hover:bg-slate-700 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default NetMoveModal;
