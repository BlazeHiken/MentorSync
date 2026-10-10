import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './components/DashboardLayout';
import { Login } from './pages/Login';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { Divisions } from './pages/admin/Divisions';
import { StudentFeedback } from './pages/student/Feedback';
import { StudentSurvey } from './pages/student/Survey';
import { FeedbackView } from './pages/shared/FeedbackView';
import { MentorDashboard } from './pages/mentor/MentorDashboard';
import { StudentDashboard } from './pages/student/StudentDashboard';

function HomeRedirect() {
  const { user, loading, getDashboardRoute } = useAuth();
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text-muted)' }}>
        Loading MentorSync...
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={getDashboardRoute(user.role)} replace />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<HomeRedirect />} />
          
          <Route element={<DashboardLayout />}>
            <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/divisions" element={<ProtectedRoute allowedRoles={['ADMIN']}><Divisions /></ProtectedRoute>} />
            <Route path="/admin/feedback" element={<ProtectedRoute allowedRoles={['ADMIN']}><FeedbackView isMentor={false} /></ProtectedRoute>} />
            
            <Route path="/mentor/dashboard" element={<ProtectedRoute allowedRoles={['MENTOR']}><MentorDashboard /></ProtectedRoute>} />
            <Route path="/mentor/feedback" element={<ProtectedRoute allowedRoles={['MENTOR']}><FeedbackView isMentor={true} /></ProtectedRoute>} />
            
            <Route path="/student/dashboard" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentDashboard /></ProtectedRoute>} />
            <Route path="/student/feedback" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentFeedback /></ProtectedRoute>} />
            <Route path="/student/survey" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentSurvey /></ProtectedRoute>} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
