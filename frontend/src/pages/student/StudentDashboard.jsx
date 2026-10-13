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
  ArrowRight
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
    loadDashboardData();
  }, [loadDashboardData]);

  const isSurveyCompleted = Boolean(metrics?.survey_completed ?? metrics?.has_survey);

  return (
    <div className="page-container">
      {/* Student Welcome Header */}
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
            <span className="badge badge-student">Student Portal</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              Roll: {user?.roll_number || 'Unassigned'} • {user?.department || 'Department not specified'}
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
            Welcome, {user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : (user?.username || 'Student')}!
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Track your mentorship records, voice feedback, and resolve academic or campus concerns.
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

      {/* Primary Mentor Card & Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Assigned Mentor Card */}
        <div className="glass-panel" style={{
          padding: '24px',
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))',
          border: '1px solid rgba(6, 182, 212, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          {isLoading ? (
            <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Loader2 size={24} className="spin" style={{ margin: '0 auto 8px auto', display: 'block' }} />
              <span>Loading mentor assignment...</span>
            </div>
          ) : metrics?.assigned_mentor ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, color: '#38bdf8' }}>
                  Your Assigned Faculty Mentor
                </span>
                <span className="badge badge-mentor">
                  {metrics.assigned_mentor.division_name || 'Assigned'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '14px' }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: '0 8px 18px rgba(6, 182, 212, 0.35)'
                }}>
                  <UserCheck size={26} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                    {getMentorDisplayName(metrics.assigned_mentor)}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                    {metrics.assigned_mentor.designation || 'Faculty Mentor'} • Dept. of {metrics.assigned_mentor.department || 'Computer Science'}
                  </p>
                </div>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', margin: 0 }}>
                {metrics.assigned_mentor.email ? `Email: ${metrics.assigned_mentor.email}` : 'Assigned Division Mentor'}
              </p>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Faculty Mentor Allocation
                </span>
                <span className="badge" style={{ background: 'rgba(148, 163, 184, 0.15)', color: 'var(--text-dim)', border: '1px solid rgba(148, 163, 184, 0.2)' }}>
                  Unassigned
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '14px' }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)'
                }}>
                  <UserX size={26} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#ffffff', margin: 0 }}>
                    No Mentor Assigned Yet
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                    Your division assignment has not been completed by administration.
                  </p>
                </div>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', margin: 0 }}>
                Please contact campus administration or your academic department for mentor allocation.
              </p>
            </div>
          )}
        </div>

        {/* Recent Session Summary */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          {isLoading ? (
            <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Loader2 size={24} className="spin" style={{ margin: '0 auto 8px auto', display: 'block' }} />
              <span>Loading mentoring session...</span>
            </div>
          ) : metrics?.recent_session ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, color: '#34d399' }}>
                  Latest Mentoring Session
                </span>
                <Calendar size={16} color="#34d399" />
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#ffffff', marginBottom: '6px' }}>
                {metrics.recent_session.discussion || metrics.recent_session.discussion_points || 'Mentoring Interaction'}
              </h4>
              {(metrics.recent_session.action_follow_up || metrics.recent_session.action_items) && (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  <strong style={{ color: '#e2e8f0' }}>Action / Follow-up: </strong>
                  {metrics.recent_session.action_follow_up || metrics.recent_session.action_items}
                </p>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', flexWrap: 'wrap', gap: '6px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  Conducted: {metrics.recent_session.date} • with {getSessionMentorName(metrics.recent_session)}
                </span>
                <Link to="/student/sessions" style={{ fontSize: '0.8rem', color: '#38bdf8', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <span>View Details</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Latest Mentoring Session
                </span>
                <Calendar size={16} color="var(--text-dim)" />
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff', marginBottom: '6px' }}>
                No Sessions Recorded Yet
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Your faculty mentor will record discussion points and action items after your one-on-one sessions.
              </p>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
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
            <AlertCircle size={20} color="#f87171" />
          </div>
          <div className="stat-value">
            {isLoading ? <Loader2 size={24} className="spin" style={{ color: 'var(--text-dim)' }} /> : (metrics?.issue_count ?? 0)}
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            {metrics ? `${metrics.issue_count} total issues submitted` : 'Grievance and facility issues'}
          </span>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">Submitted Feedback</span>
            <MessageSquare size={20} color="#818cf8" />
          </div>
          <div className="stat-value">
            {isLoading ? <Loader2 size={24} className="spin" style={{ color: 'var(--text-dim)' }} /> : (metrics?.feedback_count ?? 0)}
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            {metrics ? `${metrics.feedback_count} feedback submissions` : 'Academic and campus feedback'}
          </span>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">Satisfaction Survey</span>
            <Star size={20} color="#fbbf24" />
          </div>
          <div className="stat-value">
            {isLoading ? (
              <Loader2 size={24} className="spin" style={{ color: 'var(--text-dim)' }} />
            ) : isSurveyCompleted ? (
              `${metrics?.survey_rating ?? 5}/5`
            ) : (
              'Pending'
            )}
          </div>
          <span style={{ fontSize: '0.8rem', color: isSurveyCompleted ? '#34d399' : '#fbbf24' }}>
            {isSurveyCompleted ? 'Evaluation submitted' : 'Awaiting your rating'}
          </span>
        </div>
      </div>

      {/* Action shortcuts */}
      <div style={{ marginTop: '36px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px' }}>
          Quick Student Actions
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
                  <MessageSquare size={20} />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff', margin: 0 }}>Give Academic Feedback</h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Share constructive thoughts on syllabus pacing, campus facilities, or lab infrastructure.
              </p>
            </div>
            <Link to="/student/feedback" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', alignSelf: 'flex-start', fontSize: '0.85rem' }}>
              <span>Submit Feedback</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(251,191,36,0.15)', color: '#fbbf24' }}>
                  <Star size={20} />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff', margin: 0 }}>Mentor Satisfaction Survey</h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Evaluate guidance accessibility, helpfulness, and mentor support quality.
              </p>
            </div>
            <Link to="/student/survey" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', alignSelf: 'flex-start', fontSize: '0.85rem' }}>
              <span>{isSurveyCompleted ? 'Review Survey' : 'Take Survey'}</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(244,63,94,0.15)', color: '#f43f5e' }}>
                  <AlertCircle size={20} />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff', margin: 0 }}>Report an Issue</h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Notify your mentor and campus authority about urgent concerns or administrative hurdles.
              </p>
            </div>
            <Link to="/student/issues" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', alignSelf: 'flex-start', fontSize: '0.85rem' }}>
              <span>Report Issue</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
