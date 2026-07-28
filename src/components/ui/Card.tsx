import type { HTMLAttributes, ReactNode } from 'react';
import { classNames } from '@/services/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
  children: ReactNode;
}

export function Card({ glass, className, children, ...props }: CardProps) {
  return (
    <div
      className={classNames(
        glass
          ? 'rounded-2xl border border-white/40 dark:border-white/10 bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl shadow-sm'
          : 'rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={classNames('border-b border-slate-100 dark:border-slate-800 px-5 py-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={classNames('text-base font-semibold text-slate-900 dark:text-slate-100', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={classNames('p-5', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={classNames('border-t border-slate-100 dark:border-slate-800 px-5 py-4', className)} {...props}>
      {children}
    </div>
  );
}
