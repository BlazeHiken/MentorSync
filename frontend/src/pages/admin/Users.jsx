import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserRoundPen,
  Users as UsersIcon,
  X,
} from 'lucide-react';
import { fetchApi } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const emptyForm = {
  username: '',
  password: '',
  email: '',
  first_name: '',
  last_name: '',
  role: 'STUDENT',
  phone: '',
  department: '',
  roll_number: '',
  designation: '',
};

const roleLabels = {
  ADMIN: 'Admin',
  MENTOR: 'Mentor',
  STUDENT: 'Student',
};

const roleStyles = {
  ADMIN: { color: '#4338ca', bg: 'var(--accent-indigo-light)', border: '#c7d2fe' },
  MENTOR: { color: '#0284c7', bg: 'var(--accent-cyan-light)', border: '#bae6fd' },
  STUDENT: { color: '#059669', bg: 'var(--accent-emerald-light)', border: '#a7f3d0' },
};

function getErrorMessage(data, fallback) {
  if (data?.detail) return data.detail;
  if (data && typeof data === 'object') {
    const firstError = Object.values(data).flat().find(value => typeof value === 'string');
    if (firstError) return firstError;
  }
  return fallback;
}

export function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [activeUser, setActiveUser] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    loadUsers();
  }, []);

  const counts = useMemo(() => ({
    ALL: users.length,
    ADMIN: users.filter(item => item.role === 'ADMIN').length,
    MENTOR: users.filter(item => item.role === 'MENTOR').length,
    STUDENT: users.filter(item => item.role === 'STUDENT').length,
  }), [users]);

  const visibleUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users.filter(item => {
      const matchesRole = roleFilter === 'ALL' || item.role === roleFilter;
      const fullName = `${item.first_name || ''} ${item.last_name || ''}`.trim();
      const rollNo = item.profile?.roll_number || '';
      const matchesSearch = !query || [item.username, item.email, fullName, rollNo]
        .some(value => value?.toLowerCase().includes(query));
      return matchesRole && matchesSearch;
    });
  }, [users, search, roleFilter]);

  async function loadUsers() {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const response = await fetchApi('/api/users/');
      const data = await response.json();
      if (!response.ok) throw new Error(getErrorMessage(data, 'Could not load users.'));
      setUsers(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      setErrorMsg(error.message || 'Network error while loading users.');
    } finally {
      setIsLoading(false);
    }
  }

  function openCreate() {
    setActiveUser(null);
    setForm(emptyForm);
    setIsFormOpen(true);
    setErrorMsg('');
    setSuccessMsg('');
  }

  function openEdit(item) {
    setActiveUser(item);
    setIsFormOpen(true);
    setForm({
      ...emptyForm,
      username: item.username || '',
      email: item.email || '',
      first_name: item.first_name || '',
      last_name: item.last_name || '',
      role: item.role || 'STUDENT',
      phone: item.profile?.phone || '',
      department: item.profile?.department || '',
      roll_number: item.profile?.roll_number || '',
      designation: item.profile?.designation || '',
    });
    setErrorMsg('');
    setSuccessMsg('');
  }

  function closeForm() {
    if (isSubmitting) return;
    setActiveUser(null);
    setIsFormOpen(false);
    setForm(emptyForm);
    setErrorMsg('');
  }

  function updateField(event) {
    setForm(previous => ({ ...previous, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    const payload = { ...form };
    if (activeUser) {
      delete payload.password;
      delete payload.username;
    }
    try {
      const response = await fetchApi(
        activeUser ? `/api/users/${activeUser.id}/` : '/api/users/',
        { method: activeUser ? 'PATCH' : 'POST', body: JSON.stringify(payload) },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(getErrorMessage(data, 'Could not save this user.'));
      setActiveUser(null);
      setIsFormOpen(false);
      setForm(emptyForm);
      setSuccessMsg(activeUser ? 'User details updated successfully.' : 'User created successfully.');
      await loadUsers();
    } catch (error) {
      setErrorMsg(error.message || 'Network error while saving user.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(item) {
    if (String(item.id) === String(currentUser?.id)) {
      setErrorMsg('You cannot delete the account you are currently using.');
      return;
    }
    const label = item.first_name ? `${item.first_name} ${item.last_name || ''}`.trim() : item.username;
    if (!window.confirm(`Delete ${label} (${roleLabels[item.role] || item.role})? This cannot be undone.`)) return;
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const response = await fetchApi(`/api/users/${item.id}/`, { method: 'DELETE' });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(getErrorMessage(data, 'Could not delete this user.'));
      }
      setSuccessMsg(`${label} was deleted.`);
      await loadUsers();
    } catch (error) {
      setErrorMsg(error.message || 'Network error while deleting user.');
    }
  }

  const fieldLabelStyle = {
    display: 'block',
    color: 'var(--text-secondary)',
    fontSize: '0.82rem',
    fontWeight: 600,
    marginBottom: '7px',
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
        <div>
          <span className="badge badge-admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '9px' }}>
            <ShieldCheck size={13} /> Administration
          </span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--navy-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            User Management
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '5px' }}>
            Create accounts and manage student, mentor, and admin profiles across campus.
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={17} /> Add User
        </button>
      </div>

      {successMsg && (
        <div role="status" style={{ padding: '12px 16px', background: 'var(--accent-emerald-light)', border: '1px solid #a7f3d0', color: '#047857', borderRadius: 'var(--radius-md)', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500, fontSize: '0.9rem' }}>
          <CheckCircle2 size={18} style={{ flexShrink: 0 }} /> {successMsg}
        </div>
      )}
      {errorMsg && !activeUser && (
        <div role="alert" style={{ padding: '12px 16px', background: 'var(--accent-rose-light)', border: '1px solid #fecaca', color: 'var(--accent-rose)', borderRadius: 'var(--radius-md)', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500, fontSize: '0.9rem' }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} /> {errorMsg}
        </div>
      )}

      {/* Role Filter KPI Cards */}
      <div className="dashboard-grid" style={{ marginBottom: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        {[
          { key: 'ALL', label: 'All Users', color: '#0f294a', highlight: 'var(--primary)' },
          { key: 'ADMIN', label: 'Admins', color: roleStyles.ADMIN.color, highlight: roleStyles.ADMIN.color },
          { key: 'MENTOR', label: 'Mentors', color: roleStyles.MENTOR.color, highlight: roleStyles.MENTOR.color },
          { key: 'STUDENT', label: 'Students', color: roleStyles.STUDENT.color, highlight: roleStyles.STUDENT.color },
        ].map(card => {
          const isSelected = roleFilter === card.key;
          return (
            <button
              key={card.key}
              type="button"
              onClick={() => setRoleFilter(card.key)}
              className="stat-card"
              aria-pressed={isSelected}
              style={{
                textAlign: 'left',
                cursor: 'pointer',
                borderColor: isSelected ? card.highlight : undefined,
                boxShadow: isSelected ? `0 0 0 2px ${card.highlight}25` : undefined,
                backgroundColor: isSelected ? '#ffffff' : '#ffffff',
              }}
            >
              <span className="stat-label">{card.label}</span>
              <div className="stat-value" style={{ color: card.color }}>{counts[card.key]}</div>
            </button>
          );
        })}
      </div>

      {/* Directory Table Panel */}
      <section className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap', backgroundColor: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UsersIcon size={18} color="var(--primary)" />
            <h2 style={{ color: 'var(--text-main)', fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Directory</h2>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', backgroundColor: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: '999px', fontWeight: 600 }}>
              {visibleUsers.length} shown
            </span>
          </div>
          <label style={{ position: 'relative', width: 'min(100%, 320px)' }}>
            <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              aria-label="Search users"
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Search name, roll no, or email"
              className="input-field"
              style={{ paddingLeft: '36px', height: '38px', fontSize: '0.875rem' }}
            />
          </label>
        </div>

        {isLoading ? (
          <div style={{ minHeight: '210px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            <Loader2 size={22} className="spin" style={{ marginRight: '9px', color: 'var(--primary)' }} /> Loading users…
          </div>
        ) : errorMsg && !users.length ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--accent-rose)' }}>{errorMsg}</div>
        ) : visibleUsers.length === 0 ? (
          <div style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            {users.length ? 'No users match those filters.' : 'No user accounts found yet.'}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Contact</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleUsers.map(item => {
                  const fullName = `${item.first_name || ''} ${item.last_name || ''}`.trim();
                  const isCurrentUser = String(item.id) === String(currentUser?.id);
                  const style = roleStyles[item.role] || roleStyles.STUDENT;

                  return (
                    <tr key={item.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '36px',
                            height: '36px',
                            flexShrink: 0,
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: style.bg,
                            border: `1px solid ${style.border}`,
                            display: 'grid',
                            placeItems: 'center',
                            color: style.color,
                            fontSize: '0.78rem',
                            fontWeight: 700,
                          }}>
                            {(fullName || item.username || 'U').slice(0, 2).toUpperCase()}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ color: 'var(--text-main)', fontWeight: 600 }}>
                              {fullName || item.username}
                              {isCurrentUser ? <span style={{ color: 'var(--text-dim)', fontWeight: 500, fontSize: '0.825rem' }}> (you)</span> : null}
                            </div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>@{item.username}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '3px 9px',
                          borderRadius: '999px',
                          color: style.color,
                          backgroundColor: style.bg,
                          border: `1px solid ${style.border}`,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}>
                          {roleLabels[item.role] || item.role}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        <div>{item.profile?.department || '—'}</div>
                        {item.role === 'STUDENT' && item.profile?.roll_number ? <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>Roll: {item.profile.roll_number}</div> : null}
                        {item.role === 'MENTOR' && item.profile?.designation ? <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '2px' }}>{item.profile.designation}</div> : null}
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        <div>{item.email || '—'}</div>
                        {item.profile?.phone ? <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '2px' }}>{item.profile.phone}</div> : null}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => openEdit(item)}
                            aria-label={`Edit ${item.username}`}
                            title="Edit user"
                            style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                          >
                            <UserRoundPen size={14} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger"
                            onClick={() => handleDelete(item)}
                            disabled={isCurrentUser}
                            aria-label={`Delete ${item.username}`}
                            title={isCurrentUser ? 'You cannot delete your active account' : 'Delete user'}
                            style={{ padding: '6px 10px', fontSize: '0.8rem', opacity: isCurrentUser ? 0.4 : 1 }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* User Create / Edit Modal Dialog */}
      {isFormOpen ? (
        <div className="modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) closeForm(); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="user-form-title" className="modal-card" style={{ maxWidth: '680px', maxHeight: '92vh', overflowY: 'auto', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '22px' }}>
              <div>
                <h2 id="user-form-title" style={{ margin: 0, color: 'var(--navy-primary)', fontSize: '1.25rem', fontWeight: 700 }}>
                  {activeUser ? `Edit ${activeUser.username}` : 'Create New User Account'}
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '4px 0 0' }}>
                  {activeUser ? 'Update account details and access role.' : 'Add an institutional profile for a student, mentor, or administrator.'}
                </p>
              </div>
              <button type="button" className="btn btn-secondary" onClick={closeForm} aria-label="Close user form" style={{ padding: '6px', borderRadius: 'var(--radius-sm)' }}>
                <X size={18} />
              </button>
            </div>

            {errorMsg && (
              <div role="alert" style={{ padding: '10px 14px', backgroundColor: 'var(--accent-rose-light)', border: '1px solid #fecaca', color: 'var(--accent-rose)', borderRadius: 'var(--radius-md)', marginBottom: '16px', display: 'flex', gap: '8px', fontSize: '0.85rem', fontWeight: 500 }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} /> {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <label>
                  <span style={fieldLabelStyle}>Username{activeUser ? '' : ' *'}</span>
                  <input name="username" value={form.username} onChange={updateField} disabled={isSubmitting || Boolean(activeUser)} autoComplete="username" required={!activeUser} className="input-field" style={{ opacity: activeUser ? 0.65 : 1 }} />
                </label>
                <label>
                  <span style={fieldLabelStyle}>Role *</span>
                  <select name="role" value={form.role} onChange={updateField} disabled={isSubmitting} className="select-field">
                    <option value="STUDENT">Student</option>
                    <option value="MENTOR">Mentor</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </label>
                <label>
                  <span style={fieldLabelStyle}>First name</span>
                  <input name="first_name" value={form.first_name} onChange={updateField} disabled={isSubmitting} autoComplete="given-name" className="input-field" />
                </label>
                <label>
                  <span style={fieldLabelStyle}>Last name</span>
                  <input name="last_name" value={form.last_name} onChange={updateField} disabled={isSubmitting} autoComplete="family-name" className="input-field" />
                </label>
                <label>
                  <span style={fieldLabelStyle}>Email</span>
                  <input name="email" type="email" value={form.email} onChange={updateField} disabled={isSubmitting} autoComplete="email" className="input-field" />
                </label>
                <label>
                  <span style={fieldLabelStyle}>Phone</span>
                  <input name="phone" value={form.phone} onChange={updateField} disabled={isSubmitting} autoComplete="tel" className="input-field" />
                </label>
                <label>
                  <span style={fieldLabelStyle}>Department</span>
                  <input name="department" value={form.department} onChange={updateField} disabled={isSubmitting} className="input-field" />
                </label>
                {form.role === 'STUDENT' && (
                  <label>
                    <span style={fieldLabelStyle}>Roll number</span>
                    <input name="roll_number" value={form.roll_number} onChange={updateField} disabled={isSubmitting} className="input-field" />
                  </label>
                )}
                {form.role === 'MENTOR' && (
                  <label>
                    <span style={fieldLabelStyle}>Designation</span>
                    <input name="designation" value={form.designation} onChange={updateField} disabled={isSubmitting} className="input-field" />
                  </label>
                )}
                {!activeUser && (
                  <label>
                    <span style={fieldLabelStyle}>Temporary password *</span>
                    <input name="password" type="password" value={form.password} onChange={updateField} disabled={isSubmitting} autoComplete="new-password" required minLength={8} className="input-field" />
                  </label>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '26px' }}>
                <button type="button" className="btn btn-secondary" onClick={closeForm} disabled={isSubmitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ minWidth: '132px' }}>
                  {isSubmitting ? <><Loader2 size={15} className="spin" style={{ marginRight: '6px' }} /> Saving…</> : activeUser ? 'Save changes' : 'Create account'}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </div>
  );
}
