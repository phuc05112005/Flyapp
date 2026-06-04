'use client';

import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  Plane, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { currency } from '@/lib/format';

export function AdminOverview() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Tổng doanh thu" 
          value={currency.format(1245000000)} 
          trend="+12.5%" 
          trendUp={true} 
          icon={<Wallet className="text-emerald-600" size={24} />}
          color="bg-emerald-50"
        />
        <StatCard 
          label="Tổng đơn đặt vé" 
          value="1,284" 
          trend="+8.2%" 
          trendUp={true} 
          icon={<Plane className="text-brand-600" size={24} />}
          color="bg-brand-50"
        />
        <StatCard 
          label="Khách hàng mới" 
          value="452" 
          trend="-2.4%" 
          trendUp={false} 
          icon={<Users className="text-indigo-600" size={24} />}
          color="bg-indigo-50"
        />
        <StatCard 
          label="Tỷ lệ lấp đầy" 
          value="84.2%" 
          trend="+5.1%" 
          trendUp={true} 
          icon={<TrendingUp className="text-amber-600" size={24} />}
          color="bg-amber-50"
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Recent Bookings Table */}
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
           <div className="flex items-center justify-between mb-8">
              <h3 className="font-black text-lg text-ink">Đơn hàng mới nhất</h3>
              <button className="text-xs font-black text-brand-600 uppercase tracking-widest hover:underline">Xem tất cả</button>
           </div>
           <div className="space-y-4">
              <RecentBookingItem code="VF9K2L" name="Nguyễn Văn An" flight="VN317" amount={2450000} status="PAID" />
              <RecentBookingItem code="VFX8P1" name="Trần Thị Bình" flight="VJ122" amount={1890000} status="PENDING" />
              <RecentBookingItem code="VF5M0Q" name="Lê Hoàng Nam" flight="QH450" amount={3120000} status="CONFIRMED" />
              <RecentBookingItem code="VF1Z3X" name="Phạm Minh Đức" flight="VN782" amount={4500000} status="PAID" />
           </div>
        </div>

        {/* System Status */}
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
           <h3 className="font-black text-lg text-ink mb-8">Trạng thái hệ thống</h3>
           <div className="space-y-6">
              <StatusRow label="Kết nối hãng (API)" status="Ổn định" icon={<CheckCircle2 className="text-emerald-500" size={18} />} />
              <StatusRow label="Cổng thanh toán" status="Ổn định" icon={<CheckCircle2 className="text-emerald-500" size={18} />} />
              <StatusRow label="Dịch vụ Email/SMS" status="Đang tải chậm" icon={<AlertCircle className="text-amber-500" size={18} />} />
              <div className="pt-6 border-t border-slate-100">
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Lưu ý quản trị</p>
                 <div className="bg-brand-50 rounded-2xl p-4 border border-brand-100">
                    <p className="text-xs leading-relaxed text-brand-700 font-medium">
                       Hệ thống sẽ thực hiện bảo trì định kỳ vào 02:00 AM ngày 06/06/2026. Vui lòng thông báo cho các đại lý con.
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({ label, value, trend, trendUp, icon, color }: any) {
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
}

function RecentBookingItem({ code, name, flight, amount, status }: any) {
  const statusColors: any = {
    PAID: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    PENDING: 'bg-amber-50 text-amber-600 border-amber-100',
    CONFIRMED: 'bg-brand-50 text-brand-600 border-brand-100'
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
          <span className={`inline-block px-2 py-0.5 rounded-full text-[8px] font-black border mt-1 ${statusColors[status]}`}>{status}</span>
       </div>
    </div>
  );
}

function StatusRow({ label, status, icon }: any) {
  return (
    <div className="flex items-center justify-between">
       <span className="text-sm font-bold text-slate-500">{label}</span>
       <div className="flex items-center gap-2">
          <span className="text-xs font-black text-ink">{status}</span>
          {icon}
       </div>
    </div>
  );
}
