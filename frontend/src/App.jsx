
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './components/DashboardLayout';
import { MentorDashboard } from './pages/mentor/MentorDashboard';
import { MentorStudents } from './pages/mentor/Students';
import { Login } from './pages/Login';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { Users } from './pages/admin/Users';
import { Divisions } from './pages/admin/Divisions';

import { StudentFeedback } from './pages/student/Feedback';
import { StudentSurvey } from './pages/student/Survey';
import { StudentDashboard } from './pages/student/StudentDashboard';

import { FeedbackView } from './pages/shared/FeedbackView';
import { Issues } from './pages/shared/Issues';
import { Sessions } from './pages/shared/Sessions';

function HomeRedirect() {
  const { user, loading, getDashboardRoute } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          color: 'var(--text-muted)',
        }}
      >
        Loading MentorSync...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getDashboardRoute(user.role)} replace />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<HomeRedirect />} />

          {/* Protected routes */}
          <Route element={<DashboardLayout />}>

            {/* Admin routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <Users />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/divisions"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <Divisions />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/feedback"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <FeedbackView isMentor={false} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/issues"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <Issues />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/sessions"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <Sessions />
                </ProtectedRoute>
              }
            />

            {/* Mentor routes */}
            <Route
              path="/mentor/dashboard"
              element={
                <ProtectedRoute allowedRoles={['MENTOR']}>
                  <MentorDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/mentor/students"
              element={
                <ProtectedRoute allowedRoles={['MENTOR']}>
                  <MentorStudents />
                </ProtectedRoute>
              }
            />

            <Route
              path="/mentor/feedback"
              element={
                <ProtectedRoute allowedRoles={['MENTOR']}>
                  <FeedbackView isMentor={true} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/mentor/issues"
              element={
                <ProtectedRoute allowedRoles={['MENTOR']}>
                  <Issues />
                </ProtectedRoute>
              }
            />

            <Route
              path="/mentor/sessions"
              element={
                <ProtectedRoute allowedRoles={['MENTOR']}>
                  <Sessions />
                </ProtectedRoute>
              }
            />

            {/* Student routes */}
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/student/feedback"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <StudentFeedback />
                </ProtectedRoute>
              }
            />

            <Route
              path="/student/survey"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <StudentSurvey />
                </ProtectedRoute>
              }
            />

            <Route
              path="/student/issues"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <Issues />
                </ProtectedRoute>
              }
            />

            <Route
              path="/student/sessions"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <Sessions />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
