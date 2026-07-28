import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { classNames } from '@/services/utils';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  accent?: string;
  delta?: string;
  index?: number;
}

export function StatCard({ label, value, icon: Icon, accent = 'text-blue-600', delta, index = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">{value}</p>
          {delta && <p className="mt-1 text-xs text-slate-400">{delta}</p>}
        </div>
        <div className={classNames('flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800', accent)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}
