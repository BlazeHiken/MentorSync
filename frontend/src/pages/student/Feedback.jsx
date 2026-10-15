import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../api/client';
import { MessageSquare, AlertCircle, CheckCircle2, Loader2, Star, Send, BookOpen, Building, Users, HelpCircle, Lightbulb } from 'lucide-react';

const CATEGORY_META = {
  ACADEMIC: { label: 'Academic Experience', icon: BookOpen, color: '#38bdf8' },
  FACILITIES: { label: 'College Facilities', icon: Building, color: '#a855f7' },
  MENTORING: { label: 'Mentoring Experience', icon: Users, color: '#34d399' },
  GENERAL: { label: 'General Campus Life', icon: HelpCircle, color: '#94a3b8' },
  SUGGESTION: { label: 'Innovation / Suggestion', icon: Lightbulb, color: '#fbbf24' },
};

function StarSelector({ value, onChange, disabled }) {
  const [hovered, setHovered] = useState(0);
  const activeRating = hovered || value;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= activeRating;
          return (
            <button
              key={star}
              type="button"
              disabled={disabled}
              onClick={() => onChange(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              style={{
                background: isFilled ? 'rgba(251, 191, 36, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${isFilled ? 'rgba(251, 191, 36, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease',
                transform: star === hovered ? 'scale(1.08)' : 'scale(1)',
              }}
            >
              <Star
                size={18}
                color={isFilled ? '#fbbf24' : '#64748b'}
                fill={isFilled ? '#fbbf24' : 'transparent'}
              />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: isFilled ? '#fbbf24' : '#94a3b8' }}>
                {star}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function StudentFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [category, setCategory] = useState('ACADEMIC');
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState('');

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const loadFeedbacks = async () => {
    try {
      const res = await fetchApi('/api/feedback/');
      if (res.ok) {
        setFeedbacks(await res.json());
      } else {
        setErrorMsg('Failed to load feedback history.');
      }
    } catch {
      setErrorMsg('Network error while loading feedback.');
    } finally {
      setIsLoading(false);
    }
  };

  const showTemporarySuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comments.trim()) {
      setErrorMsg('Please enter your feedback comments before submitting.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const res = await fetchApi('/api/feedback/', {
        method: 'POST',
        body: JSON.stringify({ category, rating, comments })
      });
      if (res.ok) {
        setComments('');
        setRating(5);
        await loadFeedbacks();
        showTemporarySuccess('Your feedback was submitted successfully!');
      } else {
        setErrorMsg('Failed to submit feedback. Check your input.');
      }
    } catch {
      setErrorMsg('Network error while submitting feedback.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <span className="badge badge-student" style={{ marginBottom: '8px' }}>
          <MessageSquare size={13} /> Student Voice
        </span>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
          Submit Academic & Campus Feedback
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
          Share constructive feedback on your course pacing, lab infrastructure, or mentorship experience.
        </p>
      </div>

      {successMsg && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#34d399',
          borderRadius: 'var(--radius-md)',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#f87171',
          borderRadius: 'var(--radius-md)',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Submission Card */}
      <div className="glass-panel" style={{ padding: '28px', marginBottom: '36px' }}>
        <form onSubmit={handleSubmit}>
          {/* Category Selection */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Feedback Category
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '10px' }}>
              {Object.entries(CATEGORY_META).map(([key, meta]) => {
                const Icon = meta.icon;
                const isSelected = category === key;
                return (
                  <button
                    key={key}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setCategory(key)}
                    style={{
                      background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                      border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border-subtle)'}`,
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 0 14px -2px rgba(99, 102, 241, 0.3)' : 'none',
                    }}
                  >
                    <Icon size={18} color={isSelected ? '#818cf8' : 'var(--text-muted)'} />
                    <span style={{ fontSize: '0.825rem', fontWeight: isSelected ? 700 : 500, color: isSelected ? '#ffffff' : 'var(--text-muted)' }}>
                      {meta.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rating */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Experience Rating (1 to 5 Stars)
            </label>
            <StarSelector
              value={Number(rating)}
              onChange={setRating}
              disabled={isSubmitting}
            />
          </div>

          {/* Comments */}
          <div style={{ marginBottom: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Detailed Feedback & Comments
              </label>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                {comments.length} characters
              </span>
            </div>
            <textarea
              value={comments}
              onChange={e => setComments(e.target.value)}
              disabled={isSubmitting}
              rows="4"
              className="textarea-field"
              placeholder="Explain your thoughts clearly. What is going well? What could be improved?"
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ width: '100%', height: '46px' }}>
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="spin" />
                <span>Submitting Feedback...</span>
              </>
            ) : (
              <>
                <Send size={16} />
                <span>Submit Feedback</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* History */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <MessageSquare size={18} color="var(--primary-light)" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
            Your Feedback Submissions
          </h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            ({feedbacks.length} submitted)
          </span>
        </div>

        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          {isLoading ? (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Loader2 size={24} className="spin" style={{ margin: '0 auto 8px' }} />
              <div>Loading feedback history...</div>
            </div>
          ) : feedbacks.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-dim)' }}>
              No feedback entries submitted yet. Use the form above to share your thoughts.
            </div>
          ) : (
            <div className="table-wrapper">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{
                    borderBottom: '1px solid var(--border-medium)',
                    color: 'var(--text-muted)',
                    fontSize: '0.78rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    <th style={{ padding: '14px 20px' }}>Date</th>
                    <th style={{ padding: '14px 20px' }}>Category</th>
                    <th style={{ padding: '14px 20px' }}>Rating</th>
                    <th style={{ padding: '14px 20px' }}>Comments</th>
                  </tr>
                </thead>
                <tbody>
                  {feedbacks.map(f => {
                    const meta = CATEGORY_META[f.category] || { label: f.category, color: '#94a3b8' };
                    return (
                      <tr key={f.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.15s ease' }}>
                        <td style={{ padding: '16px 20px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          {new Date(f.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 10px',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: meta.color,
                            background: `${meta.color}18`,
                            border: `1px solid ${meta.color}35`,
                          }}>
                            {meta.label}
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#fbbf24', fontWeight: 700, fontSize: '0.9rem' }}>
                            <Star size={15} fill="#fbbf24" /> {f.rating}/5
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                          <div style={{ maxWidth: '480px', lineHeight: 1.45 }}>{f.comments}</div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
