'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { CalendarDays, MapPin, UsersRound, ArrowRightLeft, Search, Loader2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const airports = [
  { code: 'HAN', city: 'Hà Nội', name: 'Nội Bài' },
  { code: 'SGN', city: 'TP. Hồ Chí Minh', name: 'Tân Sơn Nhất' },
  { code: 'DAD', city: 'Đà Nẵng', name: 'Đà Nẵng' },
  { code: 'PQC', city: 'Phú Quốc', name: 'Phú Quốc' },
  { code: 'HPH', city: 'Hải Phòng', name: 'Cát Bi' },
  { code: 'CXR', city: 'Nha Trang', name: 'Cam Ranh' }
];

export function SearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [from, setFrom] = useState(searchParams.get('from') || 'HAN');
  const [to, setTo] = useState(searchParams.get('to') || 'SGN');
  const [date, setDate] = useState(searchParams.get('date') || new Date(Date.now() + 86400000).toISOString().slice(0, 10));
  const [adults, setAdults] = useState(searchParams.get('adults') || '1');
  const [classType, setClassType] = useState(searchParams.get('classType') || 'ECONOMY');
  const [loading, setLoading] = useState(false);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const query = new URLSearchParams({ from, to, date, adults, classType });
    router.push(`/search?${query.toString()}`);
    setTimeout(() => setLoading(false), 2000);
  }

  function swap() {
    setFrom(to);
    setTo(from);
  }

  return (
    <form onSubmit={handleSearch} className="grid gap-6">
      <div className="relative grid gap-4 lg:grid-cols-[1fr_auto_1fr]">
        <SearchField 
          label="Điểm đi" 
          icon={<MapPin size={18} />} 
          value={from} 
          onChange={setFrom} 
          options={airports} 
        />

        <div className="flex items-center justify-center lg:pt-6">
          <motion.button
            whileHover={{ rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            type="button"
            onClick={swap}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-brand-50 hover:text-brand-600 border border-white shadow-sm transition-all"
          >
            <ArrowRightLeft size={18} />
          </motion.button>
        </div>

        <SearchField 
          label="Điểm đến" 
          icon={<MapPin size={18} />} 
          value={to} 
          onChange={setTo} 
          options={airports} 
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="grid gap-1.5">
          <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 pl-1">Ngày đi</label>
          <div className="relative group">
            <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
            <input
              type="date"
              value={date}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setDate(e.target.value)}
              className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm font-bold text-ink outline-none focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 transition-all"
            />
          </div>
        </div>

        <div className="grid gap-1.5">
          <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 pl-1">Hành khách</label>
          <div className="relative group">
            <UsersRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
            <select
              value={adults}
              onChange={(e) => setAdults(e.target.value)}
              className="h-14 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm font-bold text-ink outline-none focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 transition-all"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                <option key={n} value={n}>
                  {n} hành khách
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-1.5">
          <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 pl-1">Hạng ghế</label>
          <div className="relative group">
             <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
             <select
              value={classType}
              onChange={(e) => setClassType(e.target.value)}
              className="h-14 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm font-bold text-ink outline-none focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 transition-all"
            >
              <option value="ECONOMY">Phổ thông</option>
              <option value="BUSINESS">Thương gia</option>
            </select>
          </div>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={loading}
        className="mt-2 flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-coral font-black text-white shadow-xl shadow-coral/20 transition-all hover:bg-[#df4f43] disabled:opacity-70"
      >
        {loading ? <Loader2 className="animate-spin" size={24} /> : (
          <>
            <Search size={22} strokeWidth={3} />
            TÌM CHUYẾN BAY NGAY
          </>
        )}
      </motion.button>
    </form>
  );
}

function SearchField({ label, icon, value, onChange, options }: any) {
  return (
    <div className="grid gap-1.5">
      <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 pl-1">{label}</label>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors">
          {icon}
        </div>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-14 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-10 text-sm font-bold text-ink outline-none focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 transition-all"
        >
          {options.map((ap: any) => (
            <option key={ap.code} value={ap.code}>
              {ap.city} ({ap.code})
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
           <Search size={14} />
        </div>
      </div>
    </div>
  );
}
