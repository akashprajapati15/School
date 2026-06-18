import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Auth Pages
import Login from './pages/Login';
import RegisterStudent from './pages/RegisterStudent';
import RegisterTeacher from './pages/RegisterTeacher';

// General Dashboard Pages
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import Clubs from './pages/Clubs';
import ClubDetails from './pages/ClubDetails';

// Role-specific Pages
import MyClubs from './pages/MyClubs'; // Student
import AssignedClubs from './pages/AssignedClubs'; // Teacher
import Teachers from './pages/Teachers'; // Admin
import TeacherRequests from './pages/TeacherRequests'; // Admin
import Students from './pages/Students'; // Admin
import JoinRequests from './pages/JoinRequests'; // Admin
import Posts from './pages/Posts'; // Admin
import ActivityLogs from './pages/ActivityLogs'; // Admin

// Helper element to restrict routes to specific roles
const RoleRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-brand-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const App = () => {
  return (
    <Router>
      <Routes>
        {/* --- Public Auth Routes --- */}
        <Route
          path="/login"
          element={
            <AuthLayout>
              <Login />
            </AuthLayout>
          }
        />
        <Route
          path="/register/student"
          element={
            <AuthLayout>
              <RegisterStudent />
            </AuthLayout>
          }
        />
        <Route
          path="/register/teacher"
          element={
            <AuthLayout>
              <RegisterTeacher />
            </AuthLayout>
          }
        />

        {/* --- Private Protected Dashboard Routes --- */}
        <Route element={<DashboardLayout />}>
          {/* Default Redirect to Dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/notifications" element={<Notifications />} />
          
          {/* Clubs (All authenticated can view list and detail) */}
          <Route path="/clubs" element={<Clubs />} />
          <Route path="/clubs/:id" element={<ClubDetails />} />

          {/* Student Specific Routes */}
          <Route
            path="/my-clubs"
            element={
              <RoleRoute allowedRoles={['student']}>
                <MyClubs />
              </RoleRoute>
            }
          />

          {/* Teacher Specific Routes */}
          <Route
            path="/assigned-clubs"
            element={
              <RoleRoute allowedRoles={['teacher']}>
                <AssignedClubs />
              </RoleRoute>
            }
          />

          {/* Super Admin Specific Routes */}
          <Route
            path="/teachers"
            element={
              <RoleRoute allowedRoles={['super_admin']}>
                <Teachers />
              </RoleRoute>
            }
          />
          <Route
            path="/teacher-requests"
            element={
              <RoleRoute allowedRoles={['super_admin']}>
                <TeacherRequests />
              </RoleRoute>
            }
          />
          <Route
            path="/students"
            element={
              <RoleRoute allowedRoles={['super_admin']}>
                <Students />
              </RoleRoute>
            }
          />
          <Route
            path="/join-requests"
            element={
              <RoleRoute allowedRoles={['super_admin', 'teacher']}>
                <JoinRequests />
              </RoleRoute>
            }
          />
          <Route
            path="/posts"
            element={
              <RoleRoute allowedRoles={['super_admin']}>
                <Posts />
              </RoleRoute>
            }
          />
          <Route
            path="/activity-logs"
            element={
              <RoleRoute allowedRoles={['super_admin']}>
                <ActivityLogs />
              </RoleRoute>
            }
          />
        </Route>

        {/* Catch-all Redirect to Dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
