import type {
  FlatAttribute,
  FlatLogRecord,
  IAnyValue,
  IExportLogsServiceRequest,
  IKeyValue,
  ResourceInfo,
  SeverityGroup,
} from '@/types/otlp';

const UNSPECIFIED_SERVICE = 'unknown_service';

/**
 * Convert an OTLP `AnyValue` into a native JS value, recursing into arrays and
 * key-value lists. Returns `undefined` for an empty/absent value.
 */
export function anyValueToJs(value: IAnyValue | undefined): unknown {
  if (!value) return undefined;

  if (value.stringValue !== undefined) return value.stringValue;
  if (value.boolValue !== undefined) return value.boolValue;
  if (value.doubleValue !== undefined) return value.doubleValue;
  if (value.intValue !== undefined) {
    // protobuf-JSON may encode 64-bit ints as strings. Convert to a number only when
    // it fits safely in a double; otherwise keep the string to preserve precision.
    if (typeof value.intValue === 'number') return value.intValue;
    const n = Number(value.intValue);
    return Number.isSafeInteger(n) ? n : value.intValue;
  }
  if (value.bytesValue !== undefined) return value.bytesValue;
  if (value.arrayValue !== undefined) {
    return (value.arrayValue.values ?? []).map(anyValueToJs);
  }
  if (value.kvlistValue !== undefined) {
    const out: Record<string, unknown> = {};
    for (const kv of value.kvlistValue.values ?? []) {
      out[kv.key] = anyValueToJs(kv.value);
    }
    return out;
  }
  return undefined;
}

/** Render an `AnyValue` as a display string (JSON for structured values). */
export function anyValueToString(value: IAnyValue | undefined): string {
  const js = anyValueToJs(value);
  if (js === undefined) return '';
  if (typeof js === 'string') return js;
  return JSON.stringify(js);
}

/** Flatten OTLP KeyValue attributes into displayable string pairs. */
export function flattenAttributes(attributes: IKeyValue[] | undefined): FlatAttribute[] {
  return (attributes ?? []).map((attr) => ({
    key: attr.key,
    value: anyValueToString(attr.value),
  }));
}

/** Look up a single string attribute by key from raw OTLP KeyValues. */
function findStringAttribute(attributes: IKeyValue[] | undefined, key: string): string | undefined {
  const found = attributes?.find((attr) => attr.key === key);
  if (!found) return undefined;
  const str = anyValueToString(found.value);
  return str === '' ? undefined : str;
}

/**
 * Map an OTLP `severityNumber` (1–24, in four-step bands) to a normalized group.
 * See https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-severitynumber
 */
export function severityGroup(severityNumber: number | undefined): SeverityGroup {
  if (!severityNumber || severityNumber < 1) return 'UNSPECIFIED';
  if (severityNumber <= 4) return 'TRACE';
  if (severityNumber <= 8) return 'DEBUG';
  if (severityNumber <= 12) return 'INFO';
  if (severityNumber <= 16) return 'WARN';
  if (severityNumber <= 20) return 'ERROR';
  return 'FATAL';
}

/** Convert a nanosecond epoch string to integer epoch milliseconds. */
export function unixNanoToMillis(timeUnixNano: string | undefined): number {
  if (!timeUnixNano) return 0;
  try {
    // BigInt division avoids the precision loss of Number() on ~1e18 values.
    return Number(BigInt(timeUnixNano) / 1_000_000n);
  } catch {
    const n = Number(timeUnixNano);
    return Number.isFinite(n) ? Math.floor(n / 1_000_000) : 0;
  }
}

function buildResourceInfo(attributes: IKeyValue[] | undefined): ResourceInfo {
  const serviceName = findStringAttribute(attributes, 'service.name') ?? UNSPECIFIED_SERVICE;
  const serviceNamespace = findStringAttribute(attributes, 'service.namespace');
  const serviceVersion = findStringAttribute(attributes, 'service.version');
  return {
    key: [serviceNamespace ?? '', serviceName].join('/'),
    serviceName,
    serviceNamespace,
    serviceVersion,
    attributes: flattenAttributes(attributes),
  };
}

/**
 * Walk the nested OTLP envelope (resourceLogs → scopeLogs → logRecords) and
 * produce a flat, display-ready list, carrying resource and scope context onto
 * each record. Records are returned sorted newest-first.
 */
export function flattenLogs(response: IExportLogsServiceRequest | undefined): FlatLogRecord[] {
  const records: FlatLogRecord[] = [];
  const resourceLogs = response?.resourceLogs ?? [];

  resourceLogs.forEach((resourceLog, resourceIndex) => {
    const resource = buildResourceInfo(resourceLog.resource?.attributes);

    (resourceLog.scopeLogs ?? []).forEach((scopeLog, scopeIndex) => {
      const scope = { name: scopeLog.scope?.name, version: scopeLog.scope?.version };

      (scopeLog.logRecords ?? []).forEach((record, recordIndex) => {
        const severityNumber = record.severityNumber ?? 0;
        records.push({
          id: `${resourceIndex}-${scopeIndex}-${recordIndex}`,
          timeUnixNano: record.timeUnixNano ?? '0',
          timestampMs: unixNanoToMillis(record.timeUnixNano),
          severityNumber,
          severityText: record.severityText ?? severityGroup(severityNumber),
          severityGroup: severityGroup(severityNumber),
          body: anyValueToString(record.body),
          attributes: flattenAttributes(record.attributes),
          resource,
          scope,
        });
      });
    });
  });

  return records.sort((a, b) => b.timestampMs - a.timestampMs);
}
