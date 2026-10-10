import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../api/client';
import { AlertCircle, Loader2, Star } from 'lucide-react';

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
      else setErrorMsg('Failed to load feedback.');
    } catch (e) { setErrorMsg('Network error.'); }
  };

  const loadSurveys = async () => {
    try {
      const res = await fetchApi('/api/surveys/');
      if (res.ok) setSurveys(await res.json());
      else setErrorMsg('Failed to load surveys.');
    } catch (e) { setErrorMsg('Network error.'); }
  };

  return (
    <div className="page-container">
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', margin: 0, marginBottom: '24px' }}>
        {isMentor ? 'Student Feedback & Surveys' : 'All Feedback & Surveys'}
      </h1>

      {errorMsg && (
        <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', borderRadius: '8px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} /> {errorMsg}
        </div>
      )}

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <button className={`btn ${activeTab === 'feedback' ? 'btn-primary' : ''}`} onClick={() => setActiveTab('feedback')} style={{ background: activeTab === 'feedback' ? '' : 'rgba(255,255,255,0.1)' }}>Feedback</button>
        <button className={`btn ${activeTab === 'survey' ? 'btn-primary' : ''}`} onClick={() => setActiveTab('survey')} style={{ background: activeTab === 'survey' ? '' : 'rgba(255,255,255,0.1)' }}>Satisfaction Surveys</button>
      </div>

      <div className="glass-panel" style={{ position: 'relative', minHeight: '200px' }}>
        {isLoading ? (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            <Loader2 size={24} className="spin" style={{ marginRight: '8px' }}/> Loading...
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '16px' }}>Date</th>
                <th style={{ padding: '16px' }}>Student</th>
                {activeTab === 'feedback' ? (
                  <>
                    <th style={{ padding: '16px' }}>Category</th>
                    <th style={{ padding: '16px' }}>Rating</th>
                  </>
                ) : (
                  <>
                    <th style={{ padding: '16px' }}>Satisfaction</th>
                    <th style={{ padding: '16px' }}>Helpfulness</th>
                  </>
                )}
                <th style={{ padding: '16px' }}>Comments</th>
              </tr>
            </thead>
            <tbody>
              {(activeTab === 'feedback' ? feedbacks : surveys).length === 0 && (
                <tr>
                  <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-dim)' }}>No records found.</td>
                </tr>
              )}
              {(activeTab === 'feedback' ? feedbacks : surveys).map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{new Date(item.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '16px', color: '#fff' }}>{item.student_details?.first_name || item.student_details?.username}</td>
                  
                  {activeTab === 'feedback' ? (
                    <>
                      <td style={{ padding: '16px', color: '#fff' }}>{item.category}</td>
                      <td style={{ padding: '16px', color: '#fbbf24' }}><Star size={14} style={{ display: 'inline' }} /> {item.rating}/5</td>
                    </>
                  ) : (
                    <>
                      <td style={{ padding: '16px', color: '#fbbf24' }}><Star size={14} style={{ display: 'inline' }} /> {item.mentor_satisfaction_rating}/5</td>
                      <td style={{ padding: '16px', color: '#fbbf24' }}><Star size={14} style={{ display: 'inline' }} /> {item.mentor_helpfulness_rating}/5</td>
                    </>
                  )}

                  <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{item.comments || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
