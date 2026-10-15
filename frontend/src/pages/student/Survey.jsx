import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../api/client';
import { AlertCircle, CheckCircle2, Loader2, Star, Sparkles, MessageSquare, Send } from 'lucide-react';

const RATING_LABELS = {
  1: 'Needs Improvement',
  2: 'Fair',
  3: 'Satisfactory',
  4: 'Very Good',
  5: 'Excellent & Inspiring',
};

function StarSelector({ label, value, onChange, disabled }) {
  const [hovered, setHovered] = useState(0);
  const activeRating = hovered || value;

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          {label}
        </label>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fbbf24' }}>
          {RATING_LABELS[activeRating] || `${activeRating}/5`}
        </span>
      </div>
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
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease',
                transform: star === hovered ? 'scale(1.08)' : 'scale(1)',
              }}
              aria-label={`${star} star`}
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

export function StudentSurvey() {
  const [surveys, setSurveys] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [mentor_satisfaction_rating, setMentorSatisfactionRating] = useState(5);
  const [mentor_helpfulness_rating, setMentorHelpfulnessRating] = useState(5);
  const [comments, setComments] = useState('');

  useEffect(() => {
    loadSurveys();
  }, []);

  const loadSurveys = async () => {
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
  };

  const showTemporarySuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        showTemporarySuccess('Thank you! Your satisfaction survey was submitted successfully.');
      } else {
        setErrorMsg('Failed to submit survey. Check your input.');
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
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
          Mentor Satisfaction Survey
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
          Rate your faculty mentor guidance quality, responsiveness, and academic support.
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

      {/* Main Survey Card */}
      <div className="glass-panel" style={{ padding: '28px', marginBottom: '36px' }}>
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

          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                3. Additional Observations or Remarks
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
              placeholder="Share constructive observations on mentoring sessions, project reviews, or areas of improvement..."
            />
          </div>

          <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ width: '100%', height: '46px' }}>
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
          <MessageSquare size={18} color="var(--accent-cyan)" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
            Your Submission History
          </h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            ({surveys.length} recorded)
          </span>
        </div>

        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          {isLoading ? (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Loader2 size={24} className="spin" style={{ margin: '0 auto 8px' }} />
              <div>Loading survey records...</div>
            </div>
          ) : surveys.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-dim)' }}>
              No evaluations submitted yet. Complete the form above to record your first rating.
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
                    <th style={{ padding: '14px 20px' }}>Satisfaction</th>
                    <th style={{ padding: '14px 20px' }}>Helpfulness</th>
                    <th style={{ padding: '14px 20px' }}>Comments</th>
                  </tr>
                </thead>
                <tbody>
                  {surveys.map(s => (
                    <tr key={s.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.15s ease' }}>
                      <td style={{ padding: '16px 20px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {new Date(s.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#fbbf24', fontWeight: 700, fontSize: '0.9rem' }}>
                          <Star size={15} fill="#fbbf24" /> {s.mentor_satisfaction_rating}/5
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#fbbf24', fontWeight: 700, fontSize: '0.9rem' }}>
                          <Star size={15} fill="#fbbf24" /> {s.mentor_helpfulness_rating}/5
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        {s.comments ? (
                          <div style={{ maxWidth: '480px', lineHeight: 1.45 }}>{s.comments}</div>
                        ) : (
                          <span style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>No comments</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
