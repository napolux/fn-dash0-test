'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';

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
      className={`inline-flex size-5 shrink-0 items-center justify-center rounded text-muted opacity-60 transition hover:bg-white/[0.06] hover:opacity-100 ${className}`}
    >
      {copied ? (
        <Check className="size-3.5 text-green-400" aria-hidden />
      ) : (
        <Copy className="size-3.5" aria-hidden />
      )}
    </button>
  );
}
