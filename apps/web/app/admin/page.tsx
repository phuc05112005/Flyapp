import { apiGet } from '@/lib/api';
import { currency } from '@/lib/format';

type Stats = {
  bookingsToday: number;
  pendingBookings: number;
  customers: number;
  revenueTodayVND: number;
};

export default async function AdminDashboardPage() {
  const stats = await apiGet<Stats>('/admin/dashboard/stats').catch(() => ({
    bookingsToday: 0,
    pendingBookings: 0,
    customers: 0,
    revenueTodayVND: 0
  }));

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard đại lý</h1>
        <p className="text-sm text-slate-500">Theo dõi doanh thu, đơn hàng và khách hàng.</p>
      </div>
      <section className="mt-6 grid gap-4 md:grid-cols-4">
        <Stat label="Vé bán hôm nay" value={String(stats.bookingsToday)} />
        <Stat label="Doanh thu hôm nay" value={currency.format(stats.revenueTodayVND)} />
        <Stat label="Đơn chờ xử lý" value={String(stats.pendingBookings)} />
        <Stat label="Khách hàng" value={String(stats.customers)} />
      </section>
      <section className="mt-6 rounded border border-slate-200 bg-white p-5">
        <p className="font-semibold">Cảnh báo vận hành</p>
        <p className="mt-2 text-sm text-slate-500">Sau khi tích hợp provider thật, khu vực này sẽ hiển thị đơn chờ quá 30 phút, chuyến sắp bay còn nhiều ghế và lỗi webhook thanh toán.</p>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-ink">{value}</p>
    </div>
  );
}
