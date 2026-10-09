import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export function DashboardLayout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1, paddingBottom: '48px' }}>
        <Outlet />
      </main>
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '20px 24px',
        textAlign: 'center',
        color: 'var(--text-dim)',
        fontSize: '0.8rem',
        background: 'rgba(15, 23, 42, 0.4)',
      }}>
        MentorSync Platform • Educational Mentoring & Student Support
      </footer>
    </div>
  );
}
