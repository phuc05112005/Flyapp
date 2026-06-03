import { Suspense } from 'react';
import { PaymentClient } from '@/components/booking/payment-client';

export default function PaymentPage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-3xl px-4 py-8">Đang tải thanh toán...</main>}>
      <PaymentClient />
    </Suspense>
  );
}
