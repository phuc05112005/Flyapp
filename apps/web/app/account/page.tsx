'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LogOut, PlaneTakeoff, ReceiptText, ShieldCheck, TicketCheck } from 'lucide-react';
import { apiGet } from '@/lib/api';
import { clearSession, getCurrentUser, type AuthUser } from '@/lib/auth-client';
import { currency, formatDate, formatTime } from '@/lib/format';

type CustomerBooking = {
  id: string;
  bookingCode: string;
  status: string;
  totalAmountVND: number;
  createdAt: string;
  payment?: { status: string; method: string } | null;
  tickets: { ticketNumber: string }[];
  flight: {
    flightNumber: string;
    departureTime: string;
    arrivalTime: string;
    airline: { name: string; code: string };
    route: { departure: { city: string; code: string }; arrival: { city: string; code: string } };
  };
};

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [bookings, setBookings] = useState<CustomerBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const current = getCurrentUser();
    setUser(current);
    if (!current) {
      setLoading(false);
      return;
    }

    apiGet<CustomerBooking[]>(`/bookings?email=${encodeURIComponent(current.email)}`)
      .then(setBookings)
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, []);

  function logout() {
    clearSession();
    window.dispatchEvent(new Event('vietfly-session'));
    router.push('/');
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <section className="rounded border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-ink">Bạn chưa đăng nhập</h1>
          <p className="mt-2 text-slate-500">Đăng nhập để xem lại các đơn đặt vé và trạng thái thanh toán.</p>
          <Link href="/login" className="btn-primary mt-6 h-11 px-5">
            Đăng nhập ngay
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <section className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <aside className="h-fit rounded border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid h-14 w-14 place-items-center rounded bg-brand-50 text-brand-700">
            <ShieldCheck size={26} />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-ink">{user.fullName}</h1>
          <p className="mt-1 text-sm text-slate-500">{user.email}</p>
          <p className="mt-1 text-sm text-slate-500">{user.phone || 'Chưa có số điện thoại'}</p>
          <div className="mt-5 rounded bg-slate-50 p-4 text-sm">
            <p className="font-semibold text-ink">Vai trò</p>
            <p className="mt-1 text-slate-600">{user.role === 'CUSTOMER' ? 'Khách hàng' : 'Tài khoản đại lý'}</p>
          </div>
          <button onClick={logout} className="btn-secondary mt-5 h-11 w-full">
            <LogOut size={17} /> Đăng xuất
          </button>
        </aside>

        <section className="grid gap-5">
          <div className="rounded border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">Lịch sử đặt vé</p>
                <h2 className="mt-1 text-2xl font-bold text-ink">Các chuyến bay của bạn</h2>
              </div>
              <Link href="/search" className="btn-primary h-11 px-4 text-sm">
                Đặt vé mới
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="rounded border border-slate-200 bg-white p-6 text-slate-500">Đang tải lịch sử đặt vé...</div>
          ) : bookings.length === 0 ? (
            <div className="rounded border border-dashed border-slate-300 bg-white p-8 text-center">
              <PlaneTakeoff className="mx-auto text-slate-400" size={34} />
              <p className="mt-3 font-semibold text-ink">Chưa có đơn đặt vé</p>
              <p className="mt-1 text-sm text-slate-500">Khi bạn giữ chỗ hoặc thanh toán, đơn sẽ xuất hiện tại đây.</p>
            </div>
          ) : (
            bookings.map((booking) => <BookingRow key={booking.id} booking={booking} />)
          )}
        </section>
      </section>
    </main>
  );
}

function BookingRow({ booking }: { booking: CustomerBooking }) {
  const isPaid = booking.status === 'CONFIRMED' || booking.status === 'PAID';

  return (
    <article className="rounded border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-lg font-bold text-brand-700">{booking.bookingCode}</p>
            <StatusPill status={booking.status} />
          </div>
          <p className="mt-2 font-semibold text-ink">
            {booking.flight.route.departure.city} ({booking.flight.route.departure.code}) → {booking.flight.route.arrival.city} ({booking.flight.route.arrival.code})
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {booking.flight.airline.name} · {booking.flight.flightNumber} · {formatDate(booking.flight.departureTime)} · {formatTime(booking.flight.departureTime)} - {formatTime(booking.flight.arrivalTime)}
          </p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-sm text-slate-500">Tổng tiền</p>
          <p className="text-xl font-bold text-coral">{currency.format(booking.totalAmountVND)}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <div className="flex flex-wrap gap-2 text-sm text-slate-600">
          <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-1">
            <ReceiptText size={14} /> {booking.payment?.method || 'Chưa chọn thanh toán'}
          </span>
          <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-1">
            <TicketCheck size={14} /> {booking.tickets.length} vé đã xuất
          </span>
        </div>
        <div className="flex gap-2">
          {!isPaid && (
            <Link href={`/payment?bookingId=${booking.id}`} className="rounded bg-brand-600 px-4 py-2 text-sm font-semibold text-white">
              Thanh toán
            </Link>
          )}
          <Link href={`/track?code=${booking.bookingCode}`} className="rounded border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
            Chi tiết
          </Link>
        </div>
      </div>
    </article>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    CONFIRMED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200'
  };

  return (
    <span className={`rounded border px-2 py-1 text-xs font-semibold ${styles[status] ?? 'border-slate-200 bg-slate-50 text-slate-600'}`}>
      {status}
    </span>
  );
}
