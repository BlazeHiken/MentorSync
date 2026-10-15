import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../api/client';
import { AlertCircle, Loader2, Star, MessageSquare, Award, Calendar, User } from 'lucide-react';

const categoryColorMap = {
  academic: { color: '#818cf8', bg: 'rgba(99, 102, 241, 0.12)', border: 'rgba(99, 102, 241, 0.25)' },
  facilities: { color: '#38bdf8', bg: 'rgba(6, 182, 212, 0.12)', border: 'rgba(6, 182, 212, 0.25)' },
  faculty: { color: '#c084fc', bg: 'rgba(168, 85, 247, 0.12)', border: 'rgba(168, 85, 247, 0.25)' },
  administration: { color: '#34d399', bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.25)' },
  other: { color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.12)', border: 'rgba(148, 163, 184, 0.25)' },
};

export function FeedbackView({ isMentor }) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState('feedback');

  useEffect(() => {
    Promise.all([loadFeedbacks(), loadSurveys()])
      .finally(() => setIsLoading(false));
  }, []);

  const loadFeedbacks = async () => {
    try {
      const res = await fetchApi('/api/feedback/');
      if (res.ok) setFeedbacks(await res.json());
      else setErrorMsg('Failed to load feedback records.');
    } catch { setErrorMsg('Network error while loading feedback.'); }
  };

  const loadSurveys = async () => {
    try {
      const res = await fetchApi('/api/surveys/');
      if (res.ok) setSurveys(await res.json());
      else setErrorMsg('Failed to load satisfaction surveys.');
    } catch { setErrorMsg('Network error while loading surveys.'); }
  };

  const renderStarRating = (rating) => {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={13}
            fill={star <= rating ? '#fbbf24' : 'transparent'}
            color={star <= rating ? '#fbbf24' : 'rgba(255,255,255,0.2)'}
          />
        ))}
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fbbf24', marginLeft: '4px' }}>
          {rating}.0
        </span>
      </div>
    );
  };

  return (
    <div className="page-container">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
          {isMentor ? 'Student Feedback & Surveys' : 'Institutional Feedback & Surveys'}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
          {isMentor 
            ? 'Review feedback entries and mentorship evaluations submitted by your mentees.' 
            : 'Campus-wide feedback submissions and mentor satisfaction ratings.'}
        </p>
      </div>

      {errorMsg && (
        <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#f87171', borderRadius: 'var(--radius-md)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Modern Segmented Navigation Tabs */}
      <div style={{
        display: 'inline-flex',
        padding: '4px',
        borderRadius: 'var(--radius-md)',
        background: 'rgba(15, 23, 42, 0.75)',
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
            transition: 'all 0.15s ease',
            color: activeTab === 'feedback' ? '#ffffff' : 'var(--text-muted)',
            background: activeTab === 'feedback' ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'transparent',
            boxShadow: activeTab === 'feedback' ? '0 4px 12px rgba(99, 102, 241, 0.35)' : 'none',
          }}
        >
          <MessageSquare size={16} />
          <span>Feedback Submissions</span>
          <span style={{
            fontSize: '0.75rem',
            padding: '2px 7px',
            borderRadius: '9999px',
            background: activeTab === 'feedback' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)',
            color: '#ffffff'
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
            transition: 'all 0.15s ease',
            color: activeTab === 'survey' ? '#ffffff' : 'var(--text-muted)',
            background: activeTab === 'survey' ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'transparent',
            boxShadow: activeTab === 'survey' ? '0 4px 12px rgba(99, 102, 241, 0.35)' : 'none',
          }}
        >
          <Award size={16} />
          <span>Satisfaction Surveys</span>
          <span style={{
            fontSize: '0.75rem',
            padding: '2px 7px',
            borderRadius: '9999px',
            background: activeTab === 'survey' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)',
            color: '#ffffff'
          }}>
            {surveys.length}
          </span>
        </button>
      </div>

      <div className="glass-panel" style={{ position: 'relative', minHeight: '220px', overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            <Loader2 size={24} className="spin" style={{ marginRight: '8px' }}/>
            <span>Loading records...</span>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: '680px', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '16px 20px' }}>Date</th>
                  <th style={{ padding: '16px 20px' }}>Student</th>
                  {activeTab === 'feedback' ? (
                    <>
                      <th style={{ padding: '16px 20px' }}>Category</th>
                      <th style={{ padding: '16px 20px' }}>Rating</th>
                    </>
                  ) : (
                    <>
                      <th style={{ padding: '16px 20px' }}>Satisfaction</th>
                      <th style={{ padding: '16px 20px' }}>Helpfulness</th>
                    </>
                  )}
                  <th style={{ padding: '16px 20px' }}>Comments / Details</th>
                </tr>
              </thead>
              <tbody>
                {(activeTab === 'feedback' ? feedbacks : surveys).length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-dim)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        {activeTab === 'feedback' ? <MessageSquare size={32} style={{ opacity: 0.4 }} /> : <Star size={32} style={{ opacity: 0.4 }} />}
                        <span style={{ fontSize: '0.95rem', fontWeight: 500, color: '#e2e8f0' }}>No {activeTab} submissions recorded yet</span>
                        <span style={{ fontSize: '0.8rem' }}>Records will automatically appear here once students submit evaluations.</span>
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
                      <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s ease' }}>
                        <td style={{ padding: '16px 20px', color: 'var(--text-muted)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Calendar size={13} style={{ color: 'var(--text-dim)' }} />
                            <span>{new Date(item.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                          </div>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '8px',
                              background: 'rgba(99, 102, 241, 0.15)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#c7d2fe',
                              fontSize: '0.75rem',
                              fontWeight: 700
                            }}>
                              {(studentName || 'S').slice(0, 1).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.875rem' }}>{studentName}</div>
                              {rollNo && <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>Roll: {rollNo}</div>}
                            </div>
                          </div>
                        </td>
                        
                        {activeTab === 'feedback' ? (
                          <>
                            <td style={{ padding: '16px 20px' }}>
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                padding: '4px 10px',
                                borderRadius: '9999px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                textTransform: 'capitalize',
                                color: catStyle.color,
                                background: catStyle.bg,
                                border: `1px solid ${catStyle.border}`
                              }}>
                                {item.category}
                              </span>
                            </td>
                            <td style={{ padding: '16px 20px' }}>
                              {renderStarRating(item.rating)}
                            </td>
                          </>
                        ) : (
                          <>
                            <td style={{ padding: '16px 20px' }}>
                              {renderStarRating(item.mentor_satisfaction_rating)}
                            </td>
                            <td style={{ padding: '16px 20px' }}>
                              {renderStarRating(item.mentor_helpfulness_rating)}
                            </td>
                          </>
                        )}

                        <td style={{ padding: '16px 20px', color: 'var(--text-main)', fontSize: '0.875rem', maxWidth: '340px' }}>
                          <p style={{ margin: 0, wordBreak: 'break-word', color: item.comments ? '#e2e8f0' : 'var(--text-dim)' }}>
                            {item.comments || 'No written feedback provided.'}
                          </p>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
