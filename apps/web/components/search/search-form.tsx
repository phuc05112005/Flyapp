'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { CalendarDays, MapPin, UsersRound, ArrowRightLeft, Search, Loader2, Sparkles, Repeat, ArrowRight, PlaneTakeoff, PlaneLanding } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const airports = [
  { code: 'HAN', city: 'Hà Nội', name: 'Nội Bài' },
  { code: 'SGN', city: 'TP. Hồ Chí Minh', name: 'Tân Sơn Nhất' },
  { code: 'DAD', city: 'Đà Nẵng', name: 'Đà Nẵng' },
  { code: 'PQC', city: 'Phú Quốc', name: 'Phú Quốc' },
  { code: 'HPH', city: 'Hải Phòng', name: 'Cát Bi' },
  { code: 'CXR', city: 'Nha Trang', name: 'Cam Ranh' },
  { code: 'VII', city: 'Vinh', name: 'Vinh' },
  { code: 'HUI', city: 'Huế', name: 'Phú Bài' }
];

export function SearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isRoundTrip, setIsRoundTrip] = useState(searchParams.get('isRoundTrip') === 'true');
  const [from, setFrom] = useState(searchParams.get('from') || 'HAN');
  const [to, setTo] = useState(searchParams.get('to') || 'SGN');
  const [departureDate, setDepartureDate] = useState(searchParams.get('date') || new Date(Date.now() + 86400000).toISOString().slice(0, 10));
  const [returnDate, setReturnDate] = useState(searchParams.get('returnDate') || new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10));
  const [adults, setAdults] = useState(searchParams.get('adults') || '1');
  const [classType, setClassType] = useState(searchParams.get('classType') || 'ECONOMY');
  const [loading, setLoading] = useState(false);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const params: any = { from, to, date: departureDate, adults, classType, isRoundTrip };
    if (isRoundTrip) params.returnDate = returnDate;
    
    const query = new URLSearchParams(params);
    router.push(`/search?${query.toString()}`);
    setTimeout(() => setLoading(false), 2000);
  }

  function swap() {
    setFrom(to);
    setTo(from);
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      <form onSubmit={handleSearch} className="flex flex-col gap-6">
        {/* Trip Type Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex p-1.5 bg-slate-100/80 backdrop-blur rounded-[20px] w-fit border border-slate-200/50 shadow-inner">
            <button
              type="button"
              onClick={() => setIsRoundTrip(false)}
              className={`flex items-center gap-2.5 px-6 py-2.5 rounded-[14px] text-xs font-black tracking-tight transition-all duration-300 ${!isRoundTrip ? 'bg-white text-brand-600 shadow-md shadow-brand-100/50 border border-brand-100' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <ArrowRight size={14} strokeWidth={3} /> MỘT CHIỀU
            </button>
            <button
              type="button"
              onClick={() => setIsRoundTrip(true)}
              className={`flex items-center gap-2.5 px-6 py-2.5 rounded-[14px] text-xs font-black tracking-tight transition-all duration-300 ${isRoundTrip ? 'bg-white text-brand-600 shadow-md shadow-brand-100/50 border border-brand-100' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <Repeat size={14} strokeWidth={3} /> KHỨ HỒI
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 text-brand-600 font-bold text-xs uppercase tracking-widest bg-brand-50/50 px-4 py-2 rounded-full border border-brand-100">
             <Sparkles size={14} fill="currentColor" />
             Ưu đãi đặt sớm -15%
          </div>
        </div>

        {/* Location Selection Area */}
        <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr] items-center">
          <div className="group relative transition-all duration-300">
            <div className="absolute -top-3 left-6 z-10 bg-white px-2 py-0.5 rounded-full border border-slate-200 shadow-sm transition-all group-focus-within:border-brand-300">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] group-focus-within:text-brand-600">Điểm đi</p>
            </div>
            <div className="relative overflow-hidden rounded-[24px] border-2 border-slate-100 bg-slate-50/30 transition-all group-focus-within:border-brand-500 group-focus-within:bg-white group-focus-within:ring-8 group-focus-within:ring-brand-500/5 group-hover:border-slate-200">
              <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={20} />
              <select
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="h-[72px] w-full appearance-none bg-transparent pl-16 pr-8 text-lg font-black text-ink outline-none cursor-pointer"
              >
                {airports.map((ap) => (
                  <option key={ap.code} value={ap.code}>
                    {ap.city} ({ap.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-center -my-2 lg:my-0 lg:-mx-2 z-20">
            <motion.button
              whileHover={{ rotate: 180, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              type="button"
              onClick={swap}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-brand-600 border-2 border-slate-100 shadow-xl shadow-slate-200/50 hover:border-brand-200 transition-all"
            >
              <ArrowRightLeft size={20} strokeWidth={2.5} />
            </motion.button>
          </div>

          <div className="group relative transition-all duration-300">
            <div className="absolute -top-3 left-6 z-10 bg-white px-2 py-0.5 rounded-full border border-slate-200 shadow-sm transition-all group-focus-within:border-brand-300">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] group-focus-within:text-brand-600">Điểm đến</p>
            </div>
            <div className="relative overflow-hidden rounded-[24px] border-2 border-slate-100 bg-slate-50/30 transition-all group-focus-within:border-brand-500 group-focus-within:bg-white group-focus-within:ring-8 group-focus-within:ring-brand-500/5 group-hover:border-slate-200">
              <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={20} />
              <select
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="h-[72px] w-full appearance-none bg-transparent pl-16 pr-8 text-lg font-black text-ink outline-none cursor-pointer"
              >
                {airports.map((ap) => (
                  <option key={ap.code} value={ap.code}>
                    {ap.city} ({ap.code})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Date and Passenger Selection */}
        <div className="grid gap-4 lg:grid-cols-12">
          {/* Departure Date */}
          <div className={`${isRoundTrip ? 'lg:col-span-3' : 'lg:col-span-4'} group relative transition-all duration-300`}>
            <div className="absolute -top-3 left-6 z-10 bg-white px-2 py-0.5 rounded-full border border-slate-200 shadow-sm">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] group-focus-within:text-brand-600">Ngày đi</p>
            </div>
            <div className="relative overflow-hidden rounded-[24px] border-2 border-slate-100 bg-slate-50/30 transition-all group-focus-within:border-brand-500 group-focus-within:bg-white group-focus-within:ring-8 group-focus-within:ring-brand-500/5 group-hover:border-slate-200">
              <PlaneTakeoff className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
              <input
                type="date"
                value={departureDate}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="h-[68px] w-full bg-transparent pl-16 pr-6 text-sm font-black text-ink outline-none cursor-pointer"
              />
            </div>
          </div>

          {/* Return Date (Conditional) */}
          <AnimatePresence>
            {isRoundTrip && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="lg:col-span-3 group relative transition-all duration-300"
              >
                <div className="absolute -top-3 left-6 z-10 bg-white px-2 py-0.5 rounded-full border border-slate-200 shadow-sm">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] group-focus-within:text-brand-600">Ngày về</p>
                </div>
                <div className="relative overflow-hidden rounded-[24px] border-2 border-slate-100 bg-slate-50/30 transition-all group-focus-within:border-brand-500 group-focus-within:bg-white group-focus-within:ring-8 group-focus-within:ring-brand-500/5 group-hover:border-slate-200">
                  <PlaneLanding className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
                  <input
                    type="date"
                    value={returnDate}
                    min={departureDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="h-[68px] w-full bg-transparent pl-16 pr-6 text-sm font-black text-ink outline-none cursor-pointer"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Passengers */}
          <div className={`${isRoundTrip ? 'lg:col-span-3' : 'lg:col-span-4'} group relative transition-all duration-300`}>
            <div className="absolute -top-3 left-6 z-10 bg-white px-2 py-0.5 rounded-full border border-slate-200 shadow-sm">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] group-focus-within:text-brand-600">Hành khách</p>
            </div>
            <div className="relative overflow-hidden rounded-[24px] border-2 border-slate-100 bg-slate-50/30 transition-all group-focus-within:border-brand-500 group-focus-within:bg-white group-focus-within:ring-8 group-focus-within:ring-brand-500/5 group-hover:border-slate-200">
              <UsersRound className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
              <select
                value={adults}
                onChange={(e) => setAdults(e.target.value)}
                className="h-[68px] w-full appearance-none bg-transparent pl-16 pr-8 text-sm font-black text-ink outline-none cursor-pointer"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                  <option key={n} value={n}>
                    {n} người lớn
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Class Type */}
          <div className={`${isRoundTrip ? 'lg:col-span-3' : 'lg:col-span-4'} group relative transition-all duration-300`}>
            <div className="absolute -top-3 left-6 z-10 bg-white px-2 py-0.5 rounded-full border border-slate-200 shadow-sm">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] group-focus-within:text-brand-600">Hạng vé</p>
            </div>
            <div className="relative overflow-hidden rounded-[24px] border-2 border-slate-100 bg-slate-50/30 transition-all group-focus-within:border-brand-500 group-focus-within:bg-white group-focus-within:ring-8 group-focus-within:ring-brand-500/5 group-hover:border-slate-200">
              <Sparkles className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
              <select
                value={classType}
                onChange={(e) => setClassType(e.target.value)}
                className="h-[68px] w-full appearance-none bg-transparent pl-16 pr-8 text-sm font-black text-ink outline-none cursor-pointer"
              >
                <option value="ECONOMY">Phổ thông</option>
                <option value="BUSINESS">Thương gia</option>
              </select>
            </div>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="mt-4 flex h-[72px] w-full items-center justify-center gap-4 rounded-[28px] bg-coral font-black text-xl text-white shadow-2xl shadow-coral/30 transition-all hover:bg-[#df4f43] disabled:opacity-70 active:shadow-lg"
        >
          {loading ? <Loader2 className="animate-spin" size={32} strokeWidth={3} /> : (
            <>
              <Search size={28} strokeWidth={3} />
              TÌM CHUYẾN BAY NGAY
            </>
          )}
        </motion.button>
      </form>
    </div>
  );
}
