import React, { useState, useEffect, useCallback } from 'react';
import { fetchApi } from '../../api/client';
import {
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Star,
  Send,
  BookOpen,
  Building,
  Users,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';

const CATEGORY_META = {
  ACADEMIC: { label: 'Academic Experience', icon: BookOpen, color: '#0284c7', bg: '#f0f9ff', border: '#bae6fd' },
  FACILITIES: { label: 'College Facilities', icon: Building, color: '#6d28d9', bg: '#f5f3ff', border: '#ddd6fe' },
  MENTORING: { label: 'Mentoring Experience', icon: Users, color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
  GENERAL: { label: 'General Campus Life', icon: HelpCircle, color: '#475569', bg: '#f1f5f9', border: '#cbd5e1' },
  SUGGESTION: { label: 'Innovation / Suggestion', icon: Lightbulb, color: '#d97706', bg: '#fffbeb', border: '#fef08a' },
};

function StarSelector({ value, onChange, disabled }) {
  const [hovered, setHovered] = useState(0);
  const activeRating = hovered || value;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
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
                backgroundColor: isFilled ? '#fffbeb' : '#ffffff',
                border: `1.5px solid ${isFilled ? '#f59e0b' : 'var(--border-medium)'}`,
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all var(--transition-fast)',
                transform: star === hovered ? 'scale(1.05)' : 'scale(1)',
                boxShadow: isFilled ? '0 1px 3px rgba(245, 158, 11, 0.2)' : 'var(--shadow-xs)',
              }}
            >
              <Star
                size={18}
                color={isFilled ? '#d97706' : '#94a3b8'}
                fill={isFilled ? '#f59e0b' : 'transparent'}
              />
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: isFilled ? '#b45309' : '#64748b' }}>
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

  const loadFeedbacks = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchFeedbacks = async () => {
      try {
        const res = await fetchApi('/api/feedback/');
        if (!isMounted) return;
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setFeedbacks(data);
        } else {
          if (isMounted) setErrorMsg('Failed to load feedback history.');
        }
      } catch {
        if (isMounted) setErrorMsg('Network error while loading feedback.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchFeedbacks();
    return () => {
      isMounted = false;
    };
  }, []);

  const showTemporarySuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
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
        showTemporarySuccess('Your constructive feedback was submitted successfully!');
      } else {
        setErrorMsg('Failed to submit feedback. Please check your inputs.');
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
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--navy-primary)', margin: 0, letterSpacing: '-0.02em' }}>
          Submit Academic & Campus Feedback
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
          Share constructive feedback on your course pacing, lab infrastructure, or mentorship experience.
        </p>
      </div>

      {successMsg && (
        <div role="status" style={{ padding: '12px 16px', background: 'var(--accent-emerald-light)', border: '1px solid #a7f3d0', color: '#047857', borderRadius: 'var(--radius-md)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 500, fontSize: '0.9rem' }}>
          <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div role="alert" style={{ padding: '12px 16px', background: 'var(--accent-rose-light)', border: '1px solid #fecaca', color: 'var(--accent-rose)', borderRadius: 'var(--radius-md)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 500, fontSize: '0.9rem' }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Submission Card */}
      <div className="glass-panel" style={{ padding: '30px', marginBottom: '36px', backgroundColor: '#ffffff' }}>
        <form onSubmit={handleSubmit}>
          {/* Category Selection */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '10px' }}>
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
                      backgroundColor: isSelected ? meta.bg : '#ffffff',
                      border: `1.5px solid ${isSelected ? meta.color : 'var(--border-subtle)'}`,
                      padding: '14px 12px',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: '8px',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                      boxShadow: isSelected ? `0 2px 8px -1px ${meta.color}25` : 'var(--shadow-xs)',
                    }}
                  >
                    <Icon size={18} color={meta.color} />
                    <span style={{ fontSize: '0.825rem', fontWeight: isSelected ? 700 : 500, color: isSelected ? 'var(--navy-primary)' : 'var(--text-secondary)' }}>
                      {meta.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rating */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '10px' }}>
              Experience Rating (1 to 5 Stars)
            </label>
            <StarSelector
              value={Number(rating)}
              onChange={setRating}
              disabled={isSubmitting}
            />
          </div>

          {/* Comments */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Detailed Feedback & Observations
              </label>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {comments.length} characters
              </span>
            </div>
            <textarea
              value={comments}
              onChange={e => setComments(e.target.value)}
              disabled={isSubmitting}
              rows="4"
              className="textarea-field"
              placeholder="Explain your thoughts clearly. What is going well? What could be improved for your academic growth?"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ width: '100%', height: '46px', fontSize: '0.925rem' }}>
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
          <MessageSquare size={18} color="var(--primary)" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--navy-primary)', margin: 0, letterSpacing: '-0.01em' }}>
            Your Feedback Submissions
          </h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', backgroundColor: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: '999px', fontWeight: 600 }}>
            {feedbacks.length} submitted
          </span>
        </div>

        <div className="table-wrapper">
          {isLoading ? (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Loader2 size={24} className="spin" style={{ margin: '0 auto 8px', color: 'var(--primary)' }} />
              <div>Loading feedback history...</div>
            </div>
          ) : feedbacks.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No feedback entries submitted yet. Use the form above to share your thoughts.
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Rating</th>
                  <th>Comments</th>
                </tr>
              </thead>
              <tbody>
                {feedbacks.map(f => {
                  const meta = CATEGORY_META[f.category] || { label: f.category, color: '#475569', bg: '#f1f5f9', border: '#cbd5e1' };
                  return (
                    <tr key={f.id}>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                        {new Date(f.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '3px 9px',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: meta.color,
                          backgroundColor: meta.bg,
                          border: `1px solid ${meta.border}`,
                        }}>
                          {meta.label}
                        </span>
                      </td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#b45309', fontWeight: 700, fontSize: '0.875rem' }}>
                          <Star size={14} fill="#f59e0b" color="#d97706" /> {f.rating}/5
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        <div style={{ maxWidth: '520px', lineHeight: 1.5 }}>{f.comments}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
