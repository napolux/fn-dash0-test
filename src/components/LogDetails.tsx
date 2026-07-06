import type { FlatAttribute, FlatLogRecord } from '@/types/otlp';
import { formatTimestamp } from '@/lib/format';

interface LogDetailsProps {
  record: FlatLogRecord;
}

/** Pretty-print a body that happens to be JSON; otherwise return it as-is. */
function prettyBody(body: string): string {
  const trimmed = body.trim();
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return body;
  try {
    return JSON.stringify(JSON.parse(trimmed), null, 2);
  } catch {
    return body;
  }
}

function AttributeGrid({ attributes }: { attributes: FlatAttribute[] }) {
  if (attributes.length === 0) {
    return <p className="text-xs text-muted italic">No attributes</p>;
  }
  return (
    <dl className="grid grid-cols-[minmax(0,auto)_minmax(0,1fr)] gap-x-4 gap-y-1 text-xs">
      {attributes.map((attr) => (
        <div key={attr.key} className="contents">
          <dt className="font-mono text-sky-300/90 whitespace-nowrap">{attr.key}</dt>
          <dd className="font-mono text-foreground/90 break-all">{attr.value || '—'}</dd>
        </div>
      ))}
    </dl>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted">{title}</h4>
      {children}
    </div>
  );
}

/** Expanded-row content: the full body plus every attribute and resource/scope metadata. */
export function LogDetails({ record }: LogDetailsProps) {
  const resourceMeta: FlatAttribute[] = [
    { key: 'timestamp', value: formatTimestamp(record.timestampMs) },
    { key: 'severityNumber', value: String(record.severityNumber) },
    { key: 'severityText', value: record.severityText },
    ...(record.scope.name ? [{ key: 'scope.name', value: record.scope.name }] : []),
    ...(record.scope.version ? [{ key: 'scope.version', value: record.scope.version }] : []),
  ];

  return (
    <div className="grid gap-6 border-l-2 border-sky-500/40 bg-black/20 p-4 md:grid-cols-2">
      <div className="space-y-4 md:col-span-2">
        <Section title="Body">
          <pre className="max-h-64 overflow-auto rounded bg-black/40 p-3 font-mono text-xs leading-relaxed text-foreground/90 whitespace-pre-wrap break-words">
            {prettyBody(record.body) || '—'}
          </pre>
        </Section>
      </div>

      <Section title="Log attributes">
        <AttributeGrid attributes={record.attributes} />
      </Section>

      <Section title={`Resource · ${record.resource.serviceName}`}>
        <AttributeGrid attributes={record.resource.attributes} />
      </Section>

      <Section title="Record metadata">
        <AttributeGrid attributes={resourceMeta} />
      </Section>
    </div>
  );
}
