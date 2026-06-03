'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { toast } from 'sonner';
import { CircleCheck, Search, TicketCheck, UserRound } from 'lucide-react';
import { apiGet } from '@/lib/api';
import { currency, formatDate, formatTime } from '@/lib/format';

type TrackedBooking = {
  id: string;
  bookingCode: string;
  status: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  totalAmountVND: number;
  providerPnr?: string;
  items: { id: string; firstName: string; lastName: string; passengerType: string; seatNumber?: string }[];
  tickets: { ticketNumber: string; pnrCode?: string }[];
  payment?: { status: string; method: string; paidAt?: string } | null;
  flight: {
    flightNumber: string;
    departureTime: string;
    arrivalTime: string;
    airline: { name: string };
    route: { departure: { city: string; code: string }; arrival: { city: string; code: string } };
  };
};

export function TrackClient() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get('code') ?? '';
  const [code, setCode] = useState(initialCode);
  const [booking, setBooking] = useState<TrackedBooking | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialCode) void loadBooking(initialCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCode]);

  async function loadBooking(value: string) {
    if (!value.trim()) return;
    setLoading(true);
    try {
      setBooking(await apiGet<TrackedBooking>(`/bookings/track/${value.trim().toUpperCase()}`));
    } catch (error) {
      setBooking(null);
      toast.error(error instanceof Error ? error.message : 'Không tìm thấy mã đặt vé.');
    } finally {
      setLoading(false);
    }
  }

  async function track(event: FormEvent) {
    event.preventDefault();
    await loadBooking(code);
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <form onSubmit={track} className="rounded border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">Tra cứu vé</p>
        <h1 className="mt-1 text-2xl font-bold text-ink">Kiểm tra trạng thái đặt vé</h1>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <input value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="VF-A3K9P2" className="h-12 flex-1 rounded border border-slate-300 px-3 uppercase text-ink outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100" />
          <button disabled={loading} className="flex h-12 items-center justify-center gap-2 rounded bg-brand-600 px-6 font-semibold text-white disabled:opacity-60">
            <Search size={18} /> {loading ? 'Đang tra cứu...' : 'Tra cứu'}
          </button>
        </div>
      </form>

      {booking && (
        <section className="mt-6 grid gap-5">
          <div className="rounded border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">Mã đặt vé</p>
                <h2 className="text-3xl font-bold text-brand-700">{booking.bookingCode}</h2>
                <p className="mt-3 font-semibold text-ink">{booking.flight.airline.name} · {booking.flight.flightNumber}</p>
                <p className="text-slate-600">
                  {booking.flight.route.departure.city} ({booking.flight.route.departure.code}) → {booking.flight.route.arrival.city} ({booking.flight.route.arrival.code})
                </p>
                <p className="text-sm text-slate-500">
                  {formatDate(booking.flight.departureTime)} · {formatTime(booking.flight.departureTime)} - {formatTime(booking.flight.arrivalTime)}
                </p>
              </div>
              <div className="rounded border border-slate-200 bg-slate-50 p-4 text-sm">
                <p className="text-slate-500">Trạng thái</p>
                <p className="mt-1 text-xl font-bold text-ink">{booking.status}</p>
                <p className="mt-2 text-slate-500">Tổng tiền</p>
                <p className="font-bold text-coral">{currency.format(booking.totalAmountVND)}</p>
              </div>
            </div>
            {booking.status === 'PENDING' && (
              <Link href={`/payment?bookingId=${booking.id}`} className="mt-5 inline-flex h-11 items-center justify-center rounded bg-coral px-5 font-semibold text-white">
                Thanh toán đơn này
              </Link>
            )}
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 font-bold text-ink">
                <UserRound size={19} /> Hành khách
              </div>
              <div className="mt-4 grid gap-3">
                {booking.items.map((item) => (
                  <div key={item.id} className="rounded bg-slate-50 p-3 text-sm">
                    <p className="font-semibold text-ink">{item.lastName} {item.firstName}</p>
                    <p className="text-slate-500">{item.passengerType} · Ghế {item.seatNumber || 'tự động'}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 font-bold text-ink">
                <TicketCheck size={19} /> Vé điện tử
              </div>
              {booking.tickets.length > 0 ? (
                <div className="mt-4 grid gap-3">
                  {booking.tickets.map((ticket) => (
                    <div key={ticket.ticketNumber} className="rounded border border-emerald-200 bg-emerald-50 p-3 text-sm">
                      <div className="flex items-center gap-2 font-semibold text-emerald-700">
                        <CircleCheck size={16} /> {ticket.ticketNumber}
                      </div>
                      <p className="mt-1 text-slate-600">PNR: {ticket.pnrCode || booking.providerPnr || 'Đang cập nhật'}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-500">Vé sẽ được xuất sau khi thanh toán được xác nhận.</p>
              )}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
