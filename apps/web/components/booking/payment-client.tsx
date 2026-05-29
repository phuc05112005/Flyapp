'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { CreditCard, Landmark } from 'lucide-react';
import { apiPost } from '@/lib/api';

type PaymentResult = {
  paymentUrl: string | null;
  bankTransfer: null | {
    bankName: string;
    accountNumber: string;
    accountName: string;
    content: string;
  };
};

export function PaymentClient() {
  const bookingId = useSearchParams().get('bookingId') ?? '';
  const [method, setMethod] = useState('VNPAY');
  const [result, setResult] = useState<PaymentResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function pay() {
    setLoading(true);
    try {
      const data = await apiPost<PaymentResult>('/payments/initiate', { bookingId, method });
      setResult(data);
      toast.success('Đã khởi tạo thanh toán.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể khởi tạo thanh toán.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <section className="rounded border border-slate-200 bg-white p-5">
        <h1 className="text-2xl font-bold">Thanh toán đơn hàng</h1>
        <p className="mt-1 text-sm text-slate-500">Chọn phương thức thanh toán. Cổng online hiện ở chế độ mock để phát triển.</p>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {[
            ['VNPAY', 'VNPay'],
            ['MOMO', 'MoMo'],
            ['ZALOPAY', 'ZaloPay'],
            ['BANK_TRANSFER', 'Chuyển khoản']
          ].map(([value, label]) => (
            <button key={value} onClick={() => setMethod(value)} className={`flex h-14 items-center gap-3 rounded border px-4 text-left ${method === value ? 'border-brand-600 bg-brand-50' : 'border-slate-200'}`}>
              {value === 'BANK_TRANSFER' ? <Landmark size={20} /> : <CreditCard size={20} />}
              <span className="font-semibold">{label}</span>
            </button>
          ))}
        </div>
        <button disabled={loading || !bookingId} onClick={pay} className="mt-5 h-11 w-full rounded bg-coral font-semibold text-white disabled:opacity-60">
          {loading ? 'Đang xử lý...' : 'Thanh toán ngay'}
        </button>
        {result?.bankTransfer && (
          <div className="mt-5 rounded bg-slate-50 p-4 text-sm">
            <p className="font-semibold">Thông tin chuyển khoản</p>
            <p>Ngân hàng: {result.bankTransfer.bankName}</p>
            <p>Số tài khoản: {result.bankTransfer.accountNumber}</p>
            <p>Chủ tài khoản: {result.bankTransfer.accountName}</p>
            <p>Nội dung: {result.bankTransfer.content}</p>
          </div>
        )}
        {result?.paymentUrl && <p className="mt-5 text-sm text-slate-600">URL thanh toán mock: {result.paymentUrl}</p>}
      </section>
    </main>
  );
}
