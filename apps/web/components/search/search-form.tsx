'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRightLeft, CalendarDays, Search, UsersRound } from 'lucide-react';

const airports = [
  ['HAN', 'Hà Nội'],
  ['SGN', 'TP.HCM'],
  ['DAD', 'Đà Nẵng'],
  ['PQC', 'Phú Quốc']
];

export function SearchForm() {
  const router = useRouter();
  const [from, setFrom] = useState('HAN');
  const [to, setTo] = useState('SGN');
  const [date, setDate] = useState(() => new Date(Date.now() + 86400000).toISOString().slice(0, 10));
  const [adults, setAdults] = useState(1);
  const [classType, setClassType] = useState('ECONOMY');

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams({ from, to, date, adults: String(adults), classType });
    router.push(`/search?${params.toString()}`);
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr]">
        <SelectField label="Điểm đi" value={from} onChange={setFrom} />
        <button
          type="button"
          aria-label="Hoán đổi điểm đi và điểm đến"
          onClick={() => { setFrom(to); setTo(from); }}
          className="mt-6 grid h-11 w-full place-items-center rounded border border-slate-300 bg-white text-slate-600 transition hover:border-brand-500 hover:text-brand-700 sm:w-11"
        >
          <ArrowRightLeft size={18} />
        </button>
        <SelectField label="Điểm đến" value={to} onChange={setTo} />
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_120px_1fr]">
        <label className="grid gap-1 text-sm font-medium text-slate-700">
          Ngày bay
          <span className="relative">
            <CalendarDays className="pointer-events-none absolute left-3 top-3 text-slate-400" size={18} />
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="h-11 w-full rounded border border-slate-300 bg-white pl-10 pr-3 outline-none transition focus:border-brand-600" />
          </span>
        </label>
        <label className="grid gap-1 text-sm font-medium text-slate-700">
          Khách
          <span className="relative">
            <UsersRound className="pointer-events-none absolute left-3 top-3 text-slate-400" size={18} />
            <input type="number" min={1} max={9} value={adults} onChange={(event) => setAdults(Number(event.target.value))} className="h-11 w-full rounded border border-slate-300 bg-white pl-10 pr-3 outline-none transition focus:border-brand-600" />
          </span>
        </label>
        <label className="grid gap-1 text-sm font-medium text-slate-700">
          Hạng ghế
          <select value={classType} onChange={(event) => setClassType(event.target.value)} className="h-11 rounded border border-slate-300 bg-white px-3 outline-none transition focus:border-brand-600">
            <option value="ECONOMY">Phổ thông</option>
            <option value="BUSINESS">Thương gia</option>
          </select>
        </label>
      </div>

      <button className="flex h-12 items-center justify-center gap-2 rounded bg-coral px-4 font-semibold text-white shadow-sm transition hover:bg-[#df4f43]">
        <Search size={18} /> Tìm chuyến bay
      </button>
    </form>
  );
}

function SelectField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-1 text-sm font-medium text-slate-700">
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)} className="h-11 rounded border border-slate-300 bg-white px-3 outline-none transition focus:border-brand-600">
        {airports.map(([code, city]) => (
          <option key={code} value={code}>{city} ({code})</option>
        ))}
      </select>
    </label>
  );
}
