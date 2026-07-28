import type { ReactNode } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { classNames } from '@/services/utils';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  sortable?: boolean;
  className?: string;
  align?: 'left' | 'right' | 'center';
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  empty?: ReactNode;
}

export function DataTable<T>({ columns, data, rowKey, onRowClick, sortBy, sortDir, onSort, empty }: DataTableProps<T>) {
  const alignClass = (a?: string) => (a === 'right' ? 'text-right' : a === 'center' ? 'text-center' : 'text-left');

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 dark:bg-slate-900/60">
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                className={classNames('px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap', alignClass(c.align), c.className)}
              >
                {c.sortable && onSort ? (
                  <button onClick={() => onSort(c.key)} className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-slate-100">
                    {c.header}
                    {sortBy === c.key && (sortDir === 'asc' ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />)}
                  </button>
                ) : (
                  c.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center text-slate-500 dark:text-slate-400">
                {empty ?? 'No records found.'}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={() => onRowClick?.(row)}
                className={classNames(
                  'bg-white dark:bg-slate-900 transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50',
                )}
              >
                {columns.map((c) => (
                  <td key={c.key} className={classNames('px-4 py-3 text-slate-700 dark:text-slate-200 whitespace-nowrap', alignClass(c.align), c.className)}>
                    {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
