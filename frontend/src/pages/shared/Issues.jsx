import React, { useCallback, useEffect, useState } from 'react';
import { AlertCircle, RefreshCw, Send, CheckCircle2 } from 'lucide-react';
import { fetchApi } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const CATEGORIES = [
  'ACADEMIC',
  'FACILITIES',
  'MENTORING',
  'ADMINISTRATIVE',
  'OTHER',
];

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED'];

const label = (value) =>
  (value || '').replaceAll('_', ' ').toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

function getErrorMessage(data) {
  if (!data) return 'Something went wrong.';
  if (typeof data.detail === 'string') return data.detail;
  return Object.entries(data)
    .map(([key, value]) =>
      `${key}: ${Array.isArray(value) ? value.join(', ') : value} `
    )
    .join('\n') || 'Something went wrong.';
}

export function Issues() {
  const { user } = useAuth();
  const role = user?.role;
  const isStudent = role === 'STUDENT';
  const canManage = role === 'MENTOR' || role === 'ADMIN';

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [savingId, setSavingId] = useState(null);

  const [form, setForm] = useState({
    title: '',
    category: 'ACADEMIC',
    description: '',
    priority: 'MEDIUM',
  });

  const [edits, setEdits] = useState({});

  const loadIssues = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetchApi('/api/issues/');
      const data = await response.json();

      if (!response.ok) throw new Error(getErrorMessage(data));

      setIssues(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError(err.message || 'Unable to load issues.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchIssues = async () => {
      try {
        const response = await fetchApi('/api/issues/');
        const data = await response.json();
        if (!isMounted) return;

        if (!response.ok) throw new Error(getErrorMessage(data));

        if (isMounted) setIssues(Array.isArray(data) ? data : data.results || []);
      } catch (err) {
        if (isMounted) setError(err.message || 'Unable to load issues.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchIssues();
    return () => {
      isMounted = false;
    };
  }, []);

  async function submitIssue(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setNotice('');

    try {
      const response = await fetchApi('/api/issues/', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(getErrorMessage(data));

      setForm({
        title: '',
        category: 'ACADEMIC',
        description: '',
        priority: 'MEDIUM',
      });
      setNotice('Issue submitted successfully.');
      await loadIssues();
    } catch (err) {
      setError(err.message || 'Unable to submit issue.');
    } finally {
      setSubmitting(false);
    }
  }

  function getEdit(issue) {
    return edits[issue.id] || {
      status: issue.status,
      mentor_action: issue.mentor_action || '',
      mentor_response: issue.mentor_response || '',
    };
  }

  function updateEdit(issueId, field, value) {
    setEdits((current) => ({
      ...current,
      [issueId]: {
        ...current[issueId],
        [field]: value,
      },
    }));
  }

  async function saveIssue(issue) {
    const edit = getEdit(issue);
    setSavingId(issue.id);
    setError('');
    setNotice('');

    try {
      const response = await fetchApi(`/api/issues/${issue.id}/`, {
        method: 'PATCH',
        body: JSON.stringify(edit),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(getErrorMessage(data));

      setNotice(`Issue #${issue.id} updated successfully.`);
      setEdits((current) => {
        const next = { ...current };
        delete next[issue.id];
        return next;
      });
      await loadIssues();
    } catch (err) {
      setError(err.message || 'Unable to update issue.');
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
        <div>
          <span className={isStudent ? 'badge badge-student' : 'badge badge-mentor'} style={{ marginBottom: 8 }}>
            Issue Resolution
          </span>
          <h1 style={{ color: 'var(--navy-primary)', fontSize: '1.75rem', fontWeight: 800, margin: '8px 0 4px', letterSpacing: '-0.02em' }}>
            {isStudent ? 'Report an Issue' : 'Manage Issues & Grievances'}
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>
            {isStudent
              ? 'Submit an academic or campus concern and track resolution progress.'
              : 'Review reported concerns and record faculty actions and student responses.'}
          </p>
        </div>

        <button type="button" className="btn btn-secondary" onClick={loadIssues} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <RefreshCw size={15} className={loading ? 'spin' : ''} /> Refresh
        </button>
      </div>

      {error && (
        <div role="alert" style={{ whiteSpace: 'pre-wrap', padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--accent-rose-light)', border: '1px solid #fecaca', color: 'var(--accent-rose)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.9rem', fontWeight: 500 }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}
      {notice && (
        <div role="status" style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--accent-emerald-light)', border: '1px solid #a7f3d0', color: '#047857', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.9rem', fontWeight: 500 }}>
          <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
          <span>{notice}</span>
        </div>
      )}

      {isStudent && (
        <form className="glass-panel" style={{ padding: 28, marginBottom: 32, backgroundColor: '#ffffff' }} onSubmit={submitIssue}>
          <h2 style={{ color: 'var(--navy-primary)', fontSize: '1.2rem', fontWeight: 700, margin: '0 0 18px', letterSpacing: '-0.01em' }}>
            Submit a New Issue
          </h2>

          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, marginBottom: 7 }}>
              Issue Title *
            </label>
            <input
              required
              maxLength={200}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Briefly describe the concern"
              className="input-field"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 18 }}>
            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, marginBottom: 7 }}>
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="select-field"
              >
                {CATEGORIES.map((value) => (
                  <option key={value} value={value}>{label(value)}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, marginBottom: 7 }}>
                Priority Level
              </label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="select-field"
              >
                {PRIORITIES.map((value) => (
                  <option key={value} value={value}>{label(value)}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 22 }}>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, marginBottom: 7 }}>
              Detailed Description *
            </label>
            <textarea
              required
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Provide enough details for your mentor or department to address the issue effectively..."
              className="textarea-field"
            />
          </div>

          <button className="btn btn-primary" disabled={submitting} type="submit" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <Send size={16} />
            <span>{submitting ? 'Submitting…' : 'Submit Issue'}</span>
          </button>
        </form>
      )}

      {/* Reported Issues Feed */}
      <section style={{ marginTop: 24 }}>
        <h2 style={{ color: 'var(--navy-primary)', fontSize: '1.25rem', fontWeight: 700, margin: '0 0 18px', letterSpacing: '-0.01em' }}>
          {isStudent ? 'My Reported Issues' : 'All Reported Grievances'}
        </h2>

        {loading ? (
          <div className="glass-panel" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading issues…
          </div>
        ) : issues.length === 0 ? (
          <div className="glass-panel" style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
            <AlertCircle size={32} style={{ marginBottom: 12, color: 'var(--text-dim)' }} />
            <p style={{ margin: 0, fontWeight: 500 }}>No issues recorded in the system.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 18 }}>
            {issues.map((issue) => {
              const edit = getEdit(issue);

              return (
                <article className="glass-panel" style={{ padding: 26, backgroundColor: '#ffffff' }} key={issue.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
                    <div>
                      <h3 style={{ color: 'var(--navy-primary)', margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>
                        {issue.title}
                      </h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '.825rem', margin: '4px 0 0' }}>
                        Issue #{issue.id}
                        {issue.student_details?.username ? ` · Student: ${issue.student_details.username}` : ''}
                        {' · '}{new Date(issue.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`badge badge-${issue.status.toLowerCase().replace('_', '-')}`}>
                      {label(issue.status)}
                    </span>
                  </div>

                  <p style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: '0.9rem', marginBottom: 16 }}>
                    {issue.description}
                  </p>

                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: canManage ? 20 : 12 }}>
                    <span style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', padding: '3px 10px', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', fontSize: '.78rem', fontWeight: 600 }}>
                      {label(issue.category)}
                    </span>
                    <span className={`badge badge-${issue.priority.toLowerCase()}`}>
                      Priority: {label(issue.priority)}
                    </span>
                  </div>

                  {canManage ? (
                    <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 18, marginTop: 12 }}>
                      <h4 style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--navy-primary)', marginBottom: 12 }}>
                        Faculty Action & Response
                      </h4>
                      <div style={{ marginBottom: 14 }}>
                        <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.825rem', fontWeight: 600, marginBottom: 6 }}>
                          Resolution Status
                        </label>
                        <select
                          value={edit.status}
                          onChange={(e) => updateEdit(issue.id, 'status', e.target.value)}
                          className="select-field"
                          style={{ maxWidth: 220 }}
                        >
                          {STATUSES.map((value) => (
                            <option key={value} value={value}>{label(value)}</option>
                          ))}
                        </select>
                      </div>

                      <div style={{ marginBottom: 14 }}>
                        <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.825rem', fontWeight: 600, marginBottom: 6 }}>
                          Action Taken / Planned
                        </label>
                        <textarea
                          rows={2}
                          value={edit.mentor_action}
                          onChange={(e) => updateEdit(issue.id, 'mentor_action', e.target.value)}
                          className="textarea-field"
                          placeholder="Record steps taken with administration or faculty..."
                        />
                      </div>

                      <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.825rem', fontWeight: 600, marginBottom: 6 }}>
                          Response Remarks to Student
                        </label>
                        <textarea
                          rows={2}
                          value={edit.mentor_response}
                          onChange={(e) => updateEdit(issue.id, 'mentor_response', e.target.value)}
                          className="textarea-field"
                          placeholder="Provide clear status feedback for the student..."
                        />
                      </div>

                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => saveIssue(issue)}
                        disabled={savingId === issue.id}
                      >
                        {savingId === issue.id ? 'Saving…' : 'Save Update'}
                      </button>
                    </div>
                  ) : (
                    <>
                      {issue.mentor_action && (
                        <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '10px 14px', borderRadius: 'var(--radius-md)', marginBottom: 8, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          <strong style={{ color: 'var(--navy-primary)' }}>Mentor Action: </strong>
                          {issue.mentor_action}
                        </div>
                      )}
                      {issue.mentor_response && (
                        <div style={{ backgroundColor: 'var(--accent-teal-light)', border: '1px solid var(--accent-teal-border)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--accent-teal)' }}>
                          <strong style={{ color: '#0f766e' }}>Mentor Response: </strong>
                          {issue.mentor_response}
                        </div>
                      )}
                    </>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
