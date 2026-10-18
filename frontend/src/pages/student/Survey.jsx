import React, { useState, useEffect, useCallback } from 'react';
import { fetchApi } from '../../api/client';
import { AlertCircle, CheckCircle2, Loader2, Star, Sparkles, MessageSquare, Send } from 'lucide-react';

const RATING_LABELS = {
  1: 'Needs Improvement',
  2: 'Fair Guidance',
  3: 'Satisfactory',
  4: 'Very Good Support',
  5: 'Exceptional & Inspiring',
};

function StarSelector({ label, value, onChange, disabled }) {
  const [hovered, setHovered] = useState(0);
  const activeRating = hovered || value;

  return (
    <div style={{ marginBottom: '22px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          {label}
        </label>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#b45309', backgroundColor: '#fffbeb', border: '1px solid #fef08a', padding: '2px 8px', borderRadius: 'var(--radius-xs)' }}>
          {RATING_LABELS[activeRating] || `${activeRating}/5`}
        </span>
      </div>
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
              aria-label={`${star} star`}
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

export function StudentSurvey() {
  const [surveys, setSurveys] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [mentor_satisfaction_rating, setMentorSatisfactionRating] = useState(5);
  const [mentor_helpfulness_rating, setMentorHelpfulnessRating] = useState(5);
  const [comments, setComments] = useState('');

  const loadSurveys = useCallback(async () => {
    try {
      const res = await fetchApi('/api/surveys/');
      if (res.ok) {
        setSurveys(await res.json());
      } else {
        setErrorMsg('Failed to load survey history.');
      }
    } catch {
      setErrorMsg('Network error while loading surveys.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchSurveys = async () => {
      try {
        const res = await fetchApi('/api/surveys/');
        if (!isMounted) return;
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setSurveys(data);
        } else {
          if (isMounted) setErrorMsg('Failed to load survey history.');
        }
      } catch {
        if (isMounted) setErrorMsg('Network error while loading surveys.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchSurveys();
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
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const res = await fetchApi('/api/surveys/', {
        method: 'POST',
        body: JSON.stringify({ mentor_satisfaction_rating, mentor_helpfulness_rating, comments })
      });
      if (res.ok) {
        setComments('');
        setMentorSatisfactionRating(5);
        setMentorHelpfulnessRating(5);
        await loadSurveys();
        showTemporarySuccess('Thank you! Your satisfaction evaluation was submitted successfully.');
      } else {
        setErrorMsg('Failed to submit survey. Please verify your inputs.');
      }
    } catch {
      setErrorMsg('Network error while submitting survey.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <span className="badge badge-student" style={{ marginBottom: '8px' }}>
          <Sparkles size={13} /> Mentorship Evaluation
        </span>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--navy-primary)', margin: 0, letterSpacing: '-0.02em' }}>
          Mentor Satisfaction Survey
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
          Rate your faculty mentor guidance quality, responsiveness, and academic support.
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

      {/* Main Survey Card */}
      <div className="glass-panel" style={{ padding: '30px', marginBottom: '36px', backgroundColor: '#ffffff' }}>
        <form onSubmit={handleSubmit}>
          <StarSelector
            label="1. How satisfied are you with your mentor's guidance?"
            value={Number(mentor_satisfaction_rating)}
            onChange={setMentorSatisfactionRating}
            disabled={isSubmitting}
          />

          <StarSelector
            label="2. How helpful and approachable is your mentor during office hours?"
            value={Number(mentor_helpfulness_rating)}
            onChange={setMentorHelpfulnessRating}
            disabled={isSubmitting}
          />

          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                3. Additional Observations or Remarks
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
              placeholder="Share constructive observations on mentoring sessions, project reviews, or areas of improvement..."
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ width: '100%', height: '46px', fontSize: '0.925rem' }}>
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="spin" />
                <span>Submitting Evaluation...</span>
              </>
            ) : (
              <>
                <Send size={16} />
                <span>Submit Satisfaction Survey</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Survey History */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <MessageSquare size={18} color="var(--primary)" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--navy-primary)', margin: 0, letterSpacing: '-0.01em' }}>
            Your Submission History
          </h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', backgroundColor: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: '999px', fontWeight: 600 }}>
            {surveys.length} recorded
          </span>
        </div>

        <div className="table-wrapper">
          {isLoading ? (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Loader2 size={24} className="spin" style={{ margin: '0 auto 8px', color: 'var(--primary)' }} />
              <div>Loading survey records...</div>
            </div>
          ) : surveys.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No evaluations submitted yet. Complete the form above to record your first rating.
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Satisfaction</th>
                  <th>Helpfulness</th>
                  <th>Comments</th>
                </tr>
              </thead>
              <tbody>
                {surveys.map(s => (
                  <tr key={s.id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                      {new Date(s.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#b45309', fontWeight: 700, fontSize: '0.875rem' }}>
                        <Star size={14} fill="#f59e0b" color="#d97706" /> {s.mentor_satisfaction_rating}/5
                      </span>
                    </td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#b45309', fontWeight: 700, fontSize: '0.875rem' }}>
                        <Star size={14} fill="#f59e0b" color="#d97706" /> {s.mentor_helpfulness_rating}/5
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {s.comments ? (
                        <div style={{ maxWidth: '480px', lineHeight: 1.5 }}>{s.comments}</div>
                      ) : (
                        <span style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>No comments recorded</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
