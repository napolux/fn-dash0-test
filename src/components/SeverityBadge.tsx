import type { SeverityGroup } from '@/types/otlp';
import { SEVERITY_STYLES } from '@/lib/severity';

interface SeverityBadgeProps {
  group: SeverityGroup;
  /** Original OTLP severityText, shown when it differs from the group label. */
  label?: string;
}

/** Color-coded severity pill, consistent between list and detail views. */
export function SeverityBadge({ group, label }: SeverityBadgeProps) {
  const style = SEVERITY_STYLES[group];
  const text = label && label.toUpperCase() !== group ? label : group;
  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wide ring-1 ring-inset ${style.badgeClass}`}
      title={`Severity: ${group}`}
    >
      {text}
    </span>
  );
}
