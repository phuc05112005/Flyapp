import { Suspense } from 'react';
import { TrackClient } from './track-client';

export default function TrackPage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-5xl px-4 py-8 text-slate-500">Đang tải tra cứu vé...</main>}>
      <TrackClient />
    </Suspense>
  );
}
