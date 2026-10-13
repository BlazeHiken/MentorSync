import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../api/client';
import {
  Users,
  AlertCircle,
  Clock,
  Calendar,
  FileText,
  UserCheck,
  Loader2,
  RefreshCw,
  ArrowRight
} from 'lucide-react';

export function MentorDashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await fetchApi('/api/dashboard/');
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
      } else {
        setErrorMsg('Failed to load mentor dashboard data from backend.');
      }
    } catch {
      setErrorMsg('Network error while connecting to dashboard service.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const stats = [
    {
      label: 'Assigned Mentees',
      value: isLoading ? '—' : (metrics?.assigned_mentees_count ?? 0),
      change: metrics ? `${metrics.assigned_mentees_count} assigned in cohort` : 'Division cohort mentees',
      icon: Users,
      color: '#38bdf8'
    },
    {
      label: 'Open Issues',
      value: isLoading ? '—' : (metrics?.open_issues_count ?? 0),
      change: (metrics?.open_issues_count ?? 0) > 0 ? 'Action required' : 'No active grievances',
      icon: AlertCircle,
      color: '#f87171'
    },
    {
      label: 'Pending Follow-ups',
      value: isLoading ? '—' : (metrics?.pending_followups_count ?? 0),
      change: (metrics?.pending_followups_count ?? 0) > 0 ? 'Awaiting response/action' : 'All follow-ups handled',
      icon: Clock,
      color: '#fbbf24'
    },
    {
      label: 'Logged Sessions',
      value: isLoading ? '—' : (metrics?.logged_sessions_count ?? 0),
      change: 'Mentoring interactions recorded',
      icon: Calendar,
      color: '#34d399'
    },
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
            Hello, Prof. {user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : (user?.username || 'Mentor')}!
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Manage mentee academic progression, review reported issues, and document mentoring dialogues.
          </p>
        </div>

        <button
          className="btn"
          onClick={loadDashboardData}
          disabled={isLoading}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.08)' }}
        >
          <RefreshCw size={15} className={isLoading ? 'spin' : ''} />
          <span>Refresh Data</span>
        </button>
      </div>

      {errorMsg && (
        <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171', borderRadius: '8px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

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
              <div className="stat-value">
                {isLoading ? <Loader2 size={24} className="spin" style={{ color: 'var(--text-dim)' }} /> : s.value}
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{s.change}</span>
            </div>
          );
        })}
      </div>

      {/* Recent Mentoring Sessions */}
      <div style={{ marginTop: '36px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
            Recent Mentoring Sessions
          </h2>
          <Link to="/mentor/sessions" style={{ fontSize: '0.85rem', color: '#38bdf8', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span>View All Sessions</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {isLoading ? (
          <div className="glass-panel" style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Loader2 size={24} className="spin" style={{ margin: '0 auto 8px auto', display: 'block' }} />
            <span>Loading recent mentoring sessions...</span>
          </div>
        ) : metrics?.recent_sessions && metrics.recent_sessions.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {metrics.recent_sessions.map((session) => {
              const student = session.student_details || {};
              const studentName = student.first_name
                ? `${student.first_name} ${student.last_name || ''}`.trim()
                : (student.username || session.student_name || 'Mentee Student');
              const studentEmail = student.email || session.student_email || '';
              const discussionText = session.discussion || session.discussion_points || 'General mentoring discussion.';
              const actionFollowUp = session.action_follow_up || session.action_items;

              return (
                <div
                  key={session.id}
                  className="glass-panel"
                  style={{
                    padding: '18px 22px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    borderLeft: '4px solid #34d399'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: 'rgba(52, 211, 153, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#34d399'
                      }}>
                        <Calendar size={16} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#ffffff', margin: 0 }}>
                          {studentName}
                        </h4>
                        {studentEmail && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                            {studentEmail}
                          </span>
                        )}
                      </div>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {session.date}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    <strong style={{ color: '#e2e8f0' }}>Discussion: </strong>
                    {discussionText}
                  </div>
                  {actionFollowUp && (
                    <div style={{ fontSize: '0.8rem', color: '#fbbf24' }}>
                      <strong>Action / Follow-up: </strong>
                      {actionFollowUp}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '36px', textAlign: 'center' }}>
            <Calendar size={36} color="var(--text-dim)" style={{ margin: '0 auto 12px auto' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff', marginBottom: '6px' }}>
              No Mentoring Sessions Recorded Yet
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 16px auto' }}>
              Document one-on-one sessions with your assigned mentees to track their academic and personal development.
            </p>
            <Link to="/mentor/sessions" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span>Log Mentoring Session</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </div>

      {/* Workflows */}
      <div style={{ marginTop: '36px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px' }}>
          Mentorship Workflows
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(6,182,212,0.15)', color: '#38bdf8' }}>
                  <UserCheck size={20} />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff', margin: 0 }}>Assigned Students</h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Review assigned mentees, their academic roll numbers, and contact information.
              </p>
            </div>
            <Link to="/mentor/students" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', alignSelf: 'flex-start', fontSize: '0.85rem' }}>
              <span>View Mentees</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(16,185,129,0.15)', color: '#34d399' }}>
                  <Calendar size={20} />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff', margin: 0 }}>Session Recording</h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Document 1-on-1 counseling, observations, discussion notes, and actionable follow-ups.
              </p>
            </div>
            <Link to="/mentor/sessions" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', alignSelf: 'flex-start', fontSize: '0.85rem' }}>
              <span>Record Session</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(244,63,94,0.15)', color: '#f43f5e' }}>
                  <FileText size={20} />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff', margin: 0 }}>Issue Resolution</h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Update resolution status, attach mentor remarks, and solve student grievances.
              </p>
            </div>
            <Link to="/mentor/issues" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', alignSelf: 'flex-start', fontSize: '0.85rem' }}>
              <span>Resolve Issues</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
