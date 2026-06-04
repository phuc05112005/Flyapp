'use client';

import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Download,
  Calendar,
  ArrowRight,
  MoreHorizontal
} from 'lucide-react';
import { currency, formatDate, formatTime } from '@/lib/format';

const MOCK_BOOKINGS = [
  { id: '1', code: 'VF9K2L', customer: 'Nguyễn Văn An', email: 'an.nv@gmail.com', flight: 'VN317', route: 'HAN → SGN', date: '2026-06-04', amount: 2450000, status: 'PAID' },
  { id: '2', code: 'VFX8P1', customer: 'Trần Thị Bình', email: 'binh.tt@yahoo.com', flight: 'VJ122', route: 'SGN → DAD', date: '2026-06-04', amount: 1890000, status: 'PENDING' },
  { id: '3', code: 'VF5M0Q', customer: 'Lê Hoàng Nam', email: 'nam.lh@outlook.com', flight: 'QH450', route: 'HAN → PQC', date: '2026-06-03', amount: 3120000, status: 'CONFIRMED' },
];

export function BookingHistory() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              placeholder="Tìm mã đơn, tên, email..." 
              className="h-12 w-full rounded-2xl bg-white border border-slate-200 pl-12 pr-4 text-sm font-bold outline-none focus:border-brand-500 shadow-sm"
            />
         </div>
         <div className="flex items-center gap-3">
            <button className="flex h-12 items-center gap-2 px-6 rounded-2xl bg-white border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
               <Calendar size={18} />
               <span>Tất cả thời gian</span>
            </button>
            <button className="flex h-12 items-center gap-2 px-6 rounded-2xl bg-slate-900 font-black text-white hover:bg-black transition-all shadow-lg">
               <Download size={18} />
               <span>Xuất báo cáo</span>
            </button>
         </div>
      </div>

      <div className="rounded-[32px] border border-slate-200 bg-white overflow-hidden shadow-sm">
         <table className="w-full text-left border-collapse">
            <thead>
               <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mã đơn / Khách hàng</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Chuyến bay</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ngày đặt</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tổng tiền</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest"></th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
               {MOCK_BOOKINGS.map((booking) => (
                 <tr key={booking.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-8 py-5">
                       <div>
                          <p className="text-sm font-black text-brand-600">#{booking.code}</p>
                          <p className="text-sm font-bold text-ink mt-0.5">{booking.customer}</p>
                          <p className="text-[10px] font-medium text-slate-400">{booking.email}</p>
                       </div>
                    </td>
                    <td className="px-8 py-5">
                       <p className="text-sm font-black text-ink">{booking.flight}</p>
                       <p className="text-[10px] font-bold text-slate-400 uppercase">{booking.route}</p>
                    </td>
                    <td className="px-8 py-5 text-sm font-bold text-ink">
                       {booking.date}
                    </td>
                    <td className="px-8 py-5 text-sm font-black text-ink">
                       {currency.format(booking.amount)}
                    </td>
                    <td className="px-8 py-5">
                       <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${
                         booking.status === 'PAID' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                         booking.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                         'bg-brand-50 text-brand-600 border-brand-100'
                       }`}>
                          {booking.status}
                       </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                       <button className="p-2 text-slate-400 hover:text-ink"><MoreHorizontal size={20} /></button>
                    </td>
                 </tr>
               ))}
            </tbody>
         </table>
      </div>
    </motion.div>
  );
}
