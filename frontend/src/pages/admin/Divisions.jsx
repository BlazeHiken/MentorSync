import React, { useState, useEffect, useCallback } from 'react';
import { fetchApi } from '../../api/client';
import { Layers, Plus, Edit, UserPlus, AlertCircle, CheckCircle2, Loader2, X, Users as UsersIcon } from 'lucide-react';

export function Divisions() {
  const [divisions, setDivisions] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [students, setStudents] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignMentorModal, setShowAssignMentorModal] = useState(false);
  const [showAssignStudentsModal, setShowAssignStudentsModal] = useState(false);

  const [newDivisionName, setNewDivisionName] = useState('');
  const [selectedDivision, setSelectedDivision] = useState(null);
  const [selectedMentor, setSelectedMentor] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);

  const loadDivisions = useCallback(async () => {
    try {
      const res = await fetchApi('/api/divisions/');
      if (res.ok) {
        const data = await res.json();
        setDivisions(data);
      } else {
        setErrorMsg('Failed to load divisions.');
      }
    } catch {
      setErrorMsg('Network error while loading divisions.');
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchInitialData = async () => {
      try {
        const [divRes, userRes] = await Promise.all([
          fetchApi('/api/divisions/'),
          fetchApi('/api/users/'),
        ]);
        if (!isMounted) return;

        if (divRes.ok) {
          const divData = await divRes.json();
          if (isMounted) setDivisions(divData);
        } else {
          if (isMounted) setErrorMsg('Failed to load divisions.');
        }

        if (userRes.ok) {
          const userData = await userRes.json();
          if (isMounted) {
            setMentors(userData.filter(u => u.role === 'MENTOR'));
            setStudents(userData.filter(u => u.role === 'STUDENT'));
          }
        } else {
          if (isMounted) setErrorMsg('Failed to load users for assignment.');
        }
      } catch {
        if (isMounted) setErrorMsg('Network error while loading data.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchInitialData();
    return () => {
      isMounted = false;
    };
  }, []);

  const showTemporarySuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleCreateDivision = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const res = await fetchApi('/api/divisions/', {
        method: 'POST',
        body: JSON.stringify({ name: newDivisionName })
      });
      if (res.ok) {
        setShowCreateModal(false);
        setNewDivisionName('');
        await loadDivisions();
        showTemporarySuccess('Division created successfully!');
      } else {
        const data = await res.json();
        setErrorMsg(data.name ? `Name: ${data.name[0]}` : 'Failed to create division.');
      }
    } catch {
      setErrorMsg('Network error while creating division.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignMentor = async (e) => {
    e.preventDefault();
    if (!selectedDivision) return;
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const res = await fetchApi(`/api/divisions/${selectedDivision.id}/`, {
        method: 'PATCH',
        body: JSON.stringify({ mentor: selectedMentor || null })
      });
      if (res.ok) {
        setShowAssignMentorModal(false);
        setSelectedDivision(null);
        await loadDivisions();
        showTemporarySuccess('Faculty mentor assigned successfully!');
      } else {
        setErrorMsg('Failed to assign mentor to division.');
      }
    } catch {
      setErrorMsg('Network error while assigning mentor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignStudents = async (e) => {
    e.preventDefault();
    if (!selectedDivision) return;
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const res = await fetchApi('/api/assignments/bulk/', {
        method: 'POST',
        body: JSON.stringify({
          division_id: selectedDivision.id,
          student_ids: selectedStudents
        })
      });
      if (res.ok) {
        setShowAssignStudentsModal(false);
        setSelectedDivision(null);
        setSelectedStudents([]);
        await loadDivisions();
        showTemporarySuccess('Students assigned to division successfully!');
      } else {
        setErrorMsg('Failed to assign students to division.');
      }
    } catch {
      setErrorMsg('Network error while assigning students.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
        <div>
          <span className="badge badge-admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '9px' }}>
            <Layers size={13} /> Administration
          </span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--navy-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            Divisions & Assignments
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Manage academic cohorts and mentor allocations across campus departments.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setErrorMsg('');
            setShowCreateModal(true);
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={18} /> New Division
        </button>
      </div>

      {successMsg && (
        <div role="status" style={{ padding: '12px 16px', background: 'var(--accent-emerald-light)', border: '1px solid #a7f3d0', color: '#047857', borderRadius: 'var(--radius-md)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500, fontSize: '0.9rem' }}>
          <CheckCircle2 size={18} style={{ flexShrink: 0 }} /> {successMsg}
        </div>
      )}

      {errorMsg && !showCreateModal && !showAssignMentorModal && !showAssignStudentsModal && (
        <div role="alert" style={{ padding: '12px 16px', background: 'var(--accent-rose-light)', border: '1px solid #fecaca', color: 'var(--accent-rose)', borderRadius: 'var(--radius-md)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500, fontSize: '0.9rem' }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} /> {errorMsg}
        </div>
      )}

      {/* Cohort Overview Card */}
      <div className="table-wrapper" style={{ minHeight: '200px' }}>
        {isLoading ? (
          <div style={{ minHeight: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            <Loader2 size={24} className="spin" style={{ marginRight: '8px', color: 'var(--primary)' }}/> Loading division data...
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Division Name</th>
                <th>Assigned Faculty Mentor</th>
                <th>Enrolled Students</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {divisions.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No divisions found. Create one to get started.
                  </td>
                </tr>
              )}
              {divisions.map(div => (
                <tr key={div.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--accent-teal-light)',
                          border: '1px solid var(--accent-teal-border)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--accent-teal)',
                          flexShrink: 0,
                        }}
                      >
                        <Layers size={18} />
                      </div>
                      <div>
                        <div style={{ color: 'var(--navy-primary)', fontWeight: 700, fontSize: '0.95rem' }}>
                          {div.name}
                        </div>
                        <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                          ID: #{div.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    {div.mentor_details ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="badge badge-mentor">
                          {div.mentor_details.first_name ? `Prof. ${div.mentor_details.first_name} ${div.mentor_details.last_name || ''}`.trim() : `Prof. ${div.mentor_details.username}`}
                        </span>
                      </div>
                    ) : (
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          padding: '3px 8px',
                          borderRadius: '9999px',
                          backgroundColor: 'var(--accent-rose-light)',
                          color: 'var(--accent-rose)',
                          border: '1px solid #fecaca',
                        }}
                      >
                        Unassigned
                      </span>
                    )}
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--bg-secondary)', padding: '3px 8px', borderRadius: 'var(--radius-xs)', fontSize: '0.8rem', fontWeight: 600 }}>
                      <UsersIcon size={13} color="var(--text-muted)" />
                      <span>{div.student_count || 0} enrolled</span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        onClick={() => {
                          setErrorMsg('');
                          setSelectedDivision(div);
                          setSelectedMentor(div.mentor || '');
                          setShowAssignMentorModal(true);
                        }}
                      >
                        <Edit size={14} style={{ display: 'inline', marginRight: '4px' }}/> Mentor
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        onClick={() => {
                          setErrorMsg('');
                          setSelectedDivision(div);
                          setShowAssignStudentsModal(true);
                        }}
                      >
                        <UserPlus size={14} style={{ display: 'inline', marginRight: '4px' }}/> Add Students
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Division Modal */}
      {showCreateModal && (
        <div className="modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) setShowCreateModal(false); }}>
          <div className="modal-card" style={{ maxWidth: '440px', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: 'var(--navy-primary)', fontSize: '1.25rem', fontWeight: 700 }}>Create Division</h2>
              <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)} style={{ padding: '6px' }}>
                <X size={18} />
              </button>
            </div>
            {errorMsg && (
              <div role="alert" style={{ padding: '10px 12px', backgroundColor: 'var(--accent-rose-light)', border: '1px solid #fecaca', color: 'var(--accent-rose)', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontSize: '0.85rem', fontWeight: 500 }}>
                {errorMsg}
              </div>
            )}
            <form onSubmit={handleCreateDivision}>
              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>
                  Division Name
                </label>
                <input
                  type="text"
                  value={newDivisionName}
                  onChange={e => setNewDivisionName(e.target.value)}
                  disabled={isSubmitting}
                  className="input-field"
                  placeholder="e.g. Division A, Division B"
                  required
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" disabled={isSubmitting} onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Division'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Mentor Modal */}
      {showAssignMentorModal && selectedDivision && (
        <div className="modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) setShowAssignMentorModal(false); }}>
          <div className="modal-card" style={{ maxWidth: '460px', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ margin: 0, color: 'var(--navy-primary)', fontSize: '1.2rem', fontWeight: 700 }}>
                  Assign Mentor
                </h2>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Cohort: {selectedDivision.name}
                </span>
              </div>
              <button type="button" className="btn btn-secondary" onClick={() => setShowAssignMentorModal(false)} style={{ padding: '6px' }}>
                <X size={18} />
              </button>
            </div>
            {errorMsg && (
              <div role="alert" style={{ padding: '10px 12px', backgroundColor: 'var(--accent-rose-light)', border: '1px solid #fecaca', color: 'var(--accent-rose)', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontSize: '0.85rem', fontWeight: 500 }}>
                {errorMsg}
              </div>
            )}
            <form onSubmit={handleAssignMentor}>
              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>
                  Select Faculty Mentor
                </label>
                <select
                  value={selectedMentor}
                  onChange={e => setSelectedMentor(e.target.value)}
                  disabled={isSubmitting}
                  className="select-field"
                >
                  <option value="">-- Unassigned --</option>
                  {mentors.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.first_name ? `Prof. ${m.first_name} ${m.last_name || ''}`.trim() : m.username} ({m.email || 'No email'})
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" disabled={isSubmitting} onClick={() => setShowAssignMentorModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Students Modal */}
      {showAssignStudentsModal && selectedDivision && (
        <div className="modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) setShowAssignStudentsModal(false); }}>
          <div className="modal-card" style={{ maxWidth: '520px', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h2 style={{ margin: 0, color: 'var(--navy-primary)', fontSize: '1.2rem', fontWeight: 700 }}>
                  Add Students to Division
                </h2>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Cohort: {selectedDivision.name}
                </span>
              </div>
              <button type="button" className="btn btn-secondary" onClick={() => setShowAssignStudentsModal(false)} style={{ padding: '6px' }}>
                <X size={18} />
              </button>
            </div>
            {errorMsg && (
              <div role="alert" style={{ padding: '10px 12px', backgroundColor: 'var(--accent-rose-light)', border: '1px solid #fecaca', color: 'var(--accent-rose)', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontSize: '0.85rem', fontWeight: 500 }}>
                {errorMsg}
              </div>
            )}
            <form onSubmit={handleAssignStudents}>
              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', marginBottom: '10px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>
                  Select Students ({selectedStudents.length} selected)
                </label>
                <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
                  {students.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No enrolled students available.</p>
                  ) : (
                    students.map(s => {
                      const isChecked = selectedStudents.includes(s.id);
                      return (
                        <label
                          key={s.id}
                          htmlFor={`student-${s.id}`}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '10px 14px',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: isChecked ? 'var(--accent-teal-light)' : '#ffffff',
                            border: `1px solid ${isChecked ? 'var(--accent-teal)' : 'var(--border-subtle)'}`,
                            cursor: 'pointer',
                            transition: 'all var(--transition-fast)',
                          }}
                        >
                          <input
                            type="checkbox"
                            id={`student-${s.id}`}
                            checked={isChecked}
                            disabled={isSubmitting}
                            style={{ accentColor: 'var(--primary)', width: '16px', height: '16px', cursor: 'pointer' }}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedStudents([...selectedStudents, s.id]);
                              } else {
                                setSelectedStudents(selectedStudents.filter(id => id !== s.id));
                              }
                            }}
                          />
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ color: 'var(--text-main)', fontSize: '0.875rem', fontWeight: 600 }}>
                              {s.first_name ? `${s.first_name} ${s.last_name || ''}`.trim() : s.username}
                            </div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                              Roll: {s.profile?.roll_number || 'N/A'} • {s.email || `@${s.username}`}
                            </div>
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" disabled={isSubmitting} onClick={() => setShowAssignStudentsModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Assigning...' : 'Assign Students'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
