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

const roleColors = {
  ADMIN: '#c084fc',
  MENTOR: '#38bdf8',
  STUDENT: '#34d399',
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

  const inputStyle = {
    width: '100%',
    padding: '11px 12px',
    borderRadius: '8px',
    background: 'rgba(15, 23, 42, 0.72)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: '#fff',
    outline: 'none',
  };

  const fieldLabelStyle = {
    display: 'block',
    color: 'var(--text-muted)',
    fontSize: '0.82rem',
    fontWeight: 600,
    marginBottom: '7px',
  };

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
        <div>
          <span className="badge badge-admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '9px' }}>
            <ShieldCheck size={13} /> Administration
          </span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', margin: 0 }}>User Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '5px' }}>
            Create accounts and manage student, mentor, and admin profiles.
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={17} /> Add User
        </button>
      </div>

      {successMsg && (
        <div role="status" style={{ padding: '12px 16px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#34d399', borderRadius: '8px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} /> {successMsg}
        </div>
      )}
      {errorMsg && !activeUser && (
        <div role="alert" style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', borderRadius: '8px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} /> {errorMsg}
        </div>
      )}

      <div className="dashboard-grid" style={{ marginBottom: '22px' }}>
        {[
          { key: 'ALL', label: 'All users', color: '#a5b4fc' },
          { key: 'ADMIN', label: 'Admins', color: roleColors.ADMIN },
          { key: 'MENTOR', label: 'Mentors', color: roleColors.MENTOR },
          { key: 'STUDENT', label: 'Students', color: roleColors.STUDENT },
        ].map(card => (
          <button
            key={card.key}
            type="button"
            onClick={() => setRoleFilter(card.key)}
            className="stat-card"
            aria-pressed={roleFilter === card.key}
            style={{ textAlign: 'left', cursor: 'pointer', borderColor: roleFilter === card.key ? `${card.color}70` : undefined, boxShadow: roleFilter === card.key ? `0 0 0 1px ${card.color}30` : undefined }}
          >
            <span className="stat-label">{card.label}</span>
            <div className="stat-value" style={{ color: card.color }}>{counts[card.key]}</div>
          </button>
        ))}
      </div>

      <section className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UsersIcon size={18} color="#a5b4fc" />
            <h2 style={{ color: '#fff', fontSize: '1rem', margin: 0 }}>Directory</h2>
            <span style={{ color: 'var(--text-dim)', fontSize: '0.82rem' }}>{visibleUsers.length} shown</span>
          </div>
          <label style={{ position: 'relative', width: 'min(100%, 320px)' }}>
            <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              aria-label="Search users"
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Search name, roll no, or email"
              style={{ ...inputStyle, paddingLeft: '37px' }}
            />
          </label>
        </div>

        {isLoading ? (
          <div style={{ minHeight: '210px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            <Loader2 size={22} className="spin" style={{ marginRight: '9px' }} /> Loading users…
          </div>
        ) : errorMsg && !users.length ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#f87171' }}>{errorMsg}</div>
        ) : visibleUsers.length === 0 ? (
          <div style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--text-dim)' }}>
            {users.length ? 'No users match those filters.' : 'No user accounts found yet.'}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: '740px', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ padding: '13px 18px' }}>User</th>
                  <th style={{ padding: '13px 18px' }}>Role</th>
                  <th style={{ padding: '13px 18px' }}>Department</th>
                  <th style={{ padding: '13px 18px' }}>Contact</th>
                  <th style={{ padding: '13px 18px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleUsers.map(item => {
                  const fullName = `${item.first_name || ''} ${item.last_name || ''}`.trim();
                  const isCurrentUser = String(item.id) === String(currentUser?.id);
                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.055)' }}>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
                          <div style={{ width: '36px', height: '36px', flexShrink: 0, borderRadius: '11px', background: `${roleColors[item.role] || '#a5b4fc'}18`, border: `1px solid ${roleColors[item.role] || '#a5b4fc'}40`, display: 'grid', placeItems: 'center', color: roleColors[item.role] || '#a5b4fc', fontSize: '0.75rem', fontWeight: 800 }}>
                            {(fullName || item.username || 'U').slice(0, 2).toUpperCase()}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ color: '#f8fafc', fontWeight: 600 }}>{fullName || item.username}{isCurrentUser ? <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}> (you)</span> : null}</div>
                            <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>@{item.username}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 9px', borderRadius: '999px', color: roleColors[item.role], background: `${roleColors[item.role]}15`, border: `1px solid ${roleColors[item.role]}35`, fontSize: '0.75rem', fontWeight: 700 }}>
                          {roleLabels[item.role] || item.role}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', color: 'var(--text-muted)', fontSize: '0.87rem' }}>
                        <div>{item.profile?.department || '—'}</div>
                        {item.role === 'STUDENT' && item.profile?.roll_number ? <div style={{ color: 'var(--text-dim)', fontSize: '0.78rem', marginTop: '3px' }}>{item.profile.roll_number}</div> : null}
                        {item.role === 'MENTOR' && item.profile?.designation ? <div style={{ color: 'var(--text-dim)', fontSize: '0.78rem', marginTop: '3px' }}>{item.profile.designation}</div> : null}
                      </td>
                      <td style={{ padding: '14px 18px', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                        <div>{item.email || 'No email'}</div>
                        {item.profile?.phone ? <div style={{ color: 'var(--text-dim)', fontSize: '0.78rem', marginTop: '3px' }}>{item.profile.phone}</div> : null}
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '7px' }}>
                          <button className="btn" onClick={() => openEdit(item)} aria-label={`Edit ${item.username}`} title="Edit user" style={{ padding: '7px 9px', color: '#c7d2fe', background: 'rgba(99,102,241,0.12)' }}>
                            <UserRoundPen size={15} />
                          </button>
                          <button className="btn" onClick={() => handleDelete(item)} disabled={isCurrentUser} aria-label={`Delete ${item.username}`} title={isCurrentUser ? 'You cannot delete your active account' : 'Delete user'} style={{ padding: '7px 9px', color: isCurrentUser ? 'var(--text-dim)' : '#f87171', background: 'rgba(239,68,68,0.1)', opacity: isCurrentUser ? 0.5 : 1 }}>
                            <Trash2 size={15} />
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

      {isFormOpen ? (
        <div role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) closeForm(); }} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(2,6,23,0.76)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <section role="dialog" aria-modal="true" aria-labelledby="user-form-title" className="glass-panel" style={{ width: '100%', maxWidth: '720px', maxHeight: '92vh', overflowY: 'auto', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '22px' }}>
              <div>
                <h2 id="user-form-title" style={{ margin: 0, color: '#fff', fontSize: '1.25rem' }}>{activeUser ? `Edit ${activeUser.username}` : 'Create User'}</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '5px 0 0' }}>{activeUser ? 'Update account details and access role.' : 'Add an account for a student, mentor, or administrator.'}</p>
              </div>
              <button type="button" className="btn" onClick={closeForm} aria-label="Close user form" style={{ padding: '6px', color: 'var(--text-muted)' }}><X size={18} /></button>
            </div>

            {errorMsg && (
              <div role="alert" style={{ padding: '10px 12px', background: 'rgba(239,68,68,0.1)', color: '#f87171', borderRadius: '7px', marginBottom: '16px', display: 'flex', gap: '8px', fontSize: '0.85rem' }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} /> {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <label>
                  <span style={fieldLabelStyle}>Username{activeUser ? '' : ' *'}</span>
                  <input name="username" value={form.username} onChange={updateField} disabled={isSubmitting || Boolean(activeUser)} autoComplete="username" required={!activeUser} style={{ ...inputStyle, opacity: activeUser ? 0.65 : 1 }} />
                </label>
                <label>
                  <span style={fieldLabelStyle}>Role *</span>
                  <select name="role" value={form.role} onChange={updateField} disabled={isSubmitting} style={inputStyle}>
                    <option value="STUDENT">Student</option>
                    <option value="MENTOR">Mentor</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </label>
                <label>
                  <span style={fieldLabelStyle}>First name</span>
                  <input name="first_name" value={form.first_name} onChange={updateField} disabled={isSubmitting} autoComplete="given-name" style={inputStyle} />
                </label>
                <label>
                  <span style={fieldLabelStyle}>Last name</span>
                  <input name="last_name" value={form.last_name} onChange={updateField} disabled={isSubmitting} autoComplete="family-name" style={inputStyle} />
                </label>
                <label>
                  <span style={fieldLabelStyle}>Email</span>
                  <input name="email" type="email" value={form.email} onChange={updateField} disabled={isSubmitting} autoComplete="email" style={inputStyle} />
                </label>
                <label>
                  <span style={fieldLabelStyle}>Phone</span>
                  <input name="phone" value={form.phone} onChange={updateField} disabled={isSubmitting} autoComplete="tel" style={inputStyle} />
                </label>
                <label>
                  <span style={fieldLabelStyle}>Department</span>
                  <input name="department" value={form.department} onChange={updateField} disabled={isSubmitting} style={inputStyle} />
                </label>
                {form.role === 'STUDENT' && (
                  <label>
                    <span style={fieldLabelStyle}>Roll number</span>
                    <input name="roll_number" value={form.roll_number} onChange={updateField} disabled={isSubmitting} style={inputStyle} />
                  </label>
                )}
                {form.role === 'MENTOR' && (
                  <label>
                    <span style={fieldLabelStyle}>Designation</span>
                    <input name="designation" value={form.designation} onChange={updateField} disabled={isSubmitting} style={inputStyle} />
                  </label>
                )}
                {!activeUser && (
                  <label>
                    <span style={fieldLabelStyle}>Temporary password *</span>
                    <input name="password" type="password" value={form.password} onChange={updateField} disabled={isSubmitting} autoComplete="new-password" required minLength={8} style={inputStyle} />
                  </label>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button type="button" className="btn" onClick={closeForm} disabled={isSubmitting}>Cancel</button>
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
