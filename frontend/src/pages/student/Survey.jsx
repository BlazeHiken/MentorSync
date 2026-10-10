import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../api/client';
import { AlertCircle, CheckCircle2, Loader2, Star } from 'lucide-react';

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
    } catch (e) {
      setErrorMsg('Network error while loading surveys.');
    } finally {
      setIsLoading(false);
    }
  };

  const showTemporarySuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
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
        showTemporarySuccess('Survey submitted successfully!');
      } else {
        setErrorMsg('Failed to submit survey. Check your input.');
      }
    } catch (e) {
      setErrorMsg('Network error while submitting survey.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', margin: 0, marginBottom: '24px' }}>Mentor Satisfaction Survey</h1>
      
      {successMsg && (
        <div style={{ padding: '12px 16px', background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', borderRadius: '8px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} /> {successMsg}
        </div>
      )}
      {errorMsg && (
        <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', borderRadius: '8px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} /> {errorMsg}
        </div>
      )}

      <div className="glass-panel" style={{ padding: '24px', marginBottom: '32px' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>How satisfied are you with your mentor? (1-5)</label>
            <input type="number" min="1" max="5" value={mentor_satisfaction_rating} onChange={e => setMentorSatisfactionRating(e.target.value)} disabled={isSubmitting} style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#1e1e1e', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }} required />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>How helpful is your mentor? (1-5)</label>
            <input type="number" min="1" max="5" value={mentor_helpfulness_rating} onChange={e => setMentorHelpfulnessRating(e.target.value)} disabled={isSubmitting} style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#1e1e1e', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }} required />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Additional Comments</label>
            <textarea value={comments} onChange={e => setComments(e.target.value)} disabled={isSubmitting} rows="4" style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#1e1e1e', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Survey'}
          </button>
        </form>
      </div>

      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px' }}>My Survey History</h2>
      <div className="glass-panel" style={{ position: 'relative', minHeight: '150px' }}>
        {isLoading ? (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            <Loader2 size={24} className="spin" style={{ marginRight: '8px' }}/> Loading...
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '16px' }}>Date</th>
                <th style={{ padding: '16px' }}>Satisfaction</th>
                <th style={{ padding: '16px' }}>Helpfulness</th>
                <th style={{ padding: '16px' }}>Comments</th>
              </tr>
            </thead>
            <tbody>
              {surveys.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-dim)' }}>No surveys submitted yet.</td>
                </tr>
              )}
              {surveys.map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{new Date(s.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '16px', color: '#fbbf24' }}><Star size={14} style={{ display: 'inline' }} /> {s.mentor_satisfaction_rating}/5</td>
                  <td style={{ padding: '16px', color: '#fbbf24' }}><Star size={14} style={{ display: 'inline' }} /> {s.mentor_helpfulness_rating}/5</td>
                  <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{s.comments || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
