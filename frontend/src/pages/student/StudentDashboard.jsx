import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../api/client';
import {
  UserCheck,
  UserX,
  AlertCircle,
  MessageSquare,
  Star,
  Calendar,
  Loader2,
  RefreshCw,
  ArrowRight,
  Mail,
  Clock,
} from 'lucide-react';

function getMentorDisplayName(mentor) {
  if (!mentor) return 'Faculty Mentor';
  const fullName = `${mentor.first_name || ''} ${mentor.last_name || ''}`.trim();
  if (fullName) return `Prof. ${fullName}`;
  if (mentor.username) return `Prof. ${mentor.username}`;
  return mentor.name || 'Faculty Mentor';
}

function getSessionMentorName(session) {
  if (!session) return 'Assigned Mentor';
  const mentor = session.mentor_details;
  if (mentor) {
    const fullName = `${mentor.first_name || ''} ${mentor.last_name || ''}`.trim();
    if (fullName) return `Prof. ${fullName}`;
    if (mentor.username) return `Prof. ${mentor.username}`;
  }
  if (session.mentor_name) return session.mentor_name;
  return 'Assigned Mentor';
}

export function StudentDashboard() {
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
        setErrorMsg('Failed to load student dashboard data from backend.');
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
          if (isMounted) setErrorMsg('Failed to load student dashboard data from backend.');
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

  const isSurveyCompleted = Boolean(metrics?.survey_completed ?? metrics?.has_survey);

  return (
    <div className="page-container">
      {/* Student Welcome Header */}
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
            <span className="badge badge-student">Student Portal</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)' }}>
              Roll: {user?.roll_number || 'Unassigned'} • {user?.department || 'Department not specified'}
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--navy-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            Welcome, {user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : (user?.username || 'Student')}!
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '4px 0 0' }}>
            Track your mentorship records, voice feedback, and resolve academic or campus concerns.
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

      {/* Primary Mentor Card & Latest Session */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Assigned Mentor Card */}
        <div
          className="glass-panel"
          style={{
            padding: '26px 28px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderTop: '4px solid var(--primary)',
          }}
        >
          {isLoading ? (
            <div style={{ padding: '28px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Loader2 size={24} className="spin" style={{ margin: '0 auto 8px auto', display: 'block', color: 'var(--primary)' }} />
              <span style={{ fontSize: '0.9rem' }}>Loading mentor allocation...</span>
            </div>
          ) : metrics?.assigned_mentor ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, color: 'var(--primary)' }}>
                  Your Assigned Faculty Mentor
                </span>
                <span className="badge badge-mentor">
                  {metrics.assigned_mentor.division_name || 'Assigned'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <div
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'linear-gradient(135deg, var(--navy-primary) 0%, var(--primary) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    boxShadow: '0 6px 18px -3px rgba(15, 41, 74, 0.25)',
                    flexShrink: 0,
                  }}
                >
                  <UserCheck size={26} strokeWidth={2.2} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--navy-primary)', margin: 0, letterSpacing: '-0.01em' }}>
                    {getMentorDisplayName(metrics.assigned_mentor)}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                    {metrics.assigned_mentor.designation || 'Faculty Mentor'} • Dept. of {metrics.assigned_mentor.department || 'Computer Science'}
                  </p>
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.825rem',
                  color: 'var(--text-secondary)',
                }}
              >
                <Mail size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                <span>{metrics.assigned_mentor.email ? metrics.assigned_mentor.email : 'Division Mentor Contact on File'}</span>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, color: 'var(--text-muted)' }}>
                  Faculty Mentor Allocation
                </span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '3px 8px',
                    borderRadius: '9999px',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border-medium)',
                  }}
                >
                  Unassigned
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '14px' }}>
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-dim)',
                    flexShrink: 0,
                  }}
                >
                  <UserX size={26} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--navy-primary)', margin: 0 }}>
                    No Mentor Assigned Yet
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                    Your division assignment has not been completed by administration.
                  </p>
                </div>
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-dim)', margin: 0, lineHeight: 1.5 }}>
                Please contact campus administration or your academic department for mentor allocation.
              </p>
            </div>
          )}
        </div>

        {/* Recent Session Summary Card */}
        <div
          className="glass-panel"
          style={{
            padding: '26px 28px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderTop: '4px solid #059669',
          }}
        >
          {isLoading ? (
            <div style={{ padding: '28px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Loader2 size={24} className="spin" style={{ margin: '0 auto 8px auto', display: 'block', color: '#059669' }} />
              <span style={{ fontSize: '0.9rem' }}>Loading mentoring session...</span>
            </div>
          ) : metrics?.recent_session ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, color: '#059669' }}>
                  Latest Mentoring Session
                </span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  <Calendar size={14} color="#059669" />
                  <span>{metrics.recent_session.date}</span>
                </span>
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--navy-primary)', marginBottom: '8px' }}>
                {metrics.recent_session.discussion || metrics.recent_session.discussion_points || 'Mentoring Interaction'}
              </h4>
              {(metrics.recent_session.action_follow_up || metrics.recent_session.action_items) && (
                <div
                  style={{
                    fontSize: '0.825rem',
                    color: '#b45309',
                    backgroundColor: '#fffbeb',
                    border: '1px solid #fef08a',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '14px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '6px',
                  }}
                >
                  <Clock size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span>
                    <strong>Action / Follow-up: </strong>
                    {metrics.recent_session.action_follow_up || metrics.recent_session.action_items}
                  </span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                  Conducted with {getSessionMentorName(metrics.recent_session)}
                </span>
                <Link
                  to="/student/sessions"
                  style={{
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    color: 'var(--primary)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span>View Details</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, color: 'var(--text-muted)' }}>
                  Latest Mentoring Session
                </span>
                <Calendar size={16} color="var(--text-dim)" />
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--navy-primary)', marginBottom: '6px' }}>
                No Sessions Recorded Yet
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.55 }}>
                Your faculty mentor will record discussion points and action items after your one-on-one sessions.
              </p>
              <span style={{ fontSize: '0.775rem', color: 'var(--text-dim)' }}>
                Session history will be tracked here automatically.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="dashboard-grid">
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">Reported Issues</span>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#dc2626',
              }}
            >
              <AlertCircle size={18} />
            </div>
          </div>
          <div className="stat-value" style={{ color: 'var(--navy-primary)' }}>
            {isLoading ? <Loader2 size={24} className="spin" style={{ color: 'var(--text-dim)' }} /> : (metrics?.issue_count ?? 0)}
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {metrics ? `${metrics.issue_count} total issues submitted` : 'Grievance and facility issues'}
          </span>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">Submitted Feedback</span>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#eef2ff',
                border: '1px solid #c7d2fe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#4338ca',
              }}
            >
              <MessageSquare size={18} />
            </div>
          </div>
          <div className="stat-value" style={{ color: 'var(--navy-primary)' }}>
            {isLoading ? <Loader2 size={24} className="spin" style={{ color: 'var(--text-dim)' }} /> : (metrics?.feedback_count ?? 0)}
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {metrics ? `${metrics.feedback_count} feedback submissions` : 'Academic and campus feedback'}
          </span>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">Satisfaction Survey</span>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#fffbeb',
                border: '1px solid #fef08a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#d97706',
              }}
            >
              <Star size={18} />
            </div>
          </div>
          <div className="stat-value" style={{ color: 'var(--navy-primary)' }}>
            {isLoading ? (
              <Loader2 size={24} className="spin" style={{ color: 'var(--text-dim)' }} />
            ) : isSurveyCompleted ? (
              `${metrics?.survey_rating ?? 5}/5`
            ) : (
              'Pending'
            )}
          </div>
          <span style={{ fontSize: '0.8rem', fontWeight: 500, color: isSurveyCompleted ? '#059669' : '#d97706' }}>
            {isSurveyCompleted ? 'Evaluation submitted' : 'Awaiting your rating'}
          </span>
        </div>
      </div>

      {/* Quick Student Actions */}
      <div style={{ marginTop: '40px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--navy-primary)', marginBottom: '18px', letterSpacing: '-0.01em' }}>
          Quick Student Actions
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
                  <MessageSquare size={20} />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
                  Give Academic Feedback
                </h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.55, marginBottom: '20px' }}>
                Share constructive thoughts on syllabus pacing, campus facilities, or lab infrastructure.
              </p>
            </div>
            <Link
              to="/student/feedback"
              className="btn btn-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                alignSelf: 'flex-start',
                fontSize: '0.85rem',
              }}
            >
              <span>Submit Feedback</span>
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
                    backgroundColor: 'var(--accent-amber-light)',
                    border: '1px solid #fef08a',
                    color: '#d97706',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Star size={20} />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
                  Mentor Satisfaction Survey
                </h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.55, marginBottom: '20px' }}>
                Evaluate guidance accessibility, helpfulness, and mentor support quality.
              </p>
            </div>
            <Link
              to="/student/survey"
              className="btn btn-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                alignSelf: 'flex-start',
                fontSize: '0.85rem',
              }}
            >
              <span>{isSurveyCompleted ? 'Review Survey' : 'Take Survey'}</span>
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
                  <AlertCircle size={20} />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
                  Report an Issue
                </h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.55, marginBottom: '20px' }}>
                Notify your mentor and campus authority about urgent concerns or administrative hurdles.
              </p>
            </div>
            <Link
              to="/student/issues"
              className="btn btn-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                alignSelf: 'flex-start',
                fontSize: '0.85rem',
              }}
            >
              <span>Report Issue</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
