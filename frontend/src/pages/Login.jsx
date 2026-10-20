import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Sparkles,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, getDashboardRoute } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (!username || !password) {
      setError('Please provide both username and password.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const user = await login(username, password);
      const destination = location.state?.from?.pathname || getDashboardRoute(user.role);
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (demoUser, demoPass) => {
    setUsername(demoUser);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        backgroundColor: 'var(--bg-primary)',
        backgroundImage: 'radial-gradient(#e2e8f0 1.2px, transparent 1.2px), linear-gradient(180deg, #f8fafc 0%, #edf2f7 100%)',
        backgroundSize: '24px 24px, 100% 100%',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
        }}
      >
        {/* Institutional Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '60px',
              height: '60px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, var(--navy-primary) 0%, var(--primary) 100%)',
              boxShadow: '0 8px 24px -4px rgba(15, 41, 74, 0.25)',
              marginBottom: '16px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <GraduationCap size={32} color="#ffffff" strokeWidth={2.2} />
          </div>
          <h1
            style={{
              fontSize: '1.875rem',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: 'var(--navy-primary)',
              margin: '0 0 6px',
            }}
          >
            MentorSync
          </h1>
          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: '0.9rem',
              fontWeight: 500,
              margin: 0,
            }}
          >
            Student Mentoring, Feedback & Support Platform
          </p>
        </div>

        {/* Elevated White Institutional Card */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.08), 0 2px 6px -1px rgba(15, 23, 42, 0.04)',
            padding: '36px 32px',
          }}
        >
          <div style={{ marginBottom: '24px' }}>
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                marginBottom: '4px',
                letterSpacing: '-0.01em',
              }}
            >
              Sign in to your account
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
              Enter institutional credentials to access your dashboard
            </p>
          </div>

          {error && (
            <div
              role="alert"
              style={{
                backgroundColor: 'var(--accent-rose-light)',
                border: '1px solid #fecaca',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                color: 'var(--accent-rose)',
                fontSize: '0.85rem',
                fontWeight: 500,
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label
                htmlFor="login-username"
                style={{
                  display: 'block',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  marginBottom: '7px',
                }}
              >
                Username / Email
              </label>
              <div style={{ position: 'relative' }}>
                <User
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-dim)',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  id="login-username"
                  type="text"
                  className="input-field"
                  style={{ paddingLeft: '42px', height: '44px' }}
                  placeholder="e.g. admin or mentor_priya"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="login-password"
                style={{
                  display: 'block',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  marginBottom: '7px',
                }}
              >
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-dim)',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="input-field"
                  style={{ paddingLeft: '42px', paddingRight: '44px', height: '44px' }}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    padding: '6px',
                    cursor: 'pointer',
                    color: showPassword ? 'var(--primary)' : 'var(--text-dim)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 'var(--radius-xs)',
                    transition: 'color var(--transition-fast)',
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
              style={{
                marginTop: '6px',
                width: '100%',
                height: '46px',
                fontSize: '0.925rem',
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Personas Divider */}
          <div
            style={{
              margin: '28px 0 16px',
              position: 'relative',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: 0,
                right: 0,
                height: '1px',
                backgroundColor: 'var(--border-subtle)',
              }}
            />
            <span
              style={{
                position: 'relative',
                backgroundColor: '#ffffff',
                padding: '0 12px',
                fontSize: '0.72rem',
                color: 'var(--text-dim)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: 600,
              }}
            >
              Quick Demo Personas
            </span>
          </div>

          {/* Persona Selection Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            <button
              type="button"
              onClick={() => handleQuickFill('admin', 'password123')}
              style={{
                padding: '12px 8px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: username === 'admin' ? 'var(--accent-indigo-light)' : '#ffffff',
                border: username === 'admin' ? '1.5px solid var(--accent-indigo)' : '1px solid var(--border-medium)',
                boxShadow: username === 'admin' ? '0 0 0 1px var(--accent-indigo)' : 'var(--shadow-xs)',
                color: username === 'admin' ? 'var(--accent-indigo)' : 'var(--text-secondary)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              <ShieldCheck size={18} color={username === 'admin' ? 'var(--accent-indigo)' : 'var(--text-muted)'} />
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Admin</span>
              <span style={{ fontSize: '0.675rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>admin</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('mentor_priya', 'password123')}
              style={{
                padding: '12px 8px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: username === 'mentor_priya' ? 'var(--accent-cyan-light)' : '#ffffff',
                border: username === 'mentor_priya' ? '1.5px solid var(--accent-cyan)' : '1px solid var(--border-medium)',
                boxShadow: username === 'mentor_priya' ? '0 0 0 1px var(--accent-cyan)' : 'var(--shadow-xs)',
                color: username === 'mentor_priya' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              <UserCheck size={18} color={username === 'mentor_priya' ? 'var(--accent-cyan)' : 'var(--text-muted)'} />
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Mentor</span>
              <span style={{ fontSize: '0.675rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>priya</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('student_aarav', 'password123')}
              style={{
                padding: '12px 8px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: username === 'student_aarav' ? 'var(--accent-emerald-light)' : '#ffffff',
                border: username === 'student_aarav' ? '1.5px solid var(--accent-emerald)' : '1px solid var(--border-medium)',
                boxShadow: username === 'student_aarav' ? '0 0 0 1px var(--accent-emerald)' : 'var(--shadow-xs)',
                color: username === 'student_aarav' ? 'var(--accent-emerald)' : 'var(--text-secondary)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              <Sparkles size={18} color={username === 'student_aarav' ? 'var(--accent-emerald)' : 'var(--text-muted)'} />
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Student</span>
              <span style={{ fontSize: '0.675rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>aarav</span>
            </button>
          </div>
        </div>

        {/* Institutional Footer */}
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: '0.8rem',
              margin: '0 0 4px',
              fontWeight: 500,
            }}
          >
            MentorSync v1.0 • Educational Mentor Management System
          </p>
          <p
            style={{
              color: 'var(--text-dim)',
              fontSize: '0.725rem',
              margin: 0,
            }}
          >
            Authorized Institutional Access Only • Protected by Role-Based Security
          </p>
        </div>
      </div>
    </div>
  );
}
