import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../api/client';
import { MessageSquare, AlertCircle, CheckCircle2, Loader2, Star } from 'lucide-react';

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
    } catch (e) {
      setErrorMsg('Network error while loading feedback.');
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
      const res = await fetchApi('/api/feedback/', {
        method: 'POST',
        body: JSON.stringify({ category, rating, comments })
      });
      if (res.ok) {
        setComments('');
        setRating(5);
        await loadFeedbacks();
        showTemporarySuccess('Feedback submitted successfully!');
      } else {
        setErrorMsg('Failed to submit feedback. Check your input.');
      }
    } catch (e) {
      setErrorMsg('Network error while submitting feedback.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', margin: 0, marginBottom: '24px' }}>Submit Feedback</h1>
      
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
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} disabled={isSubmitting} style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#1e1e1e', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>
              <option value="ACADEMIC">Academic Experience</option>
              <option value="FACILITIES">College Facilities</option>
              <option value="MENTORING">Mentoring Experience</option>
              <option value="GENERAL">General</option>
              <option value="SUGGESTION">Suggestion</option>
            </select>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Rating (1-5)</label>
            <input type="number" min="1" max="5" value={rating} onChange={e => setRating(e.target.value)} disabled={isSubmitting} style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#1e1e1e', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }} required />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Comments</label>
            <textarea value={comments} onChange={e => setComments(e.target.value)} disabled={isSubmitting} rows="4" style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#1e1e1e', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }} required />
          </div>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      </div>

      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px' }}>My Feedback History</h2>
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
                <th style={{ padding: '16px' }}>Category</th>
                <th style={{ padding: '16px' }}>Rating</th>
                <th style={{ padding: '16px' }}>Comments</th>
              </tr>
            </thead>
            <tbody>
              {feedbacks.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-dim)' }}>No feedback submitted yet.</td>
                </tr>
              )}
              {feedbacks.map(f => (
                <tr key={f.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{new Date(f.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '16px', color: '#fff' }}>{f.category}</td>
                  <td style={{ padding: '16px', color: '#fbbf24' }}><Star size={14} style={{ display: 'inline' }} /> {f.rating}/5</td>
                  <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{f.comments}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
