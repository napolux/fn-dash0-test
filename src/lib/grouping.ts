import type { FlatLogRecord } from '@/types/otlp';

export interface ServiceGroup {
  /** Stable resource key (namespace/service). */
  key: string;
  serviceName: string;
  serviceNamespace?: string;
  serviceVersion?: string;
  count: number;
  records: FlatLogRecord[];
}

/**
 * Group flattened records by their parent resource (service). Groups preserve the
 * incoming record order within each group and are returned sorted by record count
 * descending, so the noisiest services surface first.
 */
export function groupByResource(records: FlatLogRecord[]): ServiceGroup[] {
  const groups = new Map<string, ServiceGroup>();

  for (const record of records) {
    const { key, serviceName, serviceNamespace, serviceVersion } = record.resource;
    let group = groups.get(key);
    if (!group) {
      group = { key, serviceName, serviceNamespace, serviceVersion, count: 0, records: [] };
      groups.set(key, group);
    }
    group.records.push(record);
    group.count += 1;
  }

  return [...groups.values()].sort((a, b) => b.count - a.count);
}
