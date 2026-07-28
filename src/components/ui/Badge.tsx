import type { ReactNode } from 'react';
import { classNames } from '@/services/utils';

interface BadgeProps {
  children: ReactNode;
  className?: string;
  dot?: string;
}

export function Badge({ children, className, dot }: BadgeProps) {
  return (
    <span
      className={classNames(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        className,
      )}
    >
      {dot && <span className={classNames('h-1.5 w-1.5 rounded-full', dot)} />}
      {children}
    </span>
  );
}
