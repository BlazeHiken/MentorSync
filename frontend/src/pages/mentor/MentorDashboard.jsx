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
  ArrowRight,
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
    let isMounted = true;
    const fetchData = async () => {
      try {
        const res = await fetchApi('/api/dashboard/');
        if (!isMounted) return;
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setMetrics(data);
        } else {
          if (isMounted) setErrorMsg('Failed to load mentor dashboard data from backend.');
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
      label: 'Assigned Mentees',
      value: isLoading ? '—' : (metrics?.assigned_mentees_count ?? 0),
      change: metrics ? `${metrics.assigned_mentees_count} assigned in cohort` : 'Division cohort mentees',
      icon: Users,
      color: '#0284c7',
      bgColor: '#f0f9ff',
      borderColor: '#bae6fd',
    },
    {
      label: 'Open Issues',
      value: isLoading ? '—' : (metrics?.open_issues_count ?? 0),
      change: (metrics?.open_issues_count ?? 0) > 0 ? 'Action required' : 'No active grievances',
      icon: AlertCircle,
      color: '#dc2626',
      bgColor: '#fef2f2',
      borderColor: '#fecaca',
    },
    {
      label: 'Pending Follow-ups',
      value: isLoading ? '—' : (metrics?.pending_followups_count ?? 0),
      change: (metrics?.pending_followups_count ?? 0) > 0 ? 'Awaiting response/action' : 'All follow-ups handled',
      icon: Clock,
      color: '#d97706',
      bgColor: '#fffbeb',
      borderColor: '#fef08a',
    },
    {
      label: 'Logged Sessions',
      value: isLoading ? '—' : (metrics?.logged_sessions_count ?? 0),
      change: 'Mentoring interactions recorded',
      icon: Calendar,
      color: '#059669',
      bgColor: '#ecfdf5',
      borderColor: '#a7f3d0',
    },
  ];

  return (
    <div className="page-container">
      {/* Mentor Welcome Banner */}
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
            <span className="badge badge-mentor">Mentor Workspace</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)' }}>
              {user?.designation || 'Faculty Mentor'} • {user?.department || 'Department of Computer Science'}
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--navy-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            Hello, Prof. {user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : (user?.username || 'Mentor')}!
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '4px 0 0' }}>
            Manage mentee academic progression, review reported issues, and document mentoring dialogues.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={loadDashboardData}
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

      {/* KPI Cards Grid */}
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

      {/* Recent Mentoring Sessions */}
      <div style={{ marginTop: '40px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '18px',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--navy-primary)', margin: 0, letterSpacing: '-0.01em' }}>
            Recent Mentoring Sessions
          </h2>
          <Link
            to="/mentor/sessions"
            style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--primary)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>View All Sessions</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {isLoading ? (
          <div className="glass-panel" style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Loader2 size={24} className="spin" style={{ margin: '0 auto 8px auto', display: 'block', color: 'var(--primary)' }} />
            <span style={{ fontSize: '0.9rem' }}>Loading recent mentoring sessions...</span>
          </div>
        ) : metrics?.recent_sessions && metrics.recent_sessions.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
                    padding: '20px 24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    borderLeft: '4px solid #059669',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: '#ecfdf5',
                          border: '1px solid #a7f3d0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#059669',
                        }}
                      >
                        <Calendar size={18} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '0.975rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
                          {studentName}
                        </h4>
                        {studentEmail && (
                          <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                            {studentEmail}
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        color: 'var(--text-muted)',
                        backgroundColor: 'var(--bg-secondary)',
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-xs)',
                      }}
                    >
                      {session.date}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '2px' }}>
                    <strong style={{ color: 'var(--navy-primary)' }}>Discussion: </strong>
                    {discussionText}
                  </div>

                  {actionFollowUp && (
                    <div
                      style={{
                        fontSize: '0.825rem',
                        color: '#b45309',
                        backgroundColor: '#fffbeb',
                        border: '1px solid #fef08a',
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-sm)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginTop: '4px',
                        alignSelf: 'flex-start',
                      }}
                    >
                      <Clock size={14} style={{ flexShrink: 0 }} />
                      <span>
                        <strong>Action / Follow-up: </strong>
                        {actionFollowUp}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '40px 24px', textAlign: 'center' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-secondary)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-dim)',
                marginBottom: '14px',
              }}
            >
              <Calendar size={28} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--navy-primary)', marginBottom: '6px' }}>
              No Mentoring Sessions Recorded Yet
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: '440px', margin: '0 auto 18px auto', lineHeight: 1.55 }}>
              Document one-on-one sessions with your assigned mentees to track their academic and personal development.
            </p>
            <Link
              to="/mentor/sessions"
              className="btn btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <span>Log Mentoring Session</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </div>

      {/* Mentorship Workflows */}
      <div style={{ marginTop: '40px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--navy-primary)', marginBottom: '18px', letterSpacing: '-0.01em' }}>
          Mentorship Workflows
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                <div
                  style={{
                    padding: '10px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--accent-cyan-light)',
                    border: '1px solid #bae6fd',
                    color: '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <UserCheck size={20} />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
                  Assigned Students
                </h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.55, marginBottom: '20px' }}>
                Review assigned mentees, their academic roll numbers, and contact information.
              </p>
            </div>
            <Link
              to="/mentor/students"
              className="btn btn-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                alignSelf: 'flex-start',
                fontSize: '0.85rem',
              }}
            >
              <span>View Mentees</span>
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
                    backgroundColor: 'var(--accent-emerald-light)',
                    border: '1px solid #a7f3d0',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Calendar size={20} />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
                  Session Recording
                </h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.55, marginBottom: '20px' }}>
                Document 1-on-1 counseling, observations, discussion notes, and actionable follow-ups.
              </p>
            </div>
            <Link
              to="/mentor/sessions"
              className="btn btn-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                alignSelf: 'flex-start',
                fontSize: '0.85rem',
              }}
            >
              <span>Record Session</span>
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
                  <FileText size={20} />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
                  Issue Resolution
                </h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.55, marginBottom: '20px' }}>
                Update resolution status, attach mentor remarks, and solve student grievances.
              </p>
            </div>
            <Link
              to="/mentor/issues"
              className="btn btn-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                alignSelf: 'flex-start',
                fontSize: '0.85rem',
              }}
            >
              <span>Resolve Issues</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
