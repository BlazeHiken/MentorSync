import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { checkBackendHealth } from '../../api/client';
import { 
  Users, 
  GraduationCap, 
  Layers, 
  AlertCircle, 
  MessageSquare, 
  CheckCircle2, 
  ArrowUpRight,
  ShieldAlert
} from 'lucide-react';

export function AdminDashboard() {
  const { user } = useAuth();
  const [backendStatus, setBackendStatus] = useState(null);

  useEffect(() => {
    checkBackendHealth()
      .then(data => setBackendStatus(data))
      .catch(() => setBackendStatus({ status: 'error', database_connected: false }));
  }, []);

  const stats = [
    { label: 'Total Students', value: '120', change: '+12 this semester', icon: GraduationCap, color: '#38bdf8' },
    { label: 'Active Mentors', value: '12', change: 'All assigned', icon: Users, color: '#818cf8' },
    { label: 'Divisions', value: '6', change: 'Active cohorts', icon: Layers, color: '#c084fc' },
    { label: 'Open Issues', value: '18', change: '4 high priority', icon: AlertCircle, color: '#f87171' },
    { label: 'Feedback Entries', value: '245', change: '4.2/5.0 avg score', icon: MessageSquare, color: '#34d399' },
  ];

  return (
    <div className="page-container">
      {/* Welcome Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '28px',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="badge badge-admin">Administration Portal</span>
            {backendStatus && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.75rem',
                color: backendStatus.database_connected ? '#34d399' : '#f87171',
                padding: '3px 8px',
                borderRadius: '9999px',
                background: backendStatus.database_connected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${backendStatus.database_connected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
              }}>
                <CheckCircle2 size={12} />
                <span>Backend Connected</span>
              </span>
            )}
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
            Welcome back, {user?.first_name || user?.username}!
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Campus-wide mentoring operations, user allocations, and real-time oversight.
          </p>
        </div>
      </div>

      {/* Analytics KPI Grid */}
      <div className="dashboard-grid">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="stat-label">{s.label}</span>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: `${s.color}15`,
                  border: `1px solid ${s.color}30`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: s.color
                }}>
                  <Icon size={18} />
                </div>
              </div>
              <div className="stat-value">{s.value}</div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{s.change}</span>
            </div>
          );
        })}
      </div>

      {/* Modules Overview */}
      <div style={{ marginTop: '36px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px' }}>
          Management Modules
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
                <Users size={20} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff', margin: 0 }}>User Management</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Create student profiles, onboard faculty mentors, and manage roles and credentials.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span className="badge badge-admin">Step 2 Feature</span>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(168,85,247,0.15)', color: '#c084fc' }}>
                <Layers size={20} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff', margin: 0 }}>Divisions & Assignments</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Organize academic divisions (e.g. Div A, Div B) and assign dedicated faculty mentors.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span className="badge badge-admin">Step 2 Feature</span>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(244,63,94,0.15)', color: '#f43f5e' }}>
                <ShieldAlert size={20} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff', margin: 0 }}>Campus Issues</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Track escalation status for academic, facilities, and administrative student concerns.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span className="badge badge-admin">Step 3 Feature</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
