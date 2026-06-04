'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plane, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Calendar, 
  MapPin, 
  ArrowRight,
  Edit2,
  Trash2,
  ChevronDown
} from 'lucide-react';
import { currency, formatDate, formatTime } from '@/lib/format';

const MOCK_FLIGHTS = [
  { id: '1', number: 'VN317', airline: 'Vietnam Airlines', from: 'HAN', to: 'SGN', departure: '2026-06-10T07:20:00', arrival: '2026-06-10T09:30:00', price: 1250000, status: 'SCHEDULED' },
  { id: '2', number: 'VJ122', airline: 'VietJet Air', from: 'SGN', to: 'DAD', departure: '2026-06-10T10:45:00', arrival: '2026-06-10T12:05:00', price: 890000, status: 'SCHEDULED' },
  { id: '3', number: 'QH450', airline: 'Bamboo Airways', from: 'HAN', to: 'PQC', departure: '2026-06-10T15:00:00', arrival: '2026-06-10T17:10:00', price: 2100000, status: 'DELAYED' },
];

export function FlightManagement() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm chuyến bay, số hiệu..." 
              className="h-12 w-full rounded-2xl bg-white border border-slate-200 pl-12 pr-4 text-sm font-bold outline-none focus:border-brand-500 transition-all shadow-sm"
            />
         </div>
         <div className="flex items-center gap-3">
            <button className="flex h-12 items-center gap-2 px-6 rounded-2xl bg-white border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
               <Filter size={18} />
               <span>Bộ lọc</span>
            </button>
            <button className="flex h-12 items-center gap-2 px-6 rounded-2xl bg-brand-600 font-black text-white hover:bg-brand-700 transition-all shadow-lg shadow-brand-100">
               <Plus size={18} strokeWidth={3} />
               <span>Tạo chuyến bay</span>
            </button>
         </div>
      </div>

      {/* Flight List */}
      <div className="rounded-[32px] border border-slate-200 bg-white overflow-hidden shadow-sm">
         <table className="w-full text-left border-collapse">
            <thead>
               <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Chuyến bay</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Lộ trình</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Thời gian</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Giá cơ bản</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tác vụ</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
               {MOCK_FLIGHTS.map((flight) => (
                 <tr key={flight.id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-8 py-5">
                       <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-brand-600 text-xs">{flight.number.slice(0,2)}</div>
                          <div>
                             <p className="text-sm font-black text-ink">{flight.number}</p>
                             <p className="text-[10px] font-bold text-slate-400">{flight.airline}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex items-center gap-2 font-black text-ink">
                          <span>{flight.from}</span>
                          <ArrowRight size={14} className="text-slate-300" />
                          <span>{flight.to}</span>
                       </div>
                    </td>
                    <td className="px-8 py-5">
                       <p className="text-sm font-black text-ink">{formatTime(flight.departure)}</p>
                       <p className="text-[10px] font-bold text-slate-400">{formatDate(flight.departure)}</p>
                    </td>
                    <td className="px-8 py-5">
                       <p className="text-sm font-black text-brand-600">{currency.format(flight.price)}</p>
                    </td>
                    <td className="px-8 py-5">
                       <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${flight.status === 'SCHEDULED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                          {flight.status}
                       </span>
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 rounded-lg hover:bg-white hover:shadow-md text-slate-400 hover:text-brand-600 transition-all">
                             <Edit2 size={16} />
                          </button>
                          <button className="p-2 rounded-lg hover:bg-white hover:shadow-md text-slate-400 hover:text-rose-500 transition-all">
                             <Trash2 size={16} />
                          </button>
                       </div>
                    </td>
                 </tr>
               ))}
            </tbody>
         </table>
      </div>
    </motion.div>
  );
}
