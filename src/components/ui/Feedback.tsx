import { classNames } from '@/services/utils';

export function Skeleton({ className }: { className?: string }) {
  return <div className={classNames('animate-pulse rounded-md bg-slate-200 dark:bg-slate-800', className)} />;
}

export function Spinner({ className }: { className?: string }) {
  return (
    <div className={classNames('flex items-center justify-center', className)}>
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 dark:border-slate-700 border-t-blue-600" />
    </div>
  );
}

export function FullPageSpinner({ label }: { label?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 dark:bg-slate-950">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 dark:border-slate-800 border-t-blue-600" />
      {label && <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>}
    </div>
  );
}
