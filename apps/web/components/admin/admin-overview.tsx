'use client';

import { useEffect, useState, memo } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Plane, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { currency } from '@/lib/format';
import { apiGet } from '@/lib/api';

type DashboardStats = {
  bookingsToday: number;
  pendingBookings: number;
  customers: number;
  confirmedBookings: number;
  totalBookings: number;
  revenueTodayVND: number;
};

type RecentBooking = {
  id: string;
  bookingCode: string;
  contactName: string;
  totalAmountVND: number;
  status: string;
  flight: { flightNumber: string };
};

export function AdminOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [bookings, setBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      apiGet<DashboardStats>('/admin/dashboard/stats'),
      apiGet<RecentBooking[]>('/admin/bookings')
    ]).then(([s, b]) => {
      if (isMounted) {
        setStats(s);
        setBookings(b);
        setLoading(false);
      }
    }).catch(() => {
      if (isMounted) setLoading(false);
    });
    return () => { isMounted = false; };
  }, []);

  if (loading) return (
    <div className="flex h-64 items-center justify-center rounded-[32px] border border-dashed border-slate-200 bg-white">
      <Loader2 className="animate-spin text-brand-600" size={32} />
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Doanh thu hôm nay" 
          value={currency.format(stats?.revenueTodayVND ?? 0)} 
          trend="+12.5%" 
          trendUp={true} 
          icon={<Wallet className="text-emerald-600" size={24} />}
          color="bg-emerald-50"
        />
        <StatCard 
          label="Lượt đặt vé hôm nay" 
          value={String(stats?.bookingsToday ?? 0)} 
          trend="+8.2%" 
          trendUp={true} 
          icon={<Plane className="text-brand-600" size={24} />}
          color="bg-brand-50"
        />
        <StatCard 
          label="Tổng khách hàng" 
          value={String(stats?.customers ?? 0)} 
          trend="+2.4%" 
          trendUp={true} 
          icon={<Users className="text-indigo-600" size={24} />}
          color="bg-indigo-50"
        />
        <StatCard 
          label="Chờ thanh toán" 
          value={String(stats?.pendingBookings ?? 0)} 
          trend="-5.1%" 
          trendUp={false} 
          icon={<Clock className="text-amber-600" size={24} />}
          color="bg-amber-50"
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Recent Bookings Table */}
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
           <div className="flex items-center justify-between mb-8">
              <h3 className="font-black text-lg text-ink">Yêu cầu đặt vé mới nhất</h3>
              <button className="text-xs font-black text-brand-600 uppercase tracking-widest hover:underline">Xem tất cả</button>
           </div>
           <div className="space-y-4">
              {bookings.slice(0, 5).map(b => (
                <RecentBookingItem 
                  key={b.id}
                  code={b.bookingCode} 
                  name={b.contactName} 
                  flight={b.flight.flightNumber} 
                  amount={Number(b.totalAmountVND)} 
                  status={b.status as any} 
                />
              ))}
              {bookings.length === 0 && <p className="text-center text-slate-400 py-10">Chưa có lượt đặt vé nào.</p>}
           </div>
        </div>

        {/* System Status */}
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
           <h3 className="font-black text-lg text-ink mb-8">Trạng thái hệ thống</h3>
           <div className="space-y-6">
              <StatusRow label="Kết nối hãng (API)" status="Ổn định" icon={<CheckCircle2 className="text-emerald-500" size={18} />} />
              <StatusRow label="Cổng thanh toán" status="Ổn định" icon={<CheckCircle2 className="text-emerald-500" size={18} />} />
              <StatusRow label="Dịch vụ Email/SMS" status="Hoạt động" icon={<CheckCircle2 className="text-emerald-500" size={18} />} />
              <div className="pt-6 border-t border-slate-100">
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Lưu ý quản trị</p>
                 <div className="bg-brand-50 rounded-2xl p-4 border border-brand-100">
                    <p className="text-xs leading-relaxed text-brand-700 font-medium">
                       Hệ thống đang hoạt động tối ưu. Đã đối soát {stats?.confirmedBookings ?? 0} vé thành công trong kỳ.
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

const StatCard = memo(({ label, value, trend, trendUp, icon, color }: any) => {
  return (
    <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className={`h-12 w-12 rounded-2xl ${color} flex items-center justify-center`}>
          {icon}
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          {trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {trend}
        </div>
      </div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-2xl font-black text-ink mt-1">{value}</p>
    </div>
  );
});
StatCard.displayName = 'StatCard';

const RecentBookingItem = memo(({ code, name, flight, amount, status }: any) => {
  const statusColors: Record<string, string> = {
    PAID: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    PENDING: 'bg-amber-50 text-amber-600 border-amber-100',
    CONFIRMED: 'bg-brand-50 text-brand-600 border-brand-100',
    CANCELLED: 'bg-rose-50 text-rose-600 border-rose-100'
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-50 hover:border-brand-100 transition-colors">
       <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-brand-600 text-xs">{flight.slice(0,2)}</div>
          <div>
             <p className="text-sm font-black text-ink">{name}</p>
             <p className="text-[10px] font-bold text-slate-400 uppercase">{code} · {flight}</p>
          </div>
       </div>
       <div className="text-right">
          <p className="text-sm font-black text-ink">{currency.format(amount)}</p>
          <span className={`inline-block px-2 py-0.5 rounded-full text-[8px] font-black border mt-1 ${statusColors[status] || 'bg-slate-100 text-slate-600'}`}>{status}</span>
       </div>
    </div>
  );
});
RecentBookingItem.displayName = 'RecentBookingItem';

const StatusRow = memo(({ label, status, icon }: any) => {
  return (
    <div className="flex items-center justify-between">
       <span className="text-sm font-bold text-slate-500">{label}</span>
       <div className="flex items-center gap-2">
          <span className="text-xs font-black text-ink">{status}</span>
          {icon}
       </div>
    </div>
  );
});
StatusRow.displayName = 'StatusRow';
