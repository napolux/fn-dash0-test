import { Suspense } from 'react';
import { LogViewer } from '@/components/LogViewer';

export default function Home() {
  return (
    <main className="min-h-full">
      {/* Suspense boundary is required because LogViewer reads useSearchParams. */}
      <Suspense>
        <LogViewer />
      </Suspense>
    </main>
  );
}
