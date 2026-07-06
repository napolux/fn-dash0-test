/**
 * Minimal TypeScript representation of the OTLP Logs protobuf schema as it is
 * encoded in protobuf-JSON. We hand-write only the subset we consume rather than
 * pulling in a protobuf codegen dependency — it keeps the types precise, reviewable,
 * and honest about what the API actually returns.
 *
 * Reference: opentelemetry-proto/opentelemetry/proto/logs/v1/logs.proto
 */

/** OTLP `AnyValue` — a tagged union. Exactly one field is set in practice. */
export interface IAnyValue {
  stringValue?: string;
  /** protobuf-JSON encodes 64-bit ints as either a number or a string. */
  intValue?: number | string;
  boolValue?: boolean;
  doubleValue?: number;
  bytesValue?: string;
  arrayValue?: IArrayValue;
  kvlistValue?: IKeyValueList;
}

export interface IArrayValue {
  values?: IAnyValue[];
}

export interface IKeyValueList {
  values?: IKeyValue[];
}

export interface IKeyValue {
  key: string;
  value?: IAnyValue;
}

export interface IResource {
  attributes?: IKeyValue[];
  droppedAttributesCount?: number;
}

export interface IInstrumentationScope {
  name?: string;
  version?: string;
  attributes?: IKeyValue[];
  droppedAttributesCount?: number;
}

export interface ILogRecord {
  timeUnixNano?: string;
  observedTimeUnixNano?: string;
  severityNumber?: number;
  severityText?: string;
  body?: IAnyValue;
  attributes?: IKeyValue[];
  droppedAttributesCount?: number;
  flags?: number;
  traceId?: string;
  spanId?: string;
}

export interface IScopeLogs {
  scope?: IInstrumentationScope;
  logRecords?: ILogRecord[];
  schemaUrl?: string;
}

export interface IResourceLogs {
  resource?: IResource;
  scopeLogs?: IScopeLogs[];
  schemaUrl?: string;
}

export interface IExportLogsServiceRequest {
  resourceLogs?: IResourceLogs[];
}

/**
 * Normalized severity buckets. OTLP severityNumber spans 1–24 in four-step bands;
 * we collapse them so colors and filtering stay consistent even when severityText
 * is missing or non-standard.
 */
export type SeverityGroup =
  | 'UNSPECIFIED'
  | 'TRACE'
  | 'DEBUG'
  | 'INFO'
  | 'WARN'
  | 'ERROR'
  | 'FATAL';

/** A single log record flattened out of the nested OTLP envelope. */
export interface FlatLogRecord {
  /** Stable identity derived from position + timestamp; used as React key. */
  id: string;
  timeUnixNano: string;
  /** Epoch milliseconds derived from timeUnixNano; used for sorting/histogram. */
  timestampMs: number;
  severityNumber: number;
  severityText: string;
  severityGroup: SeverityGroup;
  body: string;
  attributes: FlatAttribute[];
  resource: ResourceInfo;
  scope: ScopeInfo;
}

export interface FlatAttribute {
  key: string;
  value: string;
}

export interface ResourceInfo {
  /** Composite key that uniquely identifies the parent resource for grouping. */
  key: string;
  serviceName: string;
  serviceNamespace?: string;
  serviceVersion?: string;
  attributes: FlatAttribute[];
}

export interface ScopeInfo {
  name?: string;
  version?: string;
}
