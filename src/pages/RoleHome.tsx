import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { CitizenDashboard } from '@/pages/citizen/CitizenDashboard';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { DepartmentDashboard } from '@/pages/department/DepartmentDashboard';
import { WorkerDashboard } from '@/pages/worker/WorkerDashboard';

export function RoleHome() {
  const { profile } = useAuth();
  if (!profile) return <Navigate to="/login" replace />;
  switch (profile.role) {
    case 'admin':
    case 'officer':
      return profile.role === 'admin' ? <AdminDashboard /> : <DepartmentDashboard />;
    case 'worker':
      return <WorkerDashboard />;
    case 'citizen':
    default:
      return <CitizenDashboard />;
  }
}
