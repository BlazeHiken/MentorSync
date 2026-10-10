import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../api/client';
import { Layers, Plus, Edit, Users, UserPlus, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

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

  useEffect(() => {
    Promise.all([loadDivisions(), loadUsers()])
      .finally(() => setIsLoading(false));
  }, []);

  const loadDivisions = async () => {
    try {
      const res = await fetchApi('/api/divisions/');
      if (res.ok) {
        const data = await res.json();
        setDivisions(data);
      } else {
        setErrorMsg('Failed to load divisions.');
      }
    } catch (e) {
      setErrorMsg('Network error while loading divisions.');
    }
  };

  const loadUsers = async () => {
    try {
      const res = await fetchApi('/api/users/');
      if (res.ok) {
        const data = await res.json();
        setMentors(data.filter(u => u.role === 'MENTOR'));
        setStudents(data.filter(u => u.role === 'STUDENT'));
      } else {
        setErrorMsg('Failed to load users for assignment.');
      }
    } catch (e) {
      setErrorMsg('Network error while loading users.');
    }
  };

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
    } catch (e) {
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
        setSelectedMentor('');
        await loadDivisions();
        showTemporarySuccess('Mentor assigned successfully!');
      } else {
        setErrorMsg('Failed to assign mentor.');
      }
    } catch (e) {
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
      const res = await fetchApi('/api/assignments/bulk_assign/', {
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
        showTemporarySuccess('Students assigned successfully!');
      } else {
        setErrorMsg('Failed to assign students.');
      }
    } catch (e) {
      setErrorMsg('Network error while assigning students.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>Divisions & Assignments</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>Manage academic cohorts and mentor allocations.</p>
        </div>
        <button 
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
        <div style={{ padding: '12px 16px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#34d399', borderRadius: '8px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} />
          {successMsg}
        </div>
      )}

      {errorMsg && !showCreateModal && !showAssignMentorModal && !showAssignStudentsModal && (
        <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171', borderRadius: '8px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} />
          {errorMsg}
        </div>
      )}

      <div className="glass-panel" style={{ position: 'relative', minHeight: '200px' }}>
        {isLoading ? (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            <Loader2 size={24} className="spin" style={{ marginRight: '8px' }}/> Loading data...
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '16px' }}>Division Name</th>
                <th style={{ padding: '16px' }}>Assigned Mentor</th>
                <th style={{ padding: '16px' }}>Students</th>
                <th style={{ padding: '16px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {divisions.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-dim)' }}>
                    No divisions found. Create one to get started.
                  </td>
                </tr>
              )}
              {divisions.map(div => (
                <tr key={div.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '16px', color: '#fff', fontWeight: 500 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Layers size={18} color="#c084fc" />
                      {div.name}
                    </div>
                  </td>
                  <td style={{ padding: '16px', color: 'var(--text-muted)' }}>
                    {div.mentor_details ? `${div.mentor_details.first_name || div.mentor_details.username}` : <span style={{ color: '#f87171' }}>Unassigned</span>}
                  </td>
                  <td style={{ padding: '16px', color: 'var(--text-muted)' }}>
                    {div.student_count || 0} enrolled
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        className="btn" 
                        style={{ padding: '6px 12px', fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)' }}
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
                        className="btn" 
                        style={{ padding: '6px 12px', fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)' }}
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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '24px' }}>
            <h2 style={{ marginTop: 0, marginBottom: '16px', color: '#fff' }}>Create Division</h2>
            {errorMsg && (
              <div style={{ padding: '8px 12px', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', borderRadius: '6px', marginBottom: '16px', fontSize: '0.9rem' }}>
                {errorMsg}
              </div>
            )}
            <form onSubmit={handleCreateDivision}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Division Name</label>
                <input 
                  type="text" 
                  value={newDivisionName}
                  onChange={e => setNewDivisionName(e.target.value)}
                  disabled={isSubmitting}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  required
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn" disabled={isSubmitting} onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Mentor Modal */}
      {showAssignMentorModal && selectedDivision && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '24px' }}>
            <h2 style={{ marginTop: 0, marginBottom: '16px', color: '#fff' }}>Assign Mentor to {selectedDivision.name}</h2>
            {errorMsg && (
              <div style={{ padding: '8px 12px', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', borderRadius: '6px', marginBottom: '16px', fontSize: '0.9rem' }}>
                {errorMsg}
              </div>
            )}
            <form onSubmit={handleAssignMentor}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Select Mentor</label>
                <select 
                  value={selectedMentor}
                  onChange={e => setSelectedMentor(e.target.value)}
                  disabled={isSubmitting}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#1e1e1e', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                >
                  <option value="">-- Unassigned --</option>
                  {mentors.map(m => (
                    <option key={m.id} value={m.id}>{m.first_name || m.username}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn" disabled={isSubmitting} onClick={() => setShowAssignMentorModal(false)}>Cancel</button>
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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '24px' }}>
            <h2 style={{ marginTop: 0, marginBottom: '16px', color: '#fff' }}>Add Students to {selectedDivision.name}</h2>
            {errorMsg && (
              <div style={{ padding: '8px 12px', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', borderRadius: '6px', marginBottom: '16px', fontSize: '0.9rem' }}>
                {errorMsg}
              </div>
            )}
            <form onSubmit={handleAssignStudents}>
              <div style={{ marginBottom: '16px', maxHeight: '300px', overflowY: 'auto' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Select Students</label>
                {students.length === 0 ? <p style={{ color: 'var(--text-dim)' }}>No students available.</p> : (
                  students.map(s => (
                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <input 
                        type="checkbox" 
                        id={`student-${s.id}`}
                        checked={selectedStudents.includes(s.id)}
                        disabled={isSubmitting}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStudents([...selectedStudents, s.id]);
                          } else {
                            setSelectedStudents(selectedStudents.filter(id => id !== s.id));
                          }
                        }}
                      />
                      <label htmlFor={`student-${s.id}`} style={{ color: '#fff', cursor: 'pointer' }}>{s.first_name || s.username} ({s.profile?.roll_number || 'No Roll'})</label>
                    </div>
                  ))
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn" disabled={isSubmitting} onClick={() => setShowAssignStudentsModal(false)}>Cancel</button>
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
