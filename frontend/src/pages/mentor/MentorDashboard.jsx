import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, 
  AlertCircle, 
  Clock, 
  Calendar, 
  MessageSquare, 
  FileText,
  UserCheck
} from 'lucide-react';

export function MentorDashboard() {
  const { user } = useAuth();

  const stats = [
    { label: 'Assigned Mentees', value: '15', change: 'Division A cohort', icon: Users, color: '#38bdf8' },
    { label: 'Open Issues', value: '3', change: '2 awaiting response', icon: AlertCircle, color: '#f87171' },
    { label: 'Pending Follow-ups', value: '2', change: 'Due this week', icon: Clock, color: '#fbbf24' },
    { label: 'Logged Sessions', value: '8', change: 'This semester', icon: Calendar, color: '#34d399' },
  ];

  return (
    <div className="page-container">
      {/* Mentor Welcome Banner */}
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
            <span className="badge badge-mentor">Mentor Workspace</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              {user?.designation || 'Faculty Mentor'} • {user?.department || 'Department of Computer Science'}
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
            Hello, Prof. {user?.first_name || user?.username}!
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Manage mentee academic progression, review reported issues, and document mentoring dialogues.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
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

      {/* Workflows */}
      <div style={{ marginTop: '36px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px' }}>
          Mentorship Workflows
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(6,182,212,0.15)', color: '#38bdf8' }}>
                <UserCheck size={20} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff', margin: 0 }}>Assigned Students</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Review assigned mentees, their academic roll numbers, and contact information.
            </p>
            <span className="badge badge-mentor">Ready for Step 2</span>
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(16,185,129,0.15)', color: '#34d399' }}>
                <Calendar size={20} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff', margin: 0 }}>Session Recording</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Document 1-on-1 counseling, observations, discussion notes, and actionable follow-ups.
            </p>
            <span className="badge badge-mentor">Ready for Step 3</span>
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(244,63,94,0.15)', color: '#f43f5e' }}>
                <FileText size={20} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff', margin: 0 }}>Issue Resolution</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Update resolution status, attach mentor remarks, and solve student grievances.
            </p>
            <span className="badge badge-mentor">Ready for Step 3</span>
          </div>
        </div>
      </div>
    </div>
  );
}
