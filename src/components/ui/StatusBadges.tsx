import { Badge } from './Badge';
import { STATUS_META, SEVERITY_META, PRIORITY_META } from '@/services/constants';
import type { ComplaintStatus, Severity, Priority } from '@/services/types';

export function StatusBadge({ status }: { status: ComplaintStatus }) {
  const m = STATUS_META[status];
  return (
    <Badge className={`${m.bg} ${m.color}`} dot={m.dot}>
      {m.label}
    </Badge>
  );
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  const m = SEVERITY_META[severity];
  return <Badge className={`${m.bg} ${m.color}`}>{m.label}</Badge>;
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const m = PRIORITY_META[priority];
  return <Badge className={`${m.bg} ${m.color}`}>{m.label}</Badge>;
}
