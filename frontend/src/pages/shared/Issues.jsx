import React, { useCallback, useEffect, useState } from 'react';
import { AlertCircle, RefreshCw, Send } from 'lucide-react';
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
        loadIssues();
    }, [loadIssues]);

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
            const response = await fetchApi(`/ api / issues / ${issue.id}/`, {
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
            <div style={styles.header}>
                <div>
                    <span className="badge badge-student">Issue Tracking</span>
                    <h1 style={styles.title}>
                        {isStudent ? 'Report an Issue' : 'Manage Issues'}
                    </h1>
                    <p style={styles.subtitle}>
                        {isStudent
                            ? 'Submit a concern and track your mentor’s response.'
                            : 'Review reported concerns and record actions and responses.'}
                    </p>
                </div>

                <button className="btn btn-primary" onClick={loadIssues} disabled={loading}>
                    <RefreshCw size={16} /> Refresh
                </button>
            </div>

            {error && <div style={styles.error}>{error}</div>}
            {notice && <div style={styles.success}>{notice}</div>}

            {isStudent && (
                <form className="glass-panel" style={styles.panel} onSubmit={submitIssue}>
                    <h2 style={styles.heading}>New Issue</h2>

                    <label style={styles.label}>Issue title</label>
                    <input
                        required
                        maxLength={200}
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder="Briefly describe the concern"
                        style={styles.input}
                    />

                    <div style={styles.formGrid}>
                        <div>
                            <label style={styles.label}>Category</label>
                            <select
                                value={form.category}
                                onChange={(e) => setForm({ ...form, category: e.target.value })}
                                style={styles.input}
                            >
                                {CATEGORIES.map((value) => (
                                    <option key={value} value={value}>{label(value)}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={styles.label}>Priority</label>
                            <select
                                value={form.priority}
                                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                                style={styles.input}
                            >
                                {PRIORITIES.map((value) => (
                                    <option key={value} value={value}>{label(value)}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <label style={styles.label}>Description</label>
                    <textarea
                        required
                        rows={4}
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        placeholder="Provide enough detail for your mentor to understand the issue"
                        style={styles.input}
                    />

                    <button className="btn btn-primary" disabled={submitting} type="submit">
                        <Send size={16} />
                        {submitting ? 'Submitting…' : 'Submit Issue'}
                    </button>
                </form>
            )}

            <section style={{ marginTop: 24 }}>
                <h2 style={styles.heading}>
                    {isStudent ? 'My Reported Issues' : 'Reported Issues'}
                </h2>

                {loading ? (
                    <div className="glass-panel" style={styles.panel}>Loading issues…</div>
                ) : issues.length === 0 ? (
                    <div className="glass-panel" style={styles.empty}>
                        <AlertCircle size={30} />
                        <p>No issues found.</p>
                    </div>
                ) : (
                    <div style={styles.list}>
                        {issues.map((issue) => {
                            const edit = getEdit(issue);

                            return (
                                <article className="glass-panel" style={styles.panel} key={issue.id}>
                                    <div style={styles.issueHeader}>
                                        <div>
                                            <h3 style={styles.issueTitle}>{issue.title}</h3>
                                            <p style={styles.muted}>
                                                Issue #{issue.id}
                                                {issue.student_details?.username
                                                    ? ` · Student: ${issue.student_details.username}`
                                                    : ''}
                                                {' · '}{new Date(issue.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <span style={styles.status}>{label(issue.status)}</span>
                                    </div>

                                    <p style={styles.description}>{issue.description}</p>

                                    <div style={styles.tags}>
                                        <span style={styles.tag}>{label(issue.category)}</span>
                                        <span style={styles.tag}>Priority: {label(issue.priority)}</span>
                                    </div>

                                    {canManage ? (
                                        <div style={styles.management}>
                                            <label style={styles.label}>Status</label>
                                            <select
                                                value={edit.status}
                                                onChange={(e) => updateEdit(issue.id, 'status', e.target.value)}
                                                style={styles.input}
                                            >
                                                {STATUSES.map((value) => (
                                                    <option key={value} value={value}>{label(value)}</option>
                                                ))}
                                            </select>

                                            <label style={styles.label}>Action taken / planned</label>
                                            <textarea
                                                rows={2}
                                                value={edit.mentor_action}
                                                onChange={(e) => updateEdit(issue.id, 'mentor_action', e.target.value)}
                                                style={styles.input}
                                            />

                                            <label style={styles.label}>Response to student</label>
                                            <textarea
                                                rows={2}
                                                value={edit.mentor_response}
                                                onChange={(e) => updateEdit(issue.id, 'mentor_response', e.target.value)}
                                                style={styles.input}
                                            />

                                            <button
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
                                                <p style={styles.response}>
                                                    <strong>Mentor action:</strong> {issue.mentor_action}
                                                </p>
                                            )}
                                            {issue.mentor_response && (
                                                <p style={styles.response}>
                                                    <strong>Mentor response:</strong> {issue.mentor_response}
                                                </p>
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

const styles = {
    header: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        gap: 16, flexWrap: 'wrap', marginBottom: 24,
    },
    title: { color: '#fff', fontSize: '1.75rem', margin: '12px 0 4px' },
    subtitle: { color: 'var(--text-muted)', margin: 0 },
    panel: { padding: 24, marginBottom: 16 },
    heading: { color: '#fff', fontSize: '1.2rem', margin: '0 0 18px' },
    label: { display: 'block', color: 'var(--text-muted)', margin: '14px 0 7px', fontSize: '.88rem' },
    input: {
        width: '100%', padding: '11px 12px', borderRadius: 8,
        border: '1px solid var(--border-subtle)', background: 'rgba(15,23,42,.8)',
        color: '#fff', marginBottom: 8, boxSizing: 'border-box',
    },
    formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 },
    error: { whiteSpace: 'pre-wrap', padding: 12, borderRadius: 8, background: 'rgba(239,68,68,.12)', color: '#fca5a5', marginBottom: 16 },
    success: { padding: 12, borderRadius: 8, background: 'rgba(16,185,129,.12)', color: '#6ee7b7', marginBottom: 16 },
    empty: { padding: 32, textAlign: 'center', color: 'var(--text-muted)' },
    list: { display: 'grid', gap: 16 },
    issueHeader: { display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' },
    issueTitle: { color: '#fff', margin: 0, fontSize: '1.1rem' },
    muted: { color: 'var(--text-dim)', fontSize: '.8rem', margin: '6px 0' },
    status: { alignSelf: 'flex-start', borderRadius: 20, padding: '5px 10px', background: 'rgba(99,102,241,.15)', color: '#c7d2fe', fontSize: '.8rem' },
    description: { color: 'var(--text-muted)', whiteSpace: 'pre-wrap', lineHeight: 1.6 },
    tags: { display: 'flex', gap: 8, flexWrap: 'wrap' },
    tag: { border: '1px solid var(--border-subtle)', padding: '5px 9px', borderRadius: 8, color: 'var(--text-muted)', fontSize: '.78rem' },
    management: { borderTop: '1px solid var(--border-subtle)', marginTop: 18, paddingTop: 12 },
    response: { color: 'var(--text-muted)', whiteSpace: 'pre-wrap', lineHeight: 1.5 },
};
