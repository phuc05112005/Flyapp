'use client';

import { useEffect, useState, useRef, memo } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Download,
  Calendar,
  ArrowRight,
  MoreHorizontal,
  Loader2
} from 'lucide-react';
import { currency, formatDate, formatTime } from '@/lib/format';
import { apiGet } from '@/lib/api';

type Booking = {
  id: string;
  bookingCode: string;
  contactName: string;
  contactEmail: string;
  totalAmountVND: number;
  status: string;
  createdAt: string;
  flight: {
    flightNumber: string;
    route: {
      departure: { code: string };
      arrival: { code: string };
    };
  };
};

export function BookingHistory() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    apiGet<Booking[]>('/admin/bookings')
      .then((data) => {
        if (isMounted.current) {
          setBookings(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted.current) setLoading(false);
      });
    return () => { isMounted.current = false; };
  }, []);

  const filtered = bookings.filter(b => 
    b.bookingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.contactEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex h-64 items-center justify-center rounded-[32px] border border-dashed border-slate-200 bg-white">
      <Loader2 className="animate-spin text-brand-600" size={32} />
    </div>
  );

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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm mã đặt vé, tên, email..." 
              className="h-12 w-full rounded-2xl bg-white border border-slate-200 pl-12 pr-4 text-sm font-bold outline-none focus:border-brand-500 shadow-sm transition-all"
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
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mã đặt vé / Khách hàng</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Chuyến bay</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ngày đặt</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tổng tiền</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest"></th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
               {filtered.map((booking) => (
                 <tr key={booking.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-8 py-5">
                       <div>
                          <p className="text-sm font-black text-brand-600">#{booking.bookingCode}</p>
                          <p className="text-sm font-bold text-ink mt-0.5">{booking.contactName}</p>
                          <p className="text-[10px] font-medium text-slate-400">{booking.contactEmail}</p>
                       </div>
                    </td>
                    <td className="px-8 py-5">
                       <p className="text-sm font-black text-ink">{booking.flight.flightNumber}</p>
                       <p className="text-[10px] font-bold text-slate-400 uppercase">{booking.flight.route.departure.code} → {booking.flight.route.arrival.code}</p>
                    </td>
                    <td className="px-8 py-5 text-sm font-bold text-ink">
                       {formatDate(booking.createdAt)}
                    </td>
                    <td className="px-8 py-5 text-sm font-black text-ink">
                       {currency.format(Number(booking.totalAmountVND))}
                    </td>
                    <td className="px-8 py-5">
                       <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${
                         booking.status === 'PAID' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                         booking.status === 'CONFIRMED' ? 'bg-brand-50 text-brand-600 border-brand-100' :
                         booking.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                         'bg-rose-50 text-rose-600 border-rose-100'
                       }`}>
                          {booking.status}
                       </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                       <button className="p-2 text-slate-400 hover:text-ink"><MoreHorizontal size={20} /></button>
                    </td>
                 </tr>
               ))}
               {filtered.length === 0 && (
                 <tr>
                    <td colSpan={6} className="px-8 py-20 text-center text-slate-400 font-medium">
                       Không tìm thấy lượt đặt vé nào.
                    </td>
                 </tr>
               )}
            </tbody>
         </table>
      </div>
    </motion.div>
  );
}
