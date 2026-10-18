import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../api/client';
import { AlertCircle, Loader2, Star, MessageSquare, Award, Calendar } from 'lucide-react';

const categoryColorMap = {
  academic: { color: '#0284c7', bg: 'var(--accent-cyan-light)', border: '#bae6fd' },
  facilities: { color: '#6d28d9', bg: 'var(--accent-purple-light)', border: '#ddd6fe' },
  faculty: { color: '#4338ca', bg: 'var(--accent-indigo-light)', border: '#c7d2fe' },
  administration: { color: '#059669', bg: 'var(--accent-emerald-light)', border: '#a7f3d0' },
  other: { color: '#475569', bg: '#f1f5f9', border: '#cbd5e1' },
};

export function FeedbackView({ isMentor }) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState('feedback');

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const [feedbackRes, surveyRes] = await Promise.all([
          fetchApi('/api/feedback/'),
          fetchApi('/api/surveys/'),
        ]);
        if (!isMounted) return;

        if (feedbackRes.ok) {
          const feedbackData = await feedbackRes.json();
          if (isMounted) setFeedbacks(feedbackData);
        } else {
          if (isMounted) setErrorMsg('Failed to load feedback records.');
        }

        if (surveyRes.ok) {
          const surveyData = await surveyRes.json();
          if (isMounted) setSurveys(surveyData);
        } else {
          if (isMounted) setErrorMsg('Failed to load satisfaction surveys.');
        }
      } catch {
        if (isMounted) setErrorMsg('Network error while loading feedback.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  const renderStarRating = (rating) => {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={13}
            fill={star <= rating ? '#f59e0b' : 'transparent'}
            color={star <= rating ? '#d97706' : '#cbd5e1'}
          />
        ))}
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#b45309', marginLeft: '4px' }}>
          {rating}.0
        </span>
      </div>
    );
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--navy-primary)', margin: 0, letterSpacing: '-0.02em' }}>
          {isMentor ? 'Student Feedback & Surveys' : 'Institutional Feedback & Surveys'}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
          {isMentor
            ? 'Review feedback entries and mentorship evaluations submitted by your mentees.'
            : 'Campus-wide feedback submissions and mentor satisfaction ratings.'}
        </p>
      </div>

      {errorMsg && (
        <div role="alert" style={{ padding: '12px 16px', background: 'var(--accent-rose-light)', border: '1px solid #fecaca', color: 'var(--accent-rose)', borderRadius: 'var(--radius-md)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 500, fontSize: '0.9rem' }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Modern Segmented Navigation Tabs */}
      <div style={{
        display: 'inline-flex',
        padding: '4px',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        marginBottom: '24px',
        gap: '4px'
      }}>
        <button
          type="button"
          onClick={() => setActiveTab('feedback')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 18px',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
            color: activeTab === 'feedback' ? '#ffffff' : 'var(--text-secondary)',
            backgroundColor: activeTab === 'feedback' ? 'var(--navy-primary)' : 'transparent',
            boxShadow: activeTab === 'feedback' ? 'var(--shadow-sm)' : 'none',
          }}
        >
          <MessageSquare size={16} />
          <span>Feedback Submissions</span>
          <span style={{
            fontSize: '0.75rem',
            padding: '2px 7px',
            borderRadius: '9999px',
            backgroundColor: activeTab === 'feedback' ? 'rgba(255,255,255,0.2)' : 'var(--bg-tertiary)',
            color: activeTab === 'feedback' ? '#ffffff' : 'var(--text-muted)',
            fontWeight: 700,
          }}>
            {feedbacks.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('survey')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 18px',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
            color: activeTab === 'survey' ? '#ffffff' : 'var(--text-secondary)',
            backgroundColor: activeTab === 'survey' ? 'var(--navy-primary)' : 'transparent',
            boxShadow: activeTab === 'survey' ? 'var(--shadow-sm)' : 'none',
          }}
        >
          <Award size={16} />
          <span>Satisfaction Surveys</span>
          <span style={{
            fontSize: '0.75rem',
            padding: '2px 7px',
            borderRadius: '9999px',
            backgroundColor: activeTab === 'survey' ? 'rgba(255,255,255,0.2)' : 'var(--bg-tertiary)',
            color: activeTab === 'survey' ? '#ffffff' : 'var(--text-muted)',
            fontWeight: 700,
          }}>
            {surveys.length}
          </span>
        </button>
      </div>

      {/* Table Panel */}
      <div className="table-wrapper" style={{ minHeight: '220px' }}>
        {isLoading ? (
          <div style={{ minHeight: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            <Loader2 size={24} className="spin" style={{ marginRight: '8px', color: 'var(--primary)' }}/>
            <span>Loading evaluation records...</span>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Student</th>
                {activeTab === 'feedback' ? (
                  <>
                    <th>Category</th>
                    <th>Rating</th>
                  </>
                ) : (
                  <>
                    <th>Satisfaction</th>
                    <th>Helpfulness</th>
                  </>
                )}
                <th>Comments / Observations</th>
              </tr>
            </thead>
            <tbody>
              {(activeTab === 'feedback' ? feedbacks : surveys).length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      {activeTab === 'feedback' ? <MessageSquare size={32} style={{ opacity: 0.5, color: 'var(--text-dim)' }} /> : <Star size={32} style={{ opacity: 0.5, color: 'var(--text-dim)' }} />}
                      <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--navy-primary)' }}>No {activeTab} submissions recorded yet</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Records will automatically appear here once students submit evaluations.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                (activeTab === 'feedback' ? feedbacks : surveys).map(item => {
                  const student = item.student_details || {};
                  const studentName = student.first_name
                    ? `${student.first_name} ${student.last_name || ''}`.trim()
                    : (student.username || 'Student');
                  const rollNo = student.profile?.roll_number;
                  const catStyle = categoryColorMap[item.category?.toLowerCase()] || categoryColorMap.other;

                  return (
                    <tr key={item.id}>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Calendar size={13} style={{ color: 'var(--text-dim)' }} />
                          <span>{new Date(item.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'var(--accent-indigo-light)',
                            border: '1px solid #c7d2fe',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--accent-indigo)',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            flexShrink: 0
                          }}>
                            {(studentName || 'S').slice(0, 1).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '0.875rem' }}>{studentName}</div>
                            {rollNo && <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>Roll: {rollNo}</div>}
                          </div>
                        </div>
                      </td>

                      {activeTab === 'feedback' ? (
                        <>
                          <td>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '3px 9px',
                              borderRadius: '9999px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              textTransform: 'capitalize',
                              color: catStyle.color,
                              backgroundColor: catStyle.bg,
                              border: `1px solid ${catStyle.border}`
                            }}>
                              {item.category}
                            </span>
                          </td>
                          <td>
                            {renderStarRating(item.rating)}
                          </td>
                        </>
                      ) : (
                        <>
                          <td>
                            {renderStarRating(item.mentor_satisfaction_rating)}
                          </td>
                          <td>
                            {renderStarRating(item.mentor_helpfulness_rating)}
                          </td>
                        </>
                      )}

                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '380px' }}>
                        <p style={{ margin: 0, wordBreak: 'break-word', color: item.comments ? 'var(--text-secondary)' : 'var(--text-dim)', fontStyle: item.comments ? 'normal' : 'italic' }}>
                          {item.comments || 'No written comments provided.'}
                        </p>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
