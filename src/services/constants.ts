import type { ComplaintStatus, Severity, Priority, UserRole } from './types';

export const CATEGORIES: { name: string; slug: string; department: string; icon: string }[] = [
  { name: 'Garbage Collection', slug: 'garbage-collection', department: 'Waste Management', icon: 'Trash2' },
  { name: 'Illegal Dumping', slug: 'illegal-dumping', department: 'Waste Management', icon: 'Trash' },
  { name: 'Road Potholes', slug: 'road-potholes', department: 'Road Department', icon: 'Construction' },
  { name: 'Broken Roads', slug: 'broken-roads', department: 'Road Department', icon: 'Road' },
  { name: 'Broken Traffic Lights', slug: 'broken-traffic-lights', department: 'Traffic Department', icon: 'TrafficCone' },
  { name: 'Street Light Issues', slug: 'street-light-issues', department: 'Electricity Department', icon: 'Lightbulb' },
  { name: 'Water Leakage', slug: 'water-leakage', department: 'Water Department', icon: 'Droplets' },
  { name: 'Sewer Overflow', slug: 'sewer-overflow', department: 'Sewer Department', icon: 'Waves' },
  { name: 'Open Manholes', slug: 'open-manholes', department: 'Sewer Department', icon: 'CircleAlert' },
  { name: 'Construction Debris', slug: 'construction-debris', department: 'Waste Management', icon: 'BrickWall' },
  { name: 'Public Property Damage', slug: 'public-property-damage', department: 'Road Department', icon: 'Building2' },
  { name: 'Fallen Trees', slug: 'fallen-trees', department: 'Parks Department', icon: 'TreePine' },
  { name: 'Other Civic Issues', slug: 'other-civic-issues', department: 'Road Department', icon: 'CircleHelp' },
];

export const DEPARTMENTS: { name: string; slug: string; icon: string }[] = [
  { name: 'Waste Management', slug: 'waste', icon: 'Trash2' },
  { name: 'Road Department', slug: 'road', icon: 'Road' },
  { name: 'Traffic Department', slug: 'traffic', icon: 'TrafficCone' },
  { name: 'Water Department', slug: 'water', icon: 'Droplets' },
  { name: 'Sewer Department', slug: 'sewer', icon: 'Waves' },
  { name: 'Electricity Department', slug: 'electricity', icon: 'Lightbulb' },
  { name: 'Parks Department', slug: 'parks', icon: 'TreePine' },
];

export const STATUS_META: Record<ComplaintStatus, { label: string; color: string; bg: string; dot: string }> = {
  submitted: { label: 'Submitted', color: 'text-slate-700 dark:text-slate-300', bg: 'bg-slate-100 dark:bg-slate-800', dot: 'bg-slate-500' },
  assigned: { label: 'Assigned', color: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-100 dark:bg-blue-950/40', dot: 'bg-blue-500' },
  in_progress: { label: 'In Progress', color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-100 dark:bg-amber-950/40', dot: 'bg-amber-500' },
  resolved: { label: 'Resolved', color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-100 dark:bg-emerald-950/40', dot: 'bg-emerald-500' },
  rejected: { label: 'Rejected', color: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-100 dark:bg-rose-950/40', dot: 'bg-rose-500' },
};

export const SEVERITY_META: Record<Severity, { label: string; color: string; bg: string }> = {
  low: { label: 'Low', color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-100 dark:bg-emerald-950/40' },
  medium: { label: 'Medium', color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-100 dark:bg-amber-950/40' },
  high: { label: 'High', color: 'text-orange-700 dark:text-orange-300', bg: 'bg-orange-100 dark:bg-orange-950/40' },
  critical: { label: 'Critical', color: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-100 dark:bg-rose-950/40' },
};

export const PRIORITY_META: Record<Priority, { label: string; color: string; bg: string }> = {
  low: { label: 'Low', color: 'text-slate-700 dark:text-slate-300', bg: 'bg-slate-100 dark:bg-slate-800' },
  normal: { label: 'Normal', color: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-100 dark:bg-blue-950/40' },
  high: { label: 'High', color: 'text-orange-700 dark:text-orange-300', bg: 'bg-orange-100 dark:bg-orange-950/40' },
  urgent: { label: 'Urgent', color: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-100 dark:bg-rose-950/40' },
};

export const ROLE_META: Record<UserRole, { label: string; color: string; bg: string }> = {
  citizen: { label: 'Citizen', color: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-100 dark:bg-blue-950/40' },
  admin: { label: 'Municipal Admin', color: 'text-violet-700 dark:text-violet-300', bg: 'bg-violet-100 dark:bg-violet-950/40' },
  officer: { label: 'Department Officer', color: 'text-teal-700 dark:text-teal-300', bg: 'bg-teal-100 dark:bg-teal-950/40' },
  worker: { label: 'Field Worker', color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-100 dark:bg-amber-950/40' },
};

export const STATUS_FLOW: ComplaintStatus[] = ['submitted', 'assigned', 'in_progress', 'resolved'];
