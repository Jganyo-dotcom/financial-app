import React from 'react';
import { DollarSign, TrendingUp, AlertTriangle, Package } from 'lucide-react';

export default function DashboardOverview() {
  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.5rem' }}>
        Dashboard Overview
      </h1>
      <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
        Real-time financial status, inventory values, and automated alerts.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <StatCard title="Total Revenue" value="$28,450.00" icon={<DollarSign color="#6366f1" />} color="rgba(99, 102, 241, 0.1)" />
        <StatCard title="Calculated Net Profit" value="$8,920.00" icon={<TrendingUp color="#10b981" />} color="rgba(16, 185, 129, 0.1)" />
        <StatCard title="Total Items Stocked" value="1,240 Units" icon={<Package color="#3b82f6" />} color="rgba(59, 130, 246, 0.1)" />
        <StatCard title="Low Stock Warning" value="2 Items" icon={<AlertTriangle color="#f59e0b" />} color="rgba(245, 158, 11, 0.1)" />
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div style={{
      backgroundColor: '#1e293b',
      border: '1px solid #334155',
      borderRadius: '1rem',
      padding: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    }}>
      <div style={{ backgroundColor: color, padding: '0.75rem', borderRadius: '0.75rem' }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: '0.8125rem', color: '#94a3b8', fontWeight: '600' }}>{title}</p>
        <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginTop: '0.25rem' }}>{value}</h3>
      </div>
    </div>
  );
}