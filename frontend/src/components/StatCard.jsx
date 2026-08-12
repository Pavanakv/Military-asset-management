import React from 'react';

const borderColors = {
  blue: 'border-blue-600',
  emerald: 'border-emerald-600',
  amber: 'border-amber-500',
  red: 'border-red-600',
};

const StatCard = ({ title, value, color = 'blue', onClick, subtitle }) => {
  const clickable = typeof onClick === 'function';
  return (
    <div
      onClick={onClick}
      className={`bg-white p-5 rounded-lg shadow-sm border-l-4 ${borderColors[color] || borderColors.blue} ${
        clickable ? 'cursor-pointer hover:shadow-md transition' : ''
      }`}
    >
      <h3 className="text-slate-500 text-xs font-semibold uppercase tracking-wide">
        {title}{clickable ? ' (click for detail)' : ''}
      </h3>
      <p className="text-2xl font-bold mt-1 text-slate-800">{value}</p>
      {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
    </div>
  );
};

export default StatCard;
