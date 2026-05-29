'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { apiGet } from '@/lib/api';
import { currency, formatDate, formatTime } from '@/lib/format';

type TrackedBooking = {
  bookingCode: string;
  status: string;
  contactName: string;
  totalAmountVND: number;
  flight: {
    flightNumber: string;
    departureTime: string;
    arrivalTime: string;
    airline: { name: string };
    route: { departure: { city: string; code: string }; arrival: { city: string; code: string } };
  };
};

export default function TrackPage() {
  const [code, setCode] = useState('');
  const [booking, setBooking] = useState<TrackedBooking | null>(null);

  async function track(event: React.FormEvent) {
    event.preventDefault();
    try {
      setBooking(await apiGet<TrackedBooking>(`/bookings/track/${code}`));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không tìm thấy mã đặt vé.');
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <form onSubmit={track} className="rounded border border-slate-200 bg-white p-5">
        <h1 className="text-2xl font-bold">Tra cứu vé</h1>
        <div className="mt-4 flex gap-3">
          <input value={code} onChange={(event) => setCode(event.target.value)} placeholder="VF-A3K9P2" className="h-11 flex-1 rounded border border-slate-300 px-3 uppercase" />
          <button className="rounded bg-brand-600 px-5 font-semibold text-white">Tra cứu</button>
        </div>
      </form>
      {booking && (
        <section className="mt-5 rounded border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Mã đặt vé</p>
          <h2 className="text-2xl font-bold text-brand-700">{booking.bookingCode}</h2>
          <p className="mt-3 font-semibold">{booking.flight.airline.name} · {booking.flight.flightNumber}</p>
          <p>{booking.flight.route.departure.city} ({booking.flight.route.departure.code}) → {booking.flight.route.arrival.city} ({booking.flight.route.arrival.code})</p>
          <p className="text-sm text-slate-500">{formatDate(booking.flight.departureTime)} · {formatTime(booking.flight.departureTime)} - {formatTime(booking.flight.arrivalTime)}</p>
          <p className="mt-3">Trạng thái: <span className="font-semibold">{booking.status}</span></p>
          <p>Tổng tiền: <span className="font-semibold">{currency.format(booking.totalAmountVND)}</span></p>
        </section>
      )}
    </main>
  );
}
