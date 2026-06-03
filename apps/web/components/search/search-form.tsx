'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { CalendarDays, MapPin, UsersRound, ArrowRightLeft, Search, Loader2 } from 'lucide-react';

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
    // Reset loading after a bit in case we are already on the search page
    setTimeout(() => setLoading(false), 2000);
  }

  function swap() {
    setFrom(to);
    setTo(from);
  }

  return (
    <form onSubmit={handleSearch} className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr]">
        <div className="relative">
          <label className="mb-1.5 block text-xs font-bold text-slate-500 uppercase">Điểm đi</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 text-slate-400" size={18} />
            <select
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="h-12 w-full appearance-none rounded border border-slate-300 bg-white pl-10 pr-4 text-sm font-semibold text-ink outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
            >
              {airports.map((ap) => (
                <option key={ap.code} value={ap.code}>
                  {ap.city} ({ap.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-end pb-1.5 md:pb-0">
          <button
            type="button"
            onClick={swap}
            className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-400 hover:border-brand-200 hover:text-brand-600 md:mb-1"
          >
            <ArrowRightLeft size={18} />
          </button>
        </div>

        <div className="relative">
          <label className="mb-1.5 block text-xs font-bold text-slate-500 uppercase">Điểm đến</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 text-slate-400" size={18} />
            <select
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="h-12 w-full appearance-none rounded border border-slate-300 bg-white pl-10 pr-4 text-sm font-semibold text-ink outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
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

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-xs font-bold text-slate-500 uppercase">Ngày đi</label>
          <div className="relative">
            <CalendarDays className="absolute left-3 top-3 text-slate-400" size={18} />
            <input
              type="date"
              value={date}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setDate(e.target.value)}
              className="h-12 w-full rounded border border-slate-300 bg-white pl-10 pr-4 text-sm font-semibold text-ink outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold text-slate-500 uppercase">Hành khách</label>
          <div className="relative">
            <UsersRound className="absolute left-3 top-3 text-slate-400" size={18} />
            <select
              value={adults}
              onChange={(e) => setAdults(e.target.value)}
              className="h-12 w-full appearance-none rounded border border-slate-300 bg-white pl-10 pr-4 text-sm font-semibold text-ink outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                <option key={n} value={n}>
                  {n} người lớn
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold text-slate-500 uppercase">Hạng ghế</label>
          <select
            value={classType}
            onChange={(e) => setClassType(e.target.value)}
            className="h-12 w-full appearance-none rounded border border-slate-300 bg-white px-4 text-sm font-semibold text-ink outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
          >
            <option value="ECONOMY">Phổ thông</option>
            <option value="BUSINESS">Thương gia</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded bg-coral font-bold text-white transition hover:bg-[#df4f43] disabled:opacity-70"
      >
        {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
        Tìm chuyến bay
      </button>
    </form>
  );
}
