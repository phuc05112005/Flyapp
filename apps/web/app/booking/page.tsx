import { Suspense } from 'react';
import { BookingClient } from '@/components/booking/booking-client';

export default function BookingPage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-5xl px-4 py-8">Đang tải biểu mẫu đặt vé...</main>}>
      <BookingClient />
    </Suspense>
  );
}
