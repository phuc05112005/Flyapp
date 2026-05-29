'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { apiPost } from '@/lib/api';
import { currency } from '@/lib/format';

type BookingResponse = {
  id: string;
  bookingCode: string;
  totalAmountVND: number;
};

export function BookingClient() {
  const params = useSearchParams();
  const flightId = params.get('flightId') ?? '';
  const classType = params.get('classType') ?? 'ECONOMY';
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<BookingResponse | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);
    try {
      const result = await apiPost<BookingResponse>('/bookings', {
        flightId,
        classType,
        contactName: form.get('contactName'),
        contactEmail: form.get('contactEmail'),
        contactPhone: form.get('contactPhone'),
        passengers: [
          {
            passengerType: 'ADULT',
            firstName: form.get('firstName'),
            lastName: form.get('lastName'),
            gender: form.get('gender') || undefined,
            idNumber: form.get('idNumber') || undefined
          }
        ]
      });
      setBooking(result);
      toast.success('Tạo đơn đặt vé thành công.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể tạo đơn đặt vé.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto grid max-w-5xl gap-6 px-4 py-8 lg:grid-cols-[1fr_320px]">
      <form onSubmit={submit} className="grid gap-5 rounded border border-slate-200 bg-white p-5">
        <div>
          <h1 className="text-2xl font-bold">Thông tin đặt vé</h1>
          <p className="text-sm text-slate-500">Nhập thông tin hành khách và liên hệ nhận vé.</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="grid gap-1 text-sm font-medium">Họ<input name="lastName" required className="h-11 rounded border border-slate-300 px-3" /></label>
          <label className="grid gap-1 text-sm font-medium">Tên đệm và tên<input name="firstName" required className="h-11 rounded border border-slate-300 px-3" /></label>
          <label className="grid gap-1 text-sm font-medium">Giới tính<select name="gender" className="h-11 rounded border border-slate-300 px-3"><option value="MALE">Nam</option><option value="FEMALE">Nữ</option></select></label>
          <label className="grid gap-1 text-sm font-medium">CCCD/Hộ chiếu<input name="idNumber" className="h-11 rounded border border-slate-300 px-3" /></label>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <label className="grid gap-1 text-sm font-medium">Người liên hệ<input name="contactName" required className="h-11 rounded border border-slate-300 px-3" /></label>
          <label className="grid gap-1 text-sm font-medium">Email nhận vé<input name="contactEmail" type="email" required className="h-11 rounded border border-slate-300 px-3" /></label>
          <label className="grid gap-1 text-sm font-medium">Số điện thoại<input name="contactPhone" required placeholder="0901234567" className="h-11 rounded border border-slate-300 px-3" /></label>
        </div>
        <button disabled={loading || !flightId} className="h-11 rounded bg-brand-600 font-semibold text-white disabled:opacity-60">
          {loading ? 'Đang giữ chỗ...' : 'Giữ chỗ và tạo đơn'}
        </button>
      </form>
      <aside className="h-fit rounded border border-slate-200 bg-white p-5">
        <p className="font-semibold">Tóm tắt</p>
        <p className="mt-2 text-sm text-slate-500">Hạng ghế: {classType}</p>
        {booking ? (
          <div className="mt-5 grid gap-2">
            <p className="text-sm text-slate-500">Mã đặt vé</p>
            <p className="text-2xl font-bold text-brand-700">{booking.bookingCode}</p>
            <p className="font-semibold">{currency.format(booking.totalAmountVND)}</p>
            <a href={`/payment?bookingId=${booking.id}`} className="mt-2 grid h-10 place-items-center rounded bg-coral font-semibold text-white">Thanh toán</a>
          </div>
        ) : <p className="mt-5 text-sm text-slate-500">Giá cuối cùng sẽ hiển thị sau khi giữ chỗ.</p>}
      </aside>
    </main>
  );
}
