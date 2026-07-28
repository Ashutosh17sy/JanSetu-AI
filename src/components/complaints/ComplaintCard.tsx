import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Clock, Building2 } from 'lucide-react';
import type { Complaint } from '@/services/types';
import { StatusBadge, SeverityBadge } from '@/components/ui/StatusBadges';
import { timeAgo, classNames } from '@/services/utils';

interface ComplaintCardProps {
  complaint: Complaint;
  index?: number;
}

export function ComplaintCard({ complaint, index = 0 }: ComplaintCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
    >
      <Link
        to={`/app/complaints/${complaint.id}`}
        className="group block overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
      >
        <div className="flex gap-4 p-4">
          {complaint.image_url ? (
            <img
              src={complaint.image_url}
              alt={complaint.title}
              className="h-20 w-20 shrink-0 rounded-xl object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400">
              <Building2 className="h-7 w-7" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {complaint.title}
                </p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{complaint.ticket_number}</p>
              </div>
              <StatusBadge status={complaint.status} />
            </div>

            <p className="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">{complaint.description || complaint.ai_description}</p>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {timeAgo(complaint.created_at)}
              </span>
              {complaint.address && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  <span className="truncate max-w-[160px]">{complaint.address}</span>
                </span>
              )}
              {complaint.department && (
                <span className="flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5" />
                  {complaint.department.name}
                </span>
              )}
              <SeverityBadge severity={complaint.severity} />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function ComplaintList({ complaints }: { complaints: Complaint[] }) {
  if (complaints.length === 0) return null;
  return (
    <div className="space-y-3">
      {complaints.map((c, i) => (
        <ComplaintCard key={c.id} complaint={c} index={i} />
      ))}
    </div>
  );
}

export function ComplaintRow({ complaint }: { complaint: Complaint }) {
  return (
    <Link
      to={`/app/complaints/${complaint.id}`}
      className={classNames(
        'block rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50',
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{complaint.title}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{complaint.ticket_number} · {timeAgo(complaint.created_at)}</p>
        </div>
        <StatusBadge status={complaint.status} />
      </div>
    </Link>
  );
}
