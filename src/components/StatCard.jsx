import React from 'react';

export default function StatCard({ label, value, subtext, subtextColor = '' }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {subtext && (
        <div className={`stat-subtext ${subtextColor}`}>
          {subtext}
        </div>
      )}
    </div>
  );
}
