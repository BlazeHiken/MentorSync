import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  UserCheck, 
  AlertCircle, 
  MessageSquare, 
  Star, 
  Calendar,
  CheckCircle,
  HelpCircle,
  ArrowRight
} from 'lucide-react';

export function StudentDashboard() {
  const { user } = useAuth();

  return (
    <div className="page-container">
      {/* Student Welcome Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '28px',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="badge badge-student">Student Portal</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              Roll: {user?.roll_number || 'CS2026-042'} • {user?.department || 'Computer Science'}
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
            Welcome, {user?.first_name || user?.username}!
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Track your mentorship records, voice feedback, and resolve academic or campus concerns.
          </p>
        </div>
      </div>

      {/* Primary Mentor Card & Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Assigned Mentor Card */}
        <div className="glass-panel" style={{
          padding: '24px',
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))',
          border: '1px solid rgba(6, 182, 212, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, color: '#38bdf8' }}>
                Your Assigned Faculty Mentor
              </span>
              <span className="badge badge-mentor">Active</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '14px' }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 8px 18px rgba(6, 182, 212, 0.35)'
              }}>
                <UserCheck size={26} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                  Prof. Rahul Sharma
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                  Assistant Professor • Dept. of Computer Science
                </p>
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
              Division A Mentor • Office hours: Mon / Wed 2:00 PM – 4:00 PM
            </p>
          </div>
        </div>

        {/* Recent Session Summary */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, color: '#34d399' }}>
              Latest Mentoring Session
            </span>
            <Calendar size={16} color="#34d399" />
          </div>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#ffffff', marginBottom: '6px' }}>
            Mid-Semester Academic Progress & Project Review
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
            <strong>Action item:</strong> Prepare system architecture diagram and complete module test scenarios.
          </p>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            Conducted on: 21 September 2026
          </span>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="dashboard-grid">
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">Reported Issues</span>
            <AlertCircle size={20} color="#f87171" />
          </div>
          <div className="stat-value">2</div>
          <span style={{ fontSize: '0.8rem', color: '#34d399' }}>1 Resolved, 1 In Progress</span>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">Submitted Feedback</span>
            <MessageSquare size={20} color="#818cf8" />
          </div>
          <div className="stat-value">3</div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Across 2 categories</span>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">Satisfaction Survey</span>
            <Star size={20} color="#fbbf24" />
          </div>
          <div className="stat-value">Completed</div>
          <span style={{ fontSize: '0.8rem', color: '#fbbf24' }}>5/5 Rating Submitted</span>
        </div>
      </div>

      {/* Action shortcuts */}
      <div style={{ marginTop: '36px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px' }}>
          Quick Student Actions
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
                <MessageSquare size={20} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff', margin: 0 }}>Give Academic Feedback</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Share constructive thoughts on syllabus pacing, campus facilities, or lab infrastructure.
            </p>
            <span className="badge badge-student">Ready for Step 3</span>
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(251,191,36,0.15)', color: '#fbbf24' }}>
                <Star size={20} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff', margin: 0 }}>Mentor Satisfaction Survey</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Evaluate guidance accessibility, helpfulness, and mentor support quality.
            </p>
            <span className="badge badge-student">Ready for Step 3</span>
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(244,63,94,0.15)', color: '#f43f5e' }}>
                <AlertCircle size={20} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff', margin: 0 }}>Report an Issue</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Notify your mentor and campus authority about urgent concerns or administrative hurdles.
            </p>
            <span className="badge badge-student">Ready for Step 3</span>
          </div>
        </div>
      </div>
    </div>
  );
}
