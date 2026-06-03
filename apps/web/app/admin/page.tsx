import Link from 'next/link';
import type { ReactNode } from 'react';
import { AlertTriangle, Banknote, Clock3, PlaneTakeoff, ReceiptText, UsersRound } from 'lucide-react';
import { PaymentSettingsForm, type AgencyPaymentSetting } from '@/components/admin/payment-settings-form';
import { StaffManagement } from '@/components/admin/staff-management';
import { apiGet } from '@/lib/api';
import { currency, formatDate, formatTime } from '@/lib/format';

type Stats = {
  bookingsToday: number;
  pendingBookings: number;
  customers: number;
  confirmedBookings: number;
  totalBookings: number;
  revenueTodayVND: number;
};

type AdminBooking = {
  id: string;
  bookingCode: string;
  status: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  totalAmountVND: number;
  createdAt: string;
  items: { id: string }[];
  tickets: { id: string }[];
  payment?: { status: string; method: string } | null;
  flight: {
    flightNumber: string;
    departureTime: string;
    airline: { code: string; name: string };
    route: { departure: { code: string; city: string }; arrival: { code: string; city: string } };
  };
};

const fallbackPaymentSetting: AgencyPaymentSetting = {
  id: 'fallback',
  bankName: 'Vietcombank',
  accountNumber: '0123456789',
  accountName: 'CONG TY VIETFLY AGENCY',
  branch: 'TP. Ho Chi Minh',
  qrImageDataUrl: null,
  note: 'Vui lòng chuyển khoản đúng nội dung mã đặt vé để đại lý đối soát nhanh.'
};

export default async function AdminDashboardPage() {
  const [stats, bookings, paymentSetting] = await Promise.all([
    apiGet<Stats>('/admin/dashboard/stats').catch(() => ({
      bookingsToday: 0,
      pendingBookings: 0,
      customers: 0,
      confirmedBookings: 0,
      totalBookings: 0,
      revenueTodayVND: 0
    })),
    apiGet<AdminBooking[]>('/admin/bookings').catch(() => []),
    apiGet<AgencyPaymentSetting>('/admin/payment-settings').catch(() => fallbackPaymentSetting)
  ]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <section className="rounded border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">Bảng điều hành đại lý</p>
            <h1 className="mt-1 text-3xl font-bold text-ink">Quản lý đơn đặt vé và doanh thu</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Theo dõi đơn mới, trạng thái thanh toán, vé đã xuất và cấu hình thông tin chuyển khoản hiển thị cho khách hàng.
            </p>
          </div>
          <Link href="/search" className="btn-primary h-10 px-4 text-sm">
            Tạo booking mới
          </Link>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Stat icon={<ReceiptText size={20} />} label="Đơn hôm nay" value={String(stats.bookingsToday)} />
        <Stat icon={<Banknote size={20} />} label="Doanh thu hôm nay" value={currency.format(stats.revenueTodayVND)} />
        <Stat icon={<Clock3 size={20} />} label="Chờ thanh toán" value={String(stats.pendingBookings)} />
        <Stat icon={<PlaneTakeoff size={20} />} label="Đã xuất vé" value={String(stats.confirmedBookings)} />
        <Stat icon={<UsersRound size={20} />} label="Khách hàng" value={String(stats.customers)} />
      </section>

      <section className="mt-6">
        <PaymentSettingsForm initialSetting={paymentSetting} />
      </section>

      <section className="mt-6">
        <StaffManagement />
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="rounded border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <h2 className="text-xl font-bold text-ink">Đơn đặt vé mới nhất</h2>
            <p className="mt-1 text-sm text-slate-500">{stats.totalBookings} booking trong hệ thống</p>
          </div>
          <div className="divide-y divide-slate-100">
            {bookings.length === 0 ? (
              <div className="p-6 text-sm text-slate-500">Chưa có booking hoặc API chưa sẵn sàng.</div>
            ) : (
              bookings.map((booking) => <BookingItem key={booking.id} booking={booking} />)
            )}
          </div>
        </div>

        <aside className="grid h-fit gap-4">
          <div className="rounded border border-amber-200 bg-amber-50 p-5">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <AlertTriangle size={19} /> Việc cần xử lý
            </div>
            <div className="mt-4 grid gap-3 text-sm text-amber-900">
              <Task label="Gọi khách chưa thanh toán" value={`${stats.pendingBookings} đơn`} />
              <Task label="Kiểm tra vé đã xuất" value={`${stats.confirmedBookings} đơn`} />
              <Task label="Đối soát doanh thu" value={currency.format(stats.revenueTodayVND)} />
            </div>
          </div>
          <div className="rounded border border-slate-200 bg-white p-5 shadow-sm">
            <p className="font-bold text-ink">Quy trình chuyển khoản</p>
            <ol className="mt-3 grid gap-2 text-sm leading-6 text-slate-600">
              <li>1. Khách chọn chuyển khoản và quét QR của đại lý.</li>
              <li>2. Nội dung chuyển khoản là mã đặt vé.</li>
              <li>3. Đại lý đối soát giao dịch và xác nhận thanh toán.</li>
              <li>4. Hệ thống xuất vé điện tử và lưu trạng thái booking.</li>
            </ol>
          </div>
        </aside>
      </section>
    </main>
  );
}

function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded bg-brand-50 text-brand-700">{icon}</div>
      <p className="mt-4 text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-ink">{value}</p>
    </div>
  );
}

function BookingItem({ booking }: { booking: AdminBooking }) {
  return (
    <article className="grid gap-4 p-5 xl:grid-cols-[1.1fr_1fr_auto] xl:items-center">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/track?code=${booking.bookingCode}`} className="font-bold text-brand-700 hover:underline">
            {booking.bookingCode}
          </Link>
          <Status status={booking.status} />
        </div>
        <p className="mt-2 font-semibold text-ink">{booking.contactName}</p>
        <p className="text-sm text-slate-500">{booking.contactEmail} · {booking.contactPhone}</p>
      </div>
      <div>
        <p className="font-semibold text-ink">
          {booking.flight.route.departure.code} → {booking.flight.route.arrival.code} · {booking.flight.flightNumber}
        </p>
        <p className="text-sm text-slate-500">
          {booking.flight.airline.name} · {formatDate(booking.flight.departureTime)} {formatTime(booking.flight.departureTime)}
        </p>
        <p className="mt-1 text-sm text-slate-500">
          {booking.items.length} khách · {booking.tickets.length} vé · {booking.payment?.method || 'chưa chọn thanh toán'}
        </p>
      </div>
      <div className="text-left xl:text-right">
        <p className="text-lg font-bold text-coral">{currency.format(booking.totalAmountVND)}</p>
        <p className="text-sm text-slate-500">{booking.payment?.status || 'NO_PAYMENT'}</p>
      </div>
    </article>
  );
}

function Status({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: 'border-amber-200 bg-amber-50 text-amber-700',
    CONFIRMED: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    PAID: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    CANCELLED: 'border-rose-200 bg-rose-50 text-rose-700'
  };

  return <span className={`rounded border px-2 py-1 text-xs font-semibold ${styles[status] ?? 'border-slate-200 bg-slate-50 text-slate-600'}`}>{status}</span>;
}

function Task({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded bg-white/60 px-3 py-2">
      <span>{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}
