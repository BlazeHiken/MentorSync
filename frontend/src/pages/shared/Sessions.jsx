import React, { useCallback, useEffect, useState } from 'react';
import { CalendarDays, RefreshCw, Save } from 'lucide-react';
import { fetchApi } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

function getErrorMessage(data) {
    if (!data) return 'Something went wrong.';
    if (typeof data.detail === 'string') return data.detail;
    return Object.entries(data)
        .map(([key, value]) =>
            `${key}: ${Array.isArray(value) ? value.join(', ') : value} `
        )
        .join('\n') || 'Something went wrong.';
}

export function Sessions() {
    const { user } = useAuth();
    const isMentor = user?.role === 'MENTOR';
    const canCreate = isMentor;

    const [sessions, setSessions] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');

    const [form, setForm] = useState({
        student: '',
        date: new Date().toLocaleDateString('en-CA'),
        discussion: '',
        observation: '',
        action_follow_up: '',
    });

    const loadSessions = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            const response = await fetchApi('/api/sessions/');
            const data = await response.json();

            if (!response.ok) throw new Error(getErrorMessage(data));

            setSessions(Array.isArray(data) ? data : data.results || []);
        } catch (err) {
            setError(err.message || 'Unable to load sessions.');
        } finally {
            setLoading(false);
        }
    }, []);

    const loadStudents = useCallback(async () => {
        if (!canCreate) return;

        try {
            const response = await fetchApi('/api/assignments/');
            const data = await response.json();

            if (!response.ok) throw new Error(getErrorMessage(data));

            const assignments = Array.isArray(data) ? data : data.results || [];
            const assignedStudents = assignments
                .filter((assignment) => assignment.student_details)
                .map((assignment) => ({
                    id: assignment.student,
                    username: assignment.student_details.username,
                    first_name: assignment.student_details.first_name,
                    last_name: assignment.student_details.last_name,
                    division: assignment.division_details?.name,
                }));

            setStudents(assignedStudents);
            setForm((current) => ({
                ...current,
                student: current.student || String(assignedStudents[0]?.id || ''),
            }));
        } catch (err) {
            setError(err.message || 'Unable to load assigned students.');
        }
    }, [canCreate]);

    useEffect(() => {
        loadSessions();
        loadStudents();
    }, [loadSessions, loadStudents]);

    async function submitSession(event) {
        event.preventDefault();
        setSaving(true);
        setError('');
        setNotice('');

        try {
            const payload = {
                ...form,
                student: Number(form.student),
            };

            const response = await fetchApi('/api/sessions/', {
                method: 'POST',
                body: JSON.stringify(payload),
            });
            const data = await response.json();

            if (!response.ok) throw new Error(getErrorMessage(data));

            setForm((current) => ({
                ...current,
                discussion: '',
                observation: '',
                action_follow_up: '',
            }));
            setNotice('Mentoring session recorded successfully.');
            await loadSessions();
        } catch (err) {
            setError(err.message || 'Unable to record session.');
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="page-container">
            <div style={styles.header}>
                <div>
                    <span className="badge badge-mentor">Mentoring</span>
                    <h1 style={styles.title}>{canCreate ? 'Mentoring Sessions' : 'Session History'}</h1>
                    <p style={styles.subtitle}>
                        {canCreate
                            ? 'Record discussions, observations, and follow-up actions.'
                            : 'Review the mentoring sessions recorded for you.'}
                    </p>
                </div>

                <button className="btn btn-primary" onClick={loadSessions} disabled={loading}>
                    <RefreshCw size={16} /> Refresh
                </button>
            </div>

            {error && <div style={styles.error}>{error}</div>}
            {notice && <div style={styles.success}>{notice}</div>}

            {canCreate && (
                <form className="glass-panel" style={styles.panel} onSubmit={submitSession}>
                    <h2 style={styles.heading}>Record a Session</h2>

                    <label style={styles.label}>Student</label>
                    <select
                        required
                        value={form.student}
                        onChange={(e) => setForm({ ...form, student: e.target.value })}
                        style={styles.input}
                    >
                        <option value="">Select a student</option>
                        {students.map((student) => (
                            <option key={student.id} value={student.id}>
                                {student.first_name
                                    ? `${student.first_name} ${student.last_name || ''} `.trim()
                                    : student.username}
                                {student.division ? ` — ${student.division} ` : ''}
                            </option>
                        ))}
                    </select>

                    <label style={styles.label}>Session date</label>
                    <input
                        required
                        type="date"
                        value={form.date}
                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                        style={styles.input}
                    />

                    <label style={styles.label}>Discussion</label>
                    <textarea
                        required
                        rows={3}
                        value={form.discussion}
                        onChange={(e) => setForm({ ...form, discussion: e.target.value })}
                        style={styles.input}
                        placeholder="Topics discussed during the session"
                    />

                    <label style={styles.label}>Observations</label>
                    <textarea
                        rows={3}
                        value={form.observation}
                        onChange={(e) => setForm({ ...form, observation: e.target.value })}
                        style={styles.input}
                        placeholder="Academic progress, challenges, or other observations"
                    />

                    <label style={styles.label}>Action / Follow-up</label>
                    <textarea
                        rows={3}
                        value={form.action_follow_up}
                        onChange={(e) => setForm({ ...form, action_follow_up: e.target.value })}
                        style={styles.input}
                        placeholder="Next steps agreed upon"
                    />

                    <button className="btn btn-primary" type="submit" disabled={saving || !students.length}>
                        <Save size={16} />
                        {saving ? 'Saving…' : 'Save Session'}
                    </button>

                    {!students.length && (
                        <p style={styles.muted}>
                            No assigned students are available. Check the division assignments.
                        </p>
                    )}
                </form>
            )}

            <section style={{ marginTop: 24 }}>
                <h2 style={styles.heading}>
                    {canCreate ? 'Sessions You Conducted' : 'Your Mentoring Sessions'}
                </h2>

                {loading ? (
                    <div className="glass-panel" style={styles.panel}>Loading sessions…</div>
                ) : sessions.length === 0 ? (
                    <div className="glass-panel" style={styles.empty}>
                        <CalendarDays size={30} />
                        <p>No mentoring sessions recorded yet.</p>
                    </div>
                ) : (
                    <div style={styles.list}>
                        {sessions.map((session) => (
                            <article className="glass-panel" style={styles.panel} key={session.id}>
                                <div style={styles.sessionHeader}>
                                    <div>
                                        <h3 style={styles.sessionTitle}>
                                            {session.student_details?.first_name
                                                ? `${session.student_details.first_name} ${session.student_details.last_name || ''} `.trim()
                                                : session.student_details?.username || `Student #${session.student} `}
                                        </h3>
                                        <p style={styles.muted}>
                                            {new Date(`${session.date} T00:00:00`).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <CalendarDays size={20} color="#34d399" />
                                </div>

                                {session.mentor_details && (
                                    <p style={styles.muted}>
                                        Mentor: {session.mentor_details.first_name
                                            ? `${session.mentor_details.first_name} ${session.mentor_details.last_name || ''} `.trim()
                                            : session.mentor_details.username}
                                    </p>
                                )}

                                <h4 style={styles.subheading}>Discussion</h4>
                                <p style={styles.text}>{session.discussion}</p>

                                {session.observation && (
                                    <div style={{ marginTop: 14, padding: '12px 14px', borderRadius: 8, background: 'rgba(99,102,241,0.07)', borderLeft: '3px solid #818cf8' }}>
                                        <h4 style={{ color: '#c7d2fe', margin: '0 0 4px', fontSize: '.85rem', fontWeight: 700 }}>Observation</h4>
                                        <p style={{ color: 'var(--text-muted)', whiteSpace: 'pre-wrap', lineHeight: 1.55, margin: 0, fontSize: '.9rem' }}>{session.observation}</p>
                                    </div>
                                )}

                                {session.action_follow_up && (
                                    <div style={{ marginTop: 12, padding: '12px 14px', borderRadius: 8, background: 'rgba(16,185,129,0.08)', borderLeft: '3px solid #10b981' }}>
                                        <h4 style={{ color: '#6ee7b7', margin: '0 0 4px', fontSize: '.85rem', fontWeight: 700 }}>Action / Follow-up Plan</h4>
                                        <p style={{ color: 'var(--text-muted)', whiteSpace: 'pre-wrap', lineHeight: 1.55, margin: 0, fontSize: '.9rem' }}>{session.action_follow_up}</p>
                                    </div>
                                )}
                            </article>
                        ))}
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
    error: { whiteSpace: 'pre-wrap', padding: 12, borderRadius: 8, background: 'rgba(239,68,68,.12)', color: '#fca5a5', marginBottom: 16 },
    success: { padding: 12, borderRadius: 8, background: 'rgba(16,185,129,.12)', color: '#6ee7b7', marginBottom: 16 },
    empty: { padding: 32, textAlign: 'center', color: 'var(--text-muted)' },
    list: { display: 'grid', gap: 16 },
    sessionHeader: { display: 'flex', justifyContent: 'space-between', gap: 12 },
    sessionTitle: { color: '#fff', margin: 0, fontSize: '1.1rem' },
    muted: { color: 'var(--text-dim)', fontSize: '.82rem', margin: '6px 0' },
    subheading: { color: '#c7d2fe', margin: '18px 0 6px', fontSize: '.9rem' },
    text: { color: 'var(--text-muted)', whiteSpace: 'pre-wrap', lineHeight: 1.6, marginTop: 0 },
};
