import React, { useCallback, useEffect, useState } from 'react';
import { CalendarDays, RefreshCw, Save, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
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

  const [form, setForm] = useState(() => ({
    student: '',
    date: new Date().toLocaleDateString('en-CA'),
    discussion: '',
    observation: '',
    action_follow_up: '',
  }));

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

  useEffect(() => {
    let isMounted = true;

    const fetchInitialData = async () => {
      try {
        const sessionPromise = fetchApi('/api/sessions/');
        const studentPromise = canCreate ? fetchApi('/api/assignments/') : Promise.resolve(null);

        const [sessionRes, studentRes] = await Promise.all([sessionPromise, studentPromise]);
        if (!isMounted) return;

        if (sessionRes) {
          const sessionData = await sessionRes.json();
          if (!sessionRes.ok) throw new Error(getErrorMessage(sessionData));
          if (isMounted) setSessions(Array.isArray(sessionData) ? sessionData : sessionData.results || []);
        }

        if (studentRes) {
          const studentData = await studentRes.json();
          if (!studentRes.ok) throw new Error(getErrorMessage(studentData));
          const assignments = Array.isArray(studentData) ? studentData : studentData.results || [];
          const assignedStudents = assignments
            .filter((assignment) => assignment.student_details)
            .map((assignment) => ({
              id: assignment.student,
              username: assignment.student_details.username,
              first_name: assignment.student_details.first_name,
              last_name: assignment.student_details.last_name,
              division: assignment.division_details?.name,
            }));

          if (isMounted) {
            setStudents(assignedStudents);
            setForm((current) => ({
              ...current,
              student: current.student || String(assignedStudents[0]?.id || ''),
            }));
          }
        }
      } catch (err) {
        if (isMounted) setError(err.message || 'Unable to load sessions.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchInitialData();
    return () => {
      isMounted = false;
    };
  }, [canCreate]);

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
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
        <div>
          <span className="badge badge-mentor" style={{ marginBottom: 8 }}>
            Mentoring Dialogue
          </span>
          <h1 style={{ color: 'var(--navy-primary)', fontSize: '1.75rem', fontWeight: 800, margin: '8px 0 4px', letterSpacing: '-0.02em' }}>
            {canCreate ? 'Mentoring Sessions' : 'Session History'}
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>
            {canCreate
              ? 'Record discussions, observations, and agreed follow-up actions with your mentees.'
              : 'Review one-on-one mentoring dialogues and development notes recorded for you.'}
          </p>
        </div>

        <button type="button" className="btn btn-secondary" onClick={loadSessions} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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

      {/* Record Session Form (Mentors) */}
      {canCreate && (
        <form className="glass-panel" style={{ padding: 28, marginBottom: 32, backgroundColor: '#ffffff' }} onSubmit={submitSession}>
          <h2 style={{ color: 'var(--navy-primary)', fontSize: '1.2rem', fontWeight: 700, margin: '0 0 18px', letterSpacing: '-0.01em' }}>
            Record Mentoring Interaction
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 18 }}>
            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, marginBottom: 7 }}>
                Student Mentee *
              </label>
              <select
                required
                value={form.student}
                onChange={(e) => setForm({ ...form, student: e.target.value })}
                className="select-field"
              >
                <option value="">Select an assigned mentee</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.first_name
                      ? `${student.first_name} ${student.last_name || ''}`.trim()
                      : student.username}
                    {student.division ? ` — ${student.division}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, marginBottom: 7 }}>
                Session Date *
              </label>
              <input
                required
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, marginBottom: 7 }}>
              Discussion Summary *
            </label>
            <textarea
              required
              rows={3}
              value={form.discussion}
              onChange={(e) => setForm({ ...form, discussion: e.target.value })}
              className="textarea-field"
              placeholder="Academic progress, attendance, career advice, or topics discussed..."
            />
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, marginBottom: 7 }}>
              Observations & Academic Insights
            </label>
            <textarea
              rows={3}
              value={form.observation}
              onChange={(e) => setForm({ ...form, observation: e.target.value })}
              className="textarea-field"
              placeholder="Mentor observations regarding strengths, hurdles, or behavior..."
            />
          </div>

          <div style={{ marginBottom: 22 }}>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, marginBottom: 7 }}>
              Agreed Action Items & Follow-up Plan
            </label>
            <textarea
              rows={3}
              value={form.action_follow_up}
              onChange={(e) => setForm({ ...form, action_follow_up: e.target.value })}
              className="textarea-field"
              placeholder="Next steps, deadlines, or support needed before the next session..."
            />
          </div>

          <button className="btn btn-primary" type="submit" disabled={saving || !students.length} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <Save size={16} />
            <span>{saving ? 'Saving…' : 'Save Mentoring Session'}</span>
          </button>

          {!students.length && (
            <p style={{ color: 'var(--accent-rose)', fontSize: '0.825rem', marginTop: 10 }}>
              No assigned students available in your cohorts. Check division allocations with administration.
            </p>
          )}
        </form>
      )}

      {/* Session History Feed */}
      <section style={{ marginTop: 24 }}>
        <h2 style={{ color: 'var(--navy-primary)', fontSize: '1.25rem', fontWeight: 700, margin: '0 0 18px', letterSpacing: '-0.01em' }}>
          {canCreate ? 'Conducted Mentoring Sessions' : 'Your Recorded Sessions'}
        </h2>

        {loading ? (
          <div className="glass-panel" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading mentoring sessions…
          </div>
        ) : sessions.length === 0 ? (
          <div className="glass-panel" style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
            <CalendarDays size={32} style={{ marginBottom: 12, color: 'var(--text-dim)' }} />
            <p style={{ margin: 0, fontWeight: 500 }}>No mentoring sessions recorded yet.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 18 }}>
            {sessions.map((session) => (
              <article className="glass-panel" style={{ padding: 26, backgroundColor: '#ffffff', borderLeft: '4px solid #059669' }} key={session.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
                  <div>
                    <h3 style={{ color: 'var(--navy-primary)', margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>
                      {session.student_details?.first_name
                        ? `${session.student_details.first_name} ${session.student_details.last_name || ''}`.trim()
                        : session.student_details?.username || `Student #${session.student}`}
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '.825rem', margin: '4px 0 0' }}>
                      Session Date: {new Date(`${session.date}T00:00:00`).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', padding: '4px 10px', borderRadius: 'var(--radius-sm)', color: '#047857', fontSize: '0.8rem', fontWeight: 600 }}>
                    <CalendarDays size={14} />
                    <span>Logged</span>
                  </div>
                </div>

                {session.mentor_details && (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '.85rem', margin: '0 0 14px' }}>
                    <strong>Mentor: </strong>
                    {session.mentor_details.first_name
                      ? `Prof. ${session.mentor_details.first_name} ${session.mentor_details.last_name || ''}`.trim()
                      : `Prof. ${session.mentor_details.username}`}
                  </p>
                )}

                <div style={{ marginBottom: 14 }}>
                  <h4 style={{ color: 'var(--navy-primary)', margin: '0 0 6px', fontSize: '.9rem', fontWeight: 700 }}>
                    Discussion
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', lineHeight: 1.55, margin: 0, fontSize: '.9rem' }}>
                    {session.discussion}
                  </p>
                </div>

                {session.observation && (
                  <div style={{ marginTop: 12, padding: '12px 16px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)', borderLeft: '3px solid var(--primary)' }}>
                    <h4 style={{ color: 'var(--navy-primary)', margin: '0 0 4px', fontSize: '.85rem', fontWeight: 700 }}>
                      Observations
                    </h4>
                    <p style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', lineHeight: 1.55, margin: 0, fontSize: '.875rem' }}>
                      {session.observation}
                    </p>
                  </div>
                )}

                {session.action_follow_up && (
                  <div style={{ marginTop: 12, padding: '12px 16px', borderRadius: 'var(--radius-md)', backgroundColor: '#fffbeb', borderLeft: '3px solid #f59e0b', border: '1px solid #fef08a' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <Clock size={14} color="#b45309" />
                      <h4 style={{ color: '#b45309', margin: 0, fontSize: '.85rem', fontWeight: 700 }}>
                        Action Items / Follow-up Plan
                      </h4>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', lineHeight: 1.55, margin: 0, fontSize: '.875rem' }}>
                      {session.action_follow_up}
                    </p>
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
