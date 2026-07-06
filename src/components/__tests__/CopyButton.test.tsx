import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { CopyButton } from '@/components/CopyButton';

function mockClipboard() {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText },
    configurable: true,
  });
  return writeText;
}

describe('CopyButton', () => {
  afterEach(() => vi.restoreAllMocks());

  it('copies the value to the clipboard and shows a copied state', async () => {
    const writeText = mockClipboard();
    render(<CopyButton value="postgres" label="db.system" />);

    fireEvent.click(screen.getByRole('button', { name: 'Copy db.system' }));

    expect(writeText).toHaveBeenCalledWith('postgres');
    // Label flips to "Copied" after the successful write resolves.
    expect(await screen.findByRole('button', { name: 'Copied' })).toBeInTheDocument();
  });

  it('uses a generic label by default', () => {
    mockClipboard();
    render(<CopyButton value="x" />);
    expect(screen.getByRole('button', { name: 'Copy value' })).toBeInTheDocument();
  });
});
