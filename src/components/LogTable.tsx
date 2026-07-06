'use client';

import { Fragment, useMemo, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
  type ExpandedState,
} from '@tanstack/react-table';
import type { FlatLogRecord } from '@/types/otlp';
import { SeverityBadge } from '@/components/SeverityBadge';
import { LogDetails } from '@/components/LogDetails';
import { formatRelativeTime, formatTimestamp } from '@/lib/format';

interface LogTableProps {
  records: FlatLogRecord[];
  /** Hide the header row when the table is embedded under a group heading. */
  showHeader?: boolean;
}

const columnHelper = createColumnHelper<FlatLogRecord>();

function Chevron({ open }: { open: boolean }) {
  return (
    <ChevronRight
      className={`h-3.5 w-3.5 shrink-0 text-muted transition-transform ${open ? 'rotate-90' : ''}`}
      aria-hidden
    />
  );
}

/**
 * Flat log list built on TanStack Table (headless): columns Severity / Time / Body,
 * with every row expandable to reveal its full attributes via {@link LogDetails}.
 */
export function LogTable({ records, showHeader = true }: LogTableProps) {
  const [expanded, setExpanded] = useState<ExpandedState>({});

  const columns = useMemo(
    () => [
      columnHelper.accessor('severityGroup', {
        id: 'severity',
        header: 'Severity',
        cell: (ctx) => (
          <div className="flex items-center gap-2">
            <Chevron open={ctx.row.getIsExpanded()} />
            <SeverityBadge group={ctx.getValue()} label={ctx.row.original.severityText} />
          </div>
        ),
      }),
      columnHelper.accessor('timestampMs', {
        id: 'time',
        header: 'Time',
        cell: (ctx) => (
          <span
            className="font-mono text-xs text-muted whitespace-nowrap"
            title={formatTimestamp(ctx.getValue())}
          >
            {formatRelativeTime(ctx.getValue())}
          </span>
        ),
      }),
      columnHelper.accessor('body', {
        id: 'body',
        header: 'Body',
        cell: (ctx) => (
          <span className="block max-w-0 truncate font-mono text-xs text-foreground/90">
            {ctx.getValue() || '—'}
          </span>
        ),
      }),
    ],
    [],
  );

  // TanStack Table manages its own instance internally; its returned methods are stable
  // to use during render, so the React Compiler's skip-memoization note is expected here.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: records,
    columns,
    state: { expanded },
    onExpandedChange: setExpanded,
    getRowCanExpand: () => true,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowId: (row) => row.id,
  });

  if (records.length === 0) {
    return <p className="px-4 py-6 text-center text-sm text-muted">No log records.</p>;
  }

  return (
    <table className="w-full table-fixed border-collapse text-left">
      <colgroup>
        <col className="w-[160px]" />
        <col className="w-[190px]" />
        <col />
      </colgroup>
      {showHeader && (
        <thead className="sticky top-0 z-10 bg-surface/95 backdrop-blur">
          <tr className="border-b border-border">
            {table.getFlatHeaders().map((header) => (
              <th
                key={header.id}
                className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted"
              >
                {flexRender(header.column.columnDef.header, header.getContext())}
              </th>
            ))}
          </tr>
        </thead>
      )}
      <tbody>
        {table.getRowModel().rows.map((row) => {
          const isExpanded = row.getIsExpanded();
          return (
            <Fragment key={row.id}>
              <tr
                onClick={() => row.toggleExpanded()}
                className={`cursor-pointer border-b border-border/60 transition-colors hover:bg-white/[0.03] ${
                  isExpanded ? 'bg-white/[0.03]' : ''
                }`}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-3 py-2 align-middle">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
              {isExpanded && (
                <tr className="border-b border-border/60 bg-black/20">
                  <td colSpan={row.getVisibleCells().length} className="p-0">
                    <LogDetails record={row.original} />
                  </td>
                </tr>
              )}
            </Fragment>
          );
        })}
      </tbody>
    </table>
  );
}
