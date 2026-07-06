# OTLP types & data model

**File:** `src/types/otlp.ts`

## Purpose

A hand-written TypeScript representation of the OTLP Logs schema **as encoded in protobuf-JSON**, plus the flattened shape the UI actually renders. We model only the subset we consume — no protobuf codegen dependency — which keeps the types precise and honest about what the API returns.

Reference: [`opentelemetry/proto/logs/v1/logs.proto`](https://github.com/open-telemetry/opentelemetry-proto/blob/main/opentelemetry/proto/logs/v1/logs.proto).

## The wire types (`I*`)

Mirror the nested OTLP envelope:

```
IExportLogsServiceRequest
└── resourceLogs: IResourceLogs[]
    ├── resource: IResource { attributes: IKeyValue[] }
    └── scopeLogs: IScopeLogs[]
        ├── scope: IInstrumentationScope
        └── logRecords: ILogRecord[]
```

- **`IAnyValue`** is a tagged union: `stringValue | intValue | boolValue | doubleValue | bytesValue | arrayValue | kvlistValue`. Note `intValue` is typed `number | string` — protobuf-JSON encodes 64-bit ints either way.
- **`IKeyValue`** = `{ key, value?: IAnyValue }`, used for attributes at every level.

## The flattened model

- **`FlatLogRecord`** — one log record lifted out of the nested envelope, carrying its resource + scope context: `id`, `timeUnixNano`, `timestampMs`, `severityNumber`, `severityText`, `severityGroup`, `body` (string), `attributes`, `resource`, `scope`.
- **`FlatAttribute`** = `{ key, value }` (both strings, display-ready).
- **`ResourceInfo`** — `serviceName`/`serviceNamespace`/`serviceVersion` plus a composite `key` used for [grouping](../lib/grouping.md), and the full resource attributes.
- **`ScopeInfo`** — `name`/`version`.
- **`SeverityGroup`** — the normalized band (`UNSPECIFIED`…`FATAL`); see [Severity](../lib/severity.md).

The transformation from wire types to `FlatLogRecord` lives in [OTLP transforms](../lib/otlp-transforms.md).

## Related

- [OTLP transforms](../lib/otlp-transforms.md) — turns `I*` into `FlatLogRecord`.
- [Severity](../lib/severity.md) — the `SeverityGroup` mapping.
