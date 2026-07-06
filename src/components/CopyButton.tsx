'use client';

import { useEffect, useRef, useState } from 'react';

interface CopyButtonProps {
  value: string;
  /** Describes what is copied, for the accessible label (e.g. an attribute key). */
  label?: string;
  className?: string;
}

/** Small icon button that copies `value` to the clipboard and flips to a check briefly. */
export function CopyButton({ value, label = 'value', className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1200);
    } catch {
      /* clipboard unavailable — nothing to do */
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? 'Copied' : `Copy ${label}`}
      title={copied ? 'Copied' : `Copy ${label}`}
      className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted opacity-60 transition hover:bg-white/[0.06] hover:opacity-100 ${className}`}
    >
      {copied ? (
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-green-400" aria-hidden>
          <path d="M13 4.5L6.5 11 3 7.5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
          <rect x="5.5" y="5.5" width="7" height="7" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
          <path d="M3.5 10.5V4A1.5 1.5 0 0 1 5 2.5h5.5" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      )}
    </button>
  );
}
