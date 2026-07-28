import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/hooks/useTheme';
import { ToastProvider } from '@/hooks/useToast';
import { AuthProvider } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { LandingPage } from '@/pages/LandingPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { RoleHome } from '@/pages/RoleHome';
import { LoginPage, SignupPage } from '@/pages/auth/AuthPages';
import { ForgotPasswordPage, ResetPasswordPage } from '@/pages/auth/PasswordPages';
import { CreateComplaintPage } from '@/pages/citizen/CreateComplaintPage';
import { ComplaintsListPage } from '@/pages/complaints/ComplaintsListPage';
import { ComplaintDetailPage } from '@/pages/complaints/ComplaintDetailPage';
import { AnalyticsPage } from '@/pages/admin/AnalyticsPage';
import { ManageUsersPage } from '@/pages/admin/ManageUsersPage';
import { DepartmentsPage, WorkersPage } from '@/pages/admin/DepartmentsPage';
import { WorkerTasksPage } from '@/pages/worker/WorkerTasksPage';
import { TaskExecutionPage } from '@/pages/worker/TaskExecutionPage';
import { MapViewPage } from '@/pages/MapViewPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { SettingsPage } from '@/pages/SettingsPage';

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />

              {/* Auth */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* App (protected) */}
              <Route
                path="/app"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<RoleHome />} />

                {/* Citizen */}
                <Route path="complaints/new" element={<ProtectedRoute roles={['citizen']}><CreateComplaintPage /></ProtectedRoute>} />

                {/* Shared complaints */}
                <Route path="complaints" element={<ProtectedRoute><ComplaintsListPage /></ProtectedRoute>} />
                <Route path="complaints/:id" element={<ProtectedRoute><ComplaintDetailPage /></ProtectedRoute>} />

                {/* Officer: department dashboard */}
                <Route path="departments" element={<ProtectedRoute roles={['admin', 'officer']}><DepartmentsPage /></ProtectedRoute>} />

                {/* Worker */}
                <Route path="tasks" element={<ProtectedRoute roles={['worker']}><WorkerTasksPage /></ProtectedRoute>} />
                <Route path="tasks/:id" element={<ProtectedRoute roles={['worker']}><TaskExecutionPage /></ProtectedRoute>} />
                <Route path="completion" element={<ProtectedRoute roles={['worker']}><WorkerTasksPage /></ProtectedRoute>} />

                {/* Admin / officer */}
                <Route path="analytics" element={<ProtectedRoute roles={['admin', 'officer']}><AnalyticsPage /></ProtectedRoute>} />
                <Route path="map" element={<ProtectedRoute roles={['admin', 'officer', 'worker']}><MapViewPage /></ProtectedRoute>} />
                <Route path="workers" element={<ProtectedRoute roles={['admin', 'officer']}><WorkersPage /></ProtectedRoute>} />

                {/* Admin only */}
                <Route path="users" element={<ProtectedRoute roles={['admin']}><ManageUsersPage /></ProtectedRoute>} />

                {/* Shared */}
                <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                <Route path="settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
