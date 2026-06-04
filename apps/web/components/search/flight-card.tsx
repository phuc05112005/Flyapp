'use client';

import Link from 'next/link';
import { CircleCheck, Luggage, PlaneTakeoff, Timer, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { FlightResult } from '@/lib/api';
import { currency, formatDuration, formatTime } from '@/lib/format';

export function FlightCard({ flight }: { flight: FlightResult }) {
  return (
    <motion.article 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, shadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-brand-300"
    >
      <div className="absolute top-0 right-0 p-2">
         {flight.availableSeats < 5 && (
           <span className="flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-bold text-orange-600 uppercase tracking-tighter">
             <Zap size={10} fill="currentColor" /> Sắp hết ghế
           </span>
         )}
      </div>

      <div className="grid gap-8 lg:grid-cols-[200px_1fr_220px] lg:items-center">
        {/* Airline Info */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 font-black text-brand-600 text-xl shadow-inner group-hover:bg-brand-50 group-hover:border-brand-100 transition-colors">
              {flight.airline.code}
            </div>
            <div>
              <p className="font-bold text-ink text-lg leading-tight">{flight.airline.name}</p>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">{flight.flightNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
             <span className="rounded-md bg-slate-100 px-2 py-1">{flight.aircraft ?? 'Airbus A321'}</span>
             <span className="h-1 w-1 rounded-full bg-slate-300"></span>
             <span className="text-emerald-600 flex items-center gap-1"><ShieldCheck size={12} /> Đảm bảo giá tốt</span>
          </div>
        </div>

        {/* Journey Details */}
        <div>
          <div className="flex items-center justify-between gap-4">
            <div className="text-center lg:text-left">
              <p className="text-3xl font-black text-ink tracking-tight">{formatTime(flight.departureTime)}</p>
              <p className="mt-1 text-sm font-bold text-slate-400">{flight.route.departure.code}</p>
              <p className="text-[10px] text-slate-400 font-medium uppercase mt-1 truncate max-w-[80px]">Hà Nội</p>
            </div>

            <div className="relative flex flex-1 flex-col items-center px-4">
              <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-4 py-1 text-[11px] font-bold text-slate-500 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                <Timer size={14} /> {formatDuration(flight.durationMin)}
              </p>
              
              <div className="relative w-full">
                <div className="h-[2px] w-full bg-slate-200"></div>
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  className="absolute top-0 left-0 h-[2px] bg-brand-400"
                ></motion.div>
                <div className="absolute left-0 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-brand-400 bg-white"></div>
                <div className="absolute right-0 top-1/2 h-2 w-2 translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-600 shadow-[0_0_10px_rgba(37,99,235,0.4)]"></div>
                <PlaneTakeoff size={18} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[150%] text-brand-500 opacity-20 group-hover:opacity-100 transition-opacity" />
              </div>
              
              <p className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bay thẳng</p>
            </div>

            <div className="text-center lg:text-right">
              <p className="text-3xl font-black text-ink tracking-tight">{formatTime(flight.arrivalTime)}</p>
              <p className="mt-1 text-sm font-bold text-slate-400">{flight.route.arrival.code}</p>
              <p className="text-[10px] text-slate-400 font-medium uppercase mt-1 truncate max-w-[80px]">TP. HCM</p>
            </div>
          </div>
          
          <div className="mt-6 flex flex-wrap gap-3">
             <InfoBadge icon={<Luggage size={14} />} text={`${flight.baggageKg}kg hành lý`} />
             <InfoBadge 
               icon={<CircleCheck size={14} />} 
               text={`Còn ${flight.availableSeats} ghế`} 
               highlight={flight.availableSeats < 10}
             />
             <InfoBadge text={flight.classType === 'BUSINESS' ? 'Thương gia' : 'Phổ thông'} primary />
          </div>
        </div>

        {/* Price & Action */}
        <div className="relative flex flex-col items-stretch rounded-2xl bg-slate-50/80 p-6 lg:items-end group-hover:bg-brand-50/30 transition-colors">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Tổng cộng mỗi khách</p>
          <div className="mt-1 flex items-baseline gap-1">
             <p className="text-3xl font-black text-coral">{currency.format(flight.displayPriceVND).split(' ')[0]}</p>
             <span className="text-sm font-bold text-coral">VND</span>
          </div>
          <p className="mt-1 text-[10px] font-medium text-slate-400 italic">Đã bao gồm đầy đủ thuế & phí</p>
          
          <Link 
            href={`/booking?flightId=${flight.id}&classType=${flight.classType}`} 
            className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 font-bold text-white shadow-lg shadow-brand-100 transition-all hover:bg-brand-700 hover:shadow-brand-200 active:scale-95"
          >
            Chọn chuyến bay <Zap size={16} fill="currentColor" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

function InfoBadge({ icon, text, highlight = false, primary = false }: { icon?: React.ReactNode; text: string; highlight?: boolean; primary?: boolean }) {
  return (
    <span className={`
      inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold transition-colors
      ${primary ? 'bg-brand-600 text-white' : 
        highlight ? 'bg-orange-100 text-orange-700' : 
        'bg-slate-100 text-slate-600 group-hover:bg-white'}
    `}>
      {icon} {text}
    </span>
  );
}
