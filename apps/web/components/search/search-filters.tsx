'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { FilterX } from 'lucide-react';

const airlines = [
  { code: '', label: 'Tất cả hãng' },
  { code: 'VN', label: 'Vietnam Airlines' },
  { code: 'VJ', label: 'VietJet Air' },
  { code: 'QH', label: 'Bamboo Airways' },
  { code: 'VU', label: 'Vietravel Airlines' },
  { code: 'BL', label: 'Pacific Airlines' }
];

const timeSlots = [
  { code: '', label: 'Cả ngày' },
  { code: 'morning', label: 'Sáng 06:00 - 12:00' },
  { code: 'afternoon', label: 'Chiều 12:00 - 18:00' },
  { code: 'evening', label: 'Tối 18:00 - 23:59' }
];

export function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function update(key: string, value: string | boolean) {
    const params = new URLSearchParams(searchParams.toString());
    if (typeof value === 'boolean') {
      if (value) params.set(key, '1');
      else params.delete(key);
    } else if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/search?${params.toString()}`);
  }

  function reset() {
    const keep = new URLSearchParams();
    for (const key of ['from', 'to', 'date', 'adults', 'classType']) {
      const value = searchParams.get(key);
      if (value) keep.set(key, value);
    }
    router.push(`/search?${keep.toString()}`);
  }

  return (
    <div className="grid gap-5 text-sm text-slate-600">
      <label className="grid gap-2 font-semibold text-ink">
        Hãng bay
        <select value={searchParams.get('airline') ?? ''} onChange={(event) => update('airline', event.target.value)} className="h-10 rounded border border-slate-300 bg-white px-3 font-medium text-slate-700 outline-none focus:border-brand-600">
          {airlines.map((airline) => (
            <option key={airline.code || 'all'} value={airline.code}>{airline.label}</option>
          ))}
        </select>
      </label>

      <label className="grid gap-2 font-semibold text-ink">
        Giờ khởi hành
        <select value={searchParams.get('time') ?? ''} onChange={(event) => update('time', event.target.value)} className="h-10 rounded border border-slate-300 bg-white px-3 font-medium text-slate-700 outline-none focus:border-brand-600">
          {timeSlots.map((slot) => (
            <option key={slot.code || 'all'} value={slot.code}>{slot.label}</option>
          ))}
        </select>
      </label>

      <div className="grid gap-2">
        <p className="font-semibold text-ink">Tiện ích</p>
        <Toggle label="Có hành lý ký gửi" checked={searchParams.get('baggage') === '1'} onChange={(checked) => update('baggage', checked)} />
        <Toggle label="Còn từ 20 ghế" checked={searchParams.get('seats') === '1'} onChange={(checked) => update('seats', checked)} />
      </div>

      <button type="button" onClick={reset} className="btn-secondary h-10 w-full text-sm">
        <FilterX size={16} /> Xóa bộ lọc
      </button>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded border border-slate-200 bg-slate-50 px-3 py-2 font-medium text-slate-700">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 rounded border-slate-300 text-brand-600" />
      {label}
    </label>
  );
}
