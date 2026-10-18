import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  GraduationCap, 
  LogOut, 
  Users, 
  Layers, 
  MessageSquare, 
  AlertCircle, 
  Calendar, 
  Star, 
  LayoutDashboard 
} from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return <span className="badge badge-admin">Admin</span>;
      case 'MENTOR':
        return <span className="badge badge-mentor">Mentor</span>;
      case 'STUDENT':
        return <span className="badge badge-student">Student</span>;
      default:
        return null;
    }
  };

  const navLinks = {
    ADMIN: [
      { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/admin/users', label: 'Users', icon: Users },
      { to: '/admin/divisions', label: 'Divisions', icon: Layers },
      { to: '/admin/feedback', label: 'Feedback', icon: MessageSquare },
      { to: '/admin/issues', label: 'Issues', icon: AlertCircle },
      { to: '/admin/sessions', label: 'Sessions', icon: Calendar },
    ],
    MENTOR: [
      { to: '/mentor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/mentor/students', label: 'Students', icon: Users },
      { to: '/mentor/feedback', label: 'Feedback', icon: MessageSquare },
      { to: '/mentor/issues', label: 'Issues', icon: AlertCircle },
      { to: '/mentor/sessions', label: 'Sessions', icon: Calendar },
    ],
    STUDENT: [
      { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/student/feedback', label: 'Feedback', icon: MessageSquare },
      { to: '/student/survey', label: 'Survey', icon: Star },
      { to: '/student/issues', label: 'Issues', icon: AlertCircle },
      { to: '/student/sessions', label: 'Sessions', icon: Calendar },
    ],
  }[user.role] || [];

  const getInitials = (targetUser) => {
    if (targetUser.first_name && targetUser.last_name) {
      return `${targetUser.first_name[0]}${targetUser.last_name[0]}`.toUpperCase();
    }
    return (targetUser.username || 'U').slice(0, 2).toUpperCase();
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: '#0f294a',
      borderBottom: '1px solid #1e3a5f',
      boxShadow: '0 2px 8px rgba(7, 21, 38, 0.15)',
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 24px',
        minHeight: '68px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        {/* Brand & Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '28px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '9px',
              background: 'linear-gradient(135deg, #2563eb, #0284c7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.35)',
            }}>
              <GraduationCap size={22} color="#ffffff" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{
                fontWeight: 800,
                fontSize: '1.2rem',
                letterSpacing: '-0.02em',
                color: '#ffffff',
                lineHeight: 1.15,
              }}>
                MentorSync
              </span>
              <span style={{
                fontSize: '0.68rem',
                color: '#93c5fd',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                fontWeight: 600,
              }}>
                HigherEd Platform
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            overflowX: 'auto',
            padding: '4px 0',
          }}>
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '7px',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    transition: 'all 0.15s ease',
                    whiteSpace: 'nowrap',
                    color: isActive ? '#ffffff' : '#cbd5e1',
                    background: isActive ? 'rgba(255, 255, 255, 0.14)' : 'transparent',
                    border: isActive ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid transparent',
                  })}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Right side user info & logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '6px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.15)',
              border: '1.5px solid rgba(255, 255, 255, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: '#ffffff',
            }}>
              {getInitials(user)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#ffffff' }}>
                  {user.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user.username}
                </span>
                {getRoleBadge(user.role)}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                {user.department || user.email}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Log out"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              color: '#fca5a5',
              padding: '7px 12px',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8rem',
              fontWeight: 500,
              transition: 'all 0.15s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.18)';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.35)';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.16)';
              e.currentTarget.style.color = '#fca5a5';
            }}
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
