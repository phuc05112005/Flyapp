'use client';

import { useEffect, useState, useMemo } from 'react';
import { Armchair, Info, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiGet } from '@/lib/api';
import { toast } from 'sonner';
import { currency } from '@/lib/format';

type SeatTier = {
  name: string;
  priceVND: number;
  rows: number[];
  color: string;
};

type SeatLayout = {
  rows: number;
  cols: string[];
  aisleAfter: number[];
};

type SeatData = {
  occupiedSeats: string[];
  layout: SeatLayout;
  aircraftType?: string;
  seatTiers: SeatTier[];
};

interface SeatSelectionProps {
  flightId: string;
  passengerCount: number;
  onSelect: (seats: { id: string; price: number }[]) => void;
  selectedSeats: { id: string; price: number }[];
}

export function SeatSelection({ flightId, passengerCount, onSelect, selectedSeats }: SeatSelectionProps) {
  const [data, setData] = useState<SeatData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiGet<SeatData>(`/flights/${flightId}/seats`)
      .then((res) => {
        const layout = {
          ...res.layout,
          aisleAfter: Array.isArray(res.layout.aisleAfter) ? res.layout.aisleAfter : [res.layout.aisleAfter]
        };
        setData({ ...res, layout });
      })
      .catch(() => {
        setData({
          occupiedSeats: ['1A', '5C', '10F', '12B'],
          layout: { rows: 30, cols: ['A', 'B', 'C', 'D', 'E', 'F'], aisleAfter: [3] },
          aircraftType: 'Airbus A321',
          seatTiers: [
            { name: 'Standard', priceVND: 0, rows: Array.from({ length: 21 }, (_, i) => i + 10), color: '#cbd5e1' },
            { name: 'Preferred', priceVND: 50000, rows: [5, 6, 7, 8, 9], color: '#3b82f6' },
            { name: 'Extra Legroom', priceVND: 150000, rows: [1, 2, 3, 4], color: '#f59e0b' }
          ]
        });
      })
      .finally(() => setLoading(false));
  }, [flightId]);

  const toggleSeat = (seatId: string, price: number) => {
    if (data?.occupiedSeats.includes(seatId)) return;

    const isSelected = selectedSeats.some(s => s.id === seatId);
    if (isSelected) {
      onSelect(selectedSeats.filter((s) => s.id !== seatId));
    } else {
      if (selectedSeats.length < passengerCount) {
        onSelect([...selectedSeats, { id: seatId, price }]);
      } else {
        toast.info(`Bạn đã chọn đủ ${passengerCount} chỗ ngồi.`);
      }
    }
  };

  const getSeatTier = (row: number) => {
    return data?.seatTiers.find(tier => tier.rows.includes(row)) || data?.seatTiers[0];
  };

  if (loading) return (
    <div className="flex h-64 items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white">
      <Loader2 className="animate-spin text-brand-600" />
    </div>
  );

  if (!data) return null;

  return (
    <div className="relative overflow-hidden rounded-[40px] border border-slate-200 bg-white p-6 shadow-sm md:p-12">
      <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div>
           <h3 className="text-2xl font-black text-ink flex items-center gap-3">
             <Armchair className="text-brand-600" size={28} />
             Chọn chỗ ngồi ưu thích
           </h3>
           <p className="mt-2 text-slate-500 font-medium">Chọn ghế cho {passengerCount} hành khách. Giá ghế tùy thuộc vào vị trí.</p>
        </div>
        <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4 border border-slate-100">
           <div className="text-center border-r border-slate-200 pr-4">
              <p className="text-[10px] font-black uppercase text-slate-400">Đã chọn</p>
              <p className="text-xl font-black text-brand-600">{selectedSeats.length}/{passengerCount}</p>
           </div>
           <div className="text-center pl-2">
              <p className="text-[10px] font-black uppercase text-slate-400">Phụ phí ghế</p>
              <p className="text-xl font-black text-coral">
                {currency.format(selectedSeats.reduce((acc, s) => acc + s.price, 0))}
              </p>
           </div>
        </div>
      </div>

      <div className="grid gap-12 lg:grid-cols-[1fr_280px]">
        {/* Airplane Layout */}
        <div className="perspective-1000 overflow-x-auto pb-8">
           <div className="mx-auto min-w-[320px] max-w-md flex flex-col items-center">
              {/* Nose */}
              <div className="w-full max-w-[280px]">
                 <svg viewBox="0 0 280 100" className="drop-shadow-lg">
                    <path d="M20 100 C 20 20, 80 0, 140 0 C 200 0, 260 20, 260 100" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" />
                    <text x="140" y="70" textAnchor="middle" fill="#94a3b8" className="text-[10px] font-black uppercase tracking-[0.3em]">Khoang lái</text>
                 </svg>
              </div>

              {/* Body */}
              <div className="w-full max-w-[280px] border-x-2 border-slate-200 bg-white py-10 relative">
                 <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 to-transparent pointer-events-none"></div>
                 <div className="relative z-10 flex flex-col gap-3 px-4">
                    {Array.from({ length: data.layout.rows }).map((_, rowIndex) => {
                      const rowNum = rowIndex + 1;
                      const tier = getSeatTier(rowNum);
                      return (
                        <div key={rowNum} className="flex items-center justify-center gap-2">
                          <div className="w-5 text-right text-[10px] font-bold text-slate-300">{rowNum}</div>
                          <div className="flex gap-1.5">
                             {data.layout.cols.map((col, colIndex) => {
                               const seatId = `${rowNum}${col}`;
                               const isOccupied = data.occupiedSeats.includes(seatId);
                               const isSelected = selectedSeats.some(s => s.id === seatId);
                               const isAisle = data.layout.aisleAfter.includes(colIndex + 1);

                               return (
                                 <div key={col} className="flex items-center">
                                   <motion.button
                                     whileHover={!isOccupied ? { scale: 1.1, y: -2 } : {}}
                                     whileTap={!isOccupied ? { scale: 0.95 } : {}}
                                     type="button"
                                     disabled={isOccupied}
                                     onClick={() => toggleSeat(seatId, tier?.priceVND || 0)}
                                     className={`
                                       group relative flex h-8 w-8 items-center justify-center rounded-lg border-2 transition-all
                                       ${isOccupied ? 'border-slate-100 bg-slate-50 text-slate-200 cursor-not-allowed' : 
                                         isSelected ? 'border-brand-600 bg-brand-600 text-white shadow-lg' : 
                                         'border-slate-200 bg-white hover:border-brand-400'}
                                     `}
                                     style={!isSelected && !isOccupied ? { borderColor: tier?.color } : {}}
                                   >
                                      <Armchair size={14} className={isSelected ? 'fill-white/20' : ''} />
                                      <span className="absolute -top-10 left-1/2 z-20 -translate-x-1/2 scale-0 rounded-lg bg-slate-900 px-2 py-1 text-[10px] font-bold text-white transition-all group-hover:scale-100 shadow-xl whitespace-nowrap">
                                        {seatId} - {tier?.priceVND === 0 ? 'Miễn phí' : currency.format(tier?.priceVND || 0)}
                                      </span>
                                   </motion.button>
                                   {isAisle && <div className="w-5"></div>}
                                 </div>
                               );
                             })}
                          </div>
                        </div>
                      );
                    })}
                 </div>
              </div>

              {/* Tail */}
              <div className="w-full max-w-[280px]">
                 <svg viewBox="0 0 280 60">
                    <path d="M20 0 L260 0 L220 60 L60 60 Z" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" />
                 </svg>
              </div>
           </div>
        </div>

        {/* Legend & Info */}
        <div className="space-y-8">
           <div className="rounded-3xl bg-slate-50 p-6 border border-slate-100">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Loại chỗ ngồi</h4>
              <div className="space-y-4">
                 {data.seatTiers.map(tier => (
                    <div key={tier.name} className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="h-4 w-4 rounded-md shadow-sm" style={{ backgroundColor: tier.color }}></div>
                          <span className="text-sm font-bold text-ink">{tier.name}</span>
                       </div>
                       <span className="text-xs font-black text-brand-600">{tier.priceVND === 0 ? 'FREE' : `+ ${currency.format(tier.priceVND)}`}</span>
                    </div>
                 ))}
                 <div className="pt-4 border-t border-slate-200">
                    <div className="flex items-center gap-3">
                       <div className="h-4 w-4 rounded-md bg-slate-100 border border-slate-200"></div>
                       <span className="text-sm font-bold text-slate-400">Đã có người</span>
                    </div>
                 </div>
              </div>
           </div>

           <div className="rounded-3xl border border-brand-100 bg-brand-50 p-6">
              <div className="flex gap-3">
                 <Sparkles className="text-brand-600 shrink-0" size={20} />
                 <div>
                    <p className="text-sm font-black text-brand-900">Mẹo nhỏ</p>
                    <p className="mt-1 text-xs leading-relaxed text-brand-700/80 font-medium">
                      Hàng ghế đầu (Extra Legroom) sẽ giúp bạn thoải mái hơn trong các chuyến bay dài.
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function Loader2({ className }: { className?: string }) {
  return <div className={`h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-current ${className}`}></div>;
}
