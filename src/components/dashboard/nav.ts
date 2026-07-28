import type { UserRole } from '@/services/types';
import {
  LayoutDashboard,
  PlusCircle,
  ListChecks,
  Users,
  Building2,
  HardHat,
  BarChart3,
  Map,
  Settings,
  User,
  ClipboardList,
  Briefcase,
  CheckSquare,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  roles: UserRole[];
  end?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', to: '/app', icon: LayoutDashboard, roles: ['citizen', 'admin', 'officer', 'worker'], end: true },
  { label: 'New Complaint', to: '/app/complaints/new', icon: PlusCircle, roles: ['citizen'] },
  { label: 'My Complaints', to: '/app/complaints', icon: ListChecks, roles: ['citizen'] },
  { label: 'All Complaints', to: '/app/complaints', icon: ClipboardList, roles: ['admin', 'officer'] },
  { label: 'My Tasks', to: '/app/tasks', icon: Briefcase, roles: ['worker'] },
  { label: 'Analytics', to: '/app/analytics', icon: BarChart3, roles: ['admin', 'officer'] },
  { label: 'Departments', to: '/app/departments', icon: Building2, roles: ['admin', 'officer'] },
  { label: 'Map View', to: '/app/map', icon: Map, roles: ['admin', 'officer', 'worker'] },
  { label: 'Workers', to: '/app/workers', icon: HardHat, roles: ['admin', 'officer'] },
  { label: 'Users', to: '/app/users', icon: Users, roles: ['admin'] },
  { label: 'Completion', to: '/app/completion', icon: CheckSquare, roles: ['worker'] },
  { label: 'Profile', to: '/app/profile', icon: User, roles: ['citizen', 'admin', 'officer', 'worker'] },
  { label: 'Settings', to: '/app/settings', icon: Settings, roles: ['citizen', 'admin', 'officer', 'worker'] },
];

export function navForRole(role: UserRole): NavItem[] {
  return NAV_ITEMS.filter((n) => n.roles.includes(role));
}
