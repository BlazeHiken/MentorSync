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
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <span className="badge badge-mentor" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '9px' }}>
          <BookOpen size={13} /> Mentor Workspace
        </span>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--navy-primary)', margin: 0, letterSpacing: '-0.02em' }}>
          My Students
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
          Enrolled student mentees assigned to your academic mentoring divisions.
        </p>
      </div>

      {errorMsg && (
        <div role="alert" style={{ padding: '12px 16px', background: 'var(--accent-rose-light)', border: '1px solid #fecaca', color: 'var(--accent-rose)', borderRadius: 'var(--radius-md)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500, fontSize: '0.9rem' }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} /> {errorMsg}
        </div>
      )}

      {/* KPI Cards */}
      <div className="dashboard-grid" style={{ marginBottom: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">Assigned Mentees</span>
            <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--accent-cyan-light)', border: '1px solid #bae6fd', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
              <Users size={18} />
            </div>
          </div>
          <div className="stat-value" style={{ color: 'var(--navy-primary)' }}>
            {isLoading ? '—' : assignments.length}
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Across your cohorts</span>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">Assigned Divisions</span>
            <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--accent-teal-light)', border: '1px solid var(--accent-teal-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-teal)' }}>
              <GraduationCap size={18} />
            </div>
          </div>
          <div className="stat-value" style={{ color: 'var(--navy-primary)' }}>
            {isLoading ? '—' : divisions.length}
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Active mentoring groups</span>
        </div>
      </div>

      {/* Student Directory Table Panel */}
      <section className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap', backgroundColor: '#ffffff' }}>
          <div>
            <h2 style={{ color: 'var(--navy-primary)', fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
              Student Directory
            </h2>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              {visibleAssignments.length} shown
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <label style={{ position: 'relative', width: 'min(100%, 280px)' }}>
              <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                aria-label="Search students"
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="Search name, roll number, email"
                className="input-field"
                style={{ paddingLeft: '36px', height: '38px', fontSize: '0.875rem' }}
              />
            </label>
            <select
              aria-label="Filter by division"
              value={divisionFilter}
              onChange={event => setDivisionFilter(event.target.value)}
              className="select-field"
              style={{ height: '38px', minWidth: '155px', fontSize: '0.875rem' }}
            >
              <option value="ALL">All divisions</option>
              {divisions.map(division => <option key={division.id} value={division.id}>{division.name}</option>)}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div style={{ minHeight: '210px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            <Loader2 size={22} className="spin" style={{ marginRight: '9px', color: 'var(--primary)' }} /> Loading your students…
          </div>
        ) : !errorMsg && visibleAssignments.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Users size={32} style={{ marginBottom: '12px', color: 'var(--text-dim)', opacity: 0.7 }} />
            <div style={{ color: 'var(--navy-primary)', fontWeight: 600, fontSize: '1rem', marginBottom: '6px' }}>
              {assignments.length ? 'No students match your search.' : 'No students assigned yet.'}
            </div>
            {!assignments.length && (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Ask a campus administrator to assign students to one of your division cohorts.
              </div>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Division</th>
                  <th>Department</th>
                  <th>Contact</th>
                </tr>
              </thead>
              <tbody>
                {visibleAssignments.map(item => {
                  const student = item.student_details || {};
                  const profile = student.profile || {};
                  const fullName = `${student.first_name || ''} ${student.last_name || ''}`.trim();
                  return (
                    <tr key={item.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'var(--accent-cyan-light)',
                            border: '1px solid #bae6fd',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#0284c7',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            flexShrink: 0
                          }}>
                            {(fullName || student.username || 'S').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ color: 'var(--text-main)', fontWeight: 600 }}>
                              {fullName || student.username || 'Student'}
                            </div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                              {profile.roll_number || 'No roll number'}{student.username ? ` · @${student.username}` : ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '3px 9px',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: '#0d9488',
                          backgroundColor: 'var(--accent-teal-light)',
                          border: '1px solid var(--accent-teal-border)'
                        }}>
                          {item.division_details?.name || '—'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        {profile.department || '—'}
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        <div>{student.email || 'No email on file'}</div>
                        {profile.phone ? (
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '2px' }}>
                            {profile.phone}
                          </div>
                        ) : null}
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
