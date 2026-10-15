import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, BookOpen, GraduationCap, Loader2, Search, Users } from 'lucide-react';
import { fetchApi } from '../../api/client';

export function MentorStudents() {
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [search, setSearch] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('ALL');

  useEffect(() => {
    let active = true;
    async function loadAssignments() {
      setIsLoading(true);
      setErrorMsg('');
      try {
        const response = await fetchApi('/api/assignments/');
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.detail || 'Could not load your assigned students.');
        }
        if (active) setAssignments(Array.isArray(data) ? data : data.results || []);
      } catch (error) {
        if (active) setErrorMsg(error.message || 'Network error while loading students.');
      } finally {
        if (active) setIsLoading(false);
      }
    }
    loadAssignments();
    return () => { active = false; };
  }, []);

  const divisions = useMemo(() => (
    [...new Map(assignments.map(item => [item.division, item.division_details?.name || 'Division'])).entries()]
      .map(([id, name]) => ({ id: String(id), name }))
      .sort((a, b) => a.name.localeCompare(b.name))
  ), [assignments]);

  const visibleAssignments = useMemo(() => {
    const query = search.trim().toLowerCase();
    return assignments.filter(item => {
      const student = item.student_details || {};
      const profile = student.profile || {};
      const fullName = `${student.first_name || ''} ${student.last_name || ''}`.trim();
      const matchesDivision = divisionFilter === 'ALL' || String(item.division) === divisionFilter;
      const matchesSearch = !query || [
        fullName,
        student.username,
        student.email,
        profile.roll_number,
        item.division_details?.name,
      ].some(value => value?.toLowerCase().includes(query));
      return matchesDivision && matchesSearch;
    });
  }, [assignments, search, divisionFilter]);

  return (
    <div className="page-container">
      <div style={{ marginBottom: '24px' }}>
        <span className="badge badge-mentor" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '9px' }}>
          <BookOpen size={13} /> Mentor Workspace
        </span>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', margin: 0 }}>My Students</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '5px' }}>
          Students assigned to your mentoring divisions.
        </p>
      </div>

      {errorMsg && (
        <div role="alert" style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', borderRadius: '8px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} /> {errorMsg}
        </div>
      )}

      <div className="dashboard-grid" style={{ marginBottom: '22px' }}>
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">Assigned students</span>
            <Users size={18} color="#38bdf8" />
          </div>
          <div className="stat-value">{isLoading ? '—' : assignments.length}</div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Across your divisions</span>
        </div>
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">Assigned divisions</span>
            <GraduationCap size={18} color="#c084fc" />
          </div>
          <div className="stat-value">{isLoading ? '—' : divisions.length}</div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Active mentoring groups</span>
        </div>
      </div>

      <section className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ color: '#fff', fontSize: '1rem', margin: 0 }}>Student directory</h2>
            <span style={{ color: 'var(--text-dim)', fontSize: '0.82rem' }}>{visibleAssignments.length} shown</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <label style={{ position: 'relative', width: 'min(100%, 300px)' }}>
              <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                aria-label="Search students"
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="Search name, roll number, email"
                style={{ width: '100%', padding: '10px 12px 10px 37px', borderRadius: '8px', background: 'rgba(15,23,42,0.72)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff' }}
              />
            </label>
            <select
              aria-label="Filter by division"
              value={divisionFilter}
              onChange={event => setDivisionFilter(event.target.value)}
              style={{ padding: '10px 12px', borderRadius: '8px', background: '#172033', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', minWidth: '155px' }}
            >
              <option value="ALL">All divisions</option>
              {divisions.map(division => <option key={division.id} value={division.id}>{division.name}</option>)}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div style={{ minHeight: '210px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            <Loader2 size={22} className="spin" style={{ marginRight: '9px' }} /> Loading your students…
          </div>
        ) : !errorMsg && visibleAssignments.length === 0 ? (
          <div style={{ padding: '42px 24px', textAlign: 'center', color: 'var(--text-dim)' }}>
            <Users size={28} style={{ marginBottom: '10px', opacity: 0.65 }} />
            <div style={{ color: '#e2e8f0', fontWeight: 600, marginBottom: '5px' }}>
              {assignments.length ? 'No students match your search.' : 'No students assigned yet.'}
            </div>
            {!assignments.length && <div style={{ fontSize: '0.85rem' }}>Ask an administrator to assign students to one of your divisions.</div>}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: '650px', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ padding: '13px 18px' }}>Student</th>
                  <th style={{ padding: '13px 18px' }}>Division</th>
                  <th style={{ padding: '13px 18px' }}>Department</th>
                  <th style={{ padding: '13px 18px' }}>Contact</th>
                </tr>
              </thead>
              <tbody>
                {visibleAssignments.map(item => {
                  const student = item.student_details || {};
                  const profile = student.profile || {};
                  const fullName = `${student.first_name || ''} ${student.last_name || ''}`.trim();
                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.055)' }}>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '10px',
                            background: 'rgba(56, 189, 248, 0.12)',
                            border: '1px solid rgba(56, 189, 248, 0.25)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#38bdf8',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            flexShrink: 0
                          }}>
                            {(fullName || student.username || 'S').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ color: '#f8fafc', fontWeight: 600 }}>{fullName || student.username || 'Student'}</div>
                            <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginTop: '2px' }}>
                              {profile.roll_number || 'No roll number'}{student.username ? ` · @${student.username}` : ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '3px 8px',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: '#c084fc',
                          background: 'rgba(168, 85, 247, 0.12)',
                          border: '1px solid rgba(168, 85, 247, 0.25)'
                        }}>
                          {item.division_details?.name || '—'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', color: 'var(--text-muted)', fontSize: '0.87rem' }}>{profile.department || '—'}</td>
                      <td style={{ padding: '14px 18px', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                        <div>{student.email || 'No email'}</div>
                        {profile.phone ? <div style={{ color: 'var(--text-dim)', fontSize: '0.78rem', marginTop: '3px' }}>{profile.phone}</div> : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
