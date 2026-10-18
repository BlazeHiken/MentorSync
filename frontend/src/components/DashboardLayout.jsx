import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export function DashboardLayout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />
      <main style={{ flex: 1, paddingBottom: '48px' }}>
        <Outlet />
      </main>
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '20px 24px',
        color: 'var(--text-muted)',
        fontSize: '0.825rem',
        background: '#ffffff',
      }}>
        <div style={{
          maxWidth: '1240px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <span>MentorSync Platform • Academic Mentorship & Student Support</span>
          <span style={{ color: 'var(--text-dim)' }}>Institutional Edition</span>
        </div>
      </footer>
    </div>
  );
}
