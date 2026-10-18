import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { checkBackendHealth, fetchApi } from '../../api/client';
import {
  Users,
  GraduationCap,
  Layers,
  AlertCircle,
  MessageSquare,
  CheckCircle2,
  ShieldAlert,
  Loader2,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';

export function AdminDashboard() {
  const { user } = useAuth();
  const [backendStatus, setBackendStatus] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const loadDashboardData = useCallback(async () => {
    try {
      const [healthData, dashRes] = await Promise.all([
        checkBackendHealth().catch(() => ({ status: 'error', database_connected: false })),
        fetchApi('/api/dashboard/'),
      ]);
      setBackendStatus(healthData);

      if (dashRes.ok) {
        const data = await dashRes.json();
        setMetrics(data);
      } else {
        setErrorMsg('Failed to load dashboard metrics from backend.');
      }
    } catch {
      setErrorMsg('Network error while connecting to dashboard service.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    setErrorMsg('');
    loadDashboardData();
  };

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const [healthData, dashRes] = await Promise.all([
          checkBackendHealth().catch(() => ({ status: 'error', database_connected: false })),
          fetchApi('/api/dashboard/'),
        ]);
        if (!isMounted) return;
        setBackendStatus(healthData);

        if (dashRes.ok) {
          const data = await dashRes.json();
          if (isMounted) setMetrics(data);
        } else {
          if (isMounted) setErrorMsg('Failed to load dashboard metrics from backend.');
        }
      } catch {
        if (isMounted) setErrorMsg('Network error while connecting to dashboard service.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  const stats = [
    {
      label: 'Total Students',
      value: isLoading ? '—' : (metrics?.total_students ?? 0),
      change: 'Enrolled student profiles',
      icon: GraduationCap,
      color: '#0284c7',
      bgColor: '#f0f9ff',
      borderColor: '#bae6fd',
    },
    {
      label: 'Active Mentors',
      value: isLoading ? '—' : (metrics?.total_mentors ?? 0),
      change: 'Faculty mentor profiles',
      icon: Users,
      color: '#4338ca',
      bgColor: '#eef2ff',
      borderColor: '#c7d2fe',
    },
    {
      label: 'Divisions',
      value: isLoading ? '—' : (metrics?.total_divisions ?? 0),
      change: 'Academic cohorts',
      icon: Layers,
      color: '#6d28d9',
      bgColor: '#f5f3ff',
      borderColor: '#ddd6fe',
    },
    {
      label: 'Open Issues',
      value: isLoading ? '—' : (metrics?.open_issues ?? 0),
      change: metrics ? `${metrics.in_progress_issues ?? 0} in progress, ${metrics.resolved_issues ?? 0} resolved` : 'Across all categories',
      icon: AlertCircle,
      color: '#dc2626',
      bgColor: '#fef2f2',
      borderColor: '#fecaca',
    },
    {
      label: 'Feedback Entries',
      value: isLoading ? '—' : (metrics?.total_feedback ?? 0),
      change: metrics?.average_satisfaction ? `${metrics.average_satisfaction}/5.0 avg score` : 'No ratings recorded yet',
      icon: MessageSquare,
      color: '#059669',
      bgColor: '#ecfdf5',
      borderColor: '#a7f3d0',
    },
  ];

  return (
    <div className="page-container">
      {/* Welcome & System Status Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '28px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span className="badge badge-admin">Administration Portal</span>
            {backendStatus && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: backendStatus.database_connected ? '#047857' : '#dc2626',
                  padding: '3px 9px',
                  borderRadius: '9999px',
                  backgroundColor: backendStatus.database_connected ? '#ecfdf5' : '#fef2f2',
                  border: `1px solid ${backendStatus.database_connected ? '#a7f3d0' : '#fecaca'}`,
                }}
              >
                <CheckCircle2 size={13} />
                <span>Backend Connected</span>
              </span>
            )}
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--navy-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            Welcome back, {user?.first_name || user?.username}!
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px', margin: '4px 0 0' }}>
            Campus-wide mentoring operations, user allocations, and real-time oversight.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleRefresh}
          disabled={isLoading}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <RefreshCw size={15} className={isLoading ? 'spin' : ''} />
          <span>Refresh Data</span>
        </button>
      </div>

      {errorMsg && (
        <div
          role="alert"
          style={{
            padding: '12px 16px',
            backgroundColor: 'var(--accent-rose-light)',
            border: '1px solid #fecaca',
            color: 'var(--accent-rose)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.9rem',
            fontWeight: 500,
          }}
        >
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Analytics KPI Grid */}
      <div className="dashboard-grid">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="stat-label">{s.label}</span>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: s.bgColor,
                    border: `1px solid ${s.borderColor}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: s.color,
                  }}
                >
                  <Icon size={18} />
                </div>
              </div>
              <div className="stat-value" style={{ color: 'var(--navy-primary)' }}>
                {isLoading ? <Loader2 size={24} className="spin" style={{ color: 'var(--text-dim)' }} /> : s.value}
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.change}</span>
            </div>
          );
        })}
      </div>

      {/* Institutional Management Modules */}
      <div style={{ marginTop: '40px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--navy-primary)', marginBottom: '18px', letterSpacing: '-0.01em' }}>
          Management Modules
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                <div
                  style={{
                    padding: '10px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--accent-indigo-light)',
                    border: '1px solid #c7d2fe',
                    color: 'var(--accent-indigo)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Users size={20} />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
                  User Management
                </h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.55, marginBottom: '20px' }}>
                Create student profiles, onboard faculty mentors, and manage roles and credentials.
              </p>
            </div>
            <Link
              to="/admin/users"
              className="btn btn-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                alignSelf: 'flex-start',
                fontSize: '0.85rem',
              }}
            >
              <span>Manage Users</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                <div
                  style={{
                    padding: '10px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--accent-purple-light)',
                    border: '1px solid #ddd6fe',
                    color: 'var(--accent-purple)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Layers size={20} />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
                  Divisions & Assignments
                </h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.55, marginBottom: '20px' }}>
                Organize academic divisions (e.g. Div A, Div B) and assign dedicated faculty mentors.
              </p>
            </div>
            <Link
              to="/admin/divisions"
              className="btn btn-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                alignSelf: 'flex-start',
                fontSize: '0.85rem',
              }}
            >
              <span>Manage Divisions</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                <div
                  style={{
                    padding: '10px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--accent-rose-light)',
                    border: '1px solid #fecaca',
                    color: 'var(--accent-rose)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ShieldAlert size={20} />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
                  Campus Issues
                </h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.55, marginBottom: '20px' }}>
                Track escalation status for academic, facilities, and administrative student concerns.
              </p>
            </div>
            <Link
              to="/admin/issues"
              className="btn btn-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                alignSelf: 'flex-start',
                fontSize: '0.85rem',
              }}
            >
              <span>Review Issues</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
