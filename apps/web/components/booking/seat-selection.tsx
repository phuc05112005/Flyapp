'use client';

import { useEffect, useState, useMemo } from 'react';
import { Armchair, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiGet } from '@/lib/api';
import { toast } from 'sonner';

type SeatLayout = {
  rows: number;
  cols: string[];
  aisleAfter: number[]; // Change to array for multiple aisles (wide body)
};

type SeatData = {
  occupiedSeats: string[];
  layout: SeatLayout;
  aircraftType?: string;
};

interface SeatSelectionProps {
  flightId: string;
  passengerCount: number;
  onSelect: (seats: string[]) => void;
  selectedSeats: string[];
}

export function SeatSelection({ flightId, passengerCount, onSelect, selectedSeats }: SeatSelectionProps) {
  const [data, setData] = useState<SeatData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Mocking the API response if it fails or extending it
    apiGet<SeatData>(`/flights/${flightId}/seats`)
      .then((res) => {
        // Ensure aisleAfter is an array (backward compatibility)
        const layout = {
          ...res.layout,
          aisleAfter: Array.isArray(res.layout.aisleAfter) ? res.layout.aisleAfter : [res.layout.aisleAfter]
        };
        setData({ ...res, layout });
      })
      .catch(() => {
        // Fallback for demo
        setData({
          occupiedSeats: ['1A', '5C', '10F', '12B'],
          layout: {
            rows: 30,
            cols: ['A', 'B', 'C', 'D', 'E', 'F'],
            aisleAfter: [3]
          },
          aircraftType: 'Airbus A321'
        });
      })
      .finally(() => setLoading(false));
  }, [flightId]);

  const toggleSeat = (seatId: string) => {
    if (data?.occupiedSeats.includes(seatId)) return;

    if (selectedSeats.includes(seatId)) {
      onSelect(selectedSeats.filter((s) => s !== seatId));
    } else {
      if (selectedSeats.length < passengerCount) {
        onSelect([...selectedSeats, seatId]);
      } else {
        toast.info(`Bạn đã chọn đủ ${passengerCount} chỗ ngồi. Hãy bỏ chọn bớt nếu muốn thay đổi.`);
      }
    }
  };

  if (loading) return (
    <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/50 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600"></div>
        <p className="text-sm font-medium text-slate-500">Đang chuẩn bị sơ đồ máy bay...</p>
      </div>
    </div>
  );

  if (!data) return null;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-50/50 p-4 shadow-inner md:p-8">
      {/* Aircraft Info Header */}
      <div className="mb-10 flex flex-col items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-sm md:flex-row">
        <div>
          <h3 className="text-lg font-bold text-ink flex items-center gap-2">
            Sơ đồ chỗ ngồi
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
              {data.aircraftType || 'Airbus A321neo'}
            </span>
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Chọn {passengerCount} ghế cho hành khách của bạn.
          </p>
        </div>
        <div className="flex gap-2">
           <div className="flex flex-col items-center rounded-xl bg-slate-50 px-4 py-2 border border-slate-100">
             <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Đã chọn</span>
             <span className="text-xl font-black text-brand-600">{selectedSeats.length}/{passengerCount}</span>
           </div>
        </div>
      </div>

      {/* Realistic Airplane Visualization */}
      <div className="mx-auto max-w-md perspective-1000">
        <div className="relative flex flex-col items-center">
          
          {/* Cockpit / Nose */}
          <div className="relative z-10 w-full max-w-[280px]">
             <svg viewBox="0 0 280 120" className="drop-shadow-xl">
               <path 
                 d="M20 120 C 20 40, 60 0, 140 0 C 220 0, 260 40, 260 120" 
                 fill="white" 
                 stroke="#e2e8f0" 
                 strokeWidth="2"
               />
               <path 
                 d="M100 60 Q 140 40, 180 60" 
                 fill="none" 
                 stroke="#cbd5e1" 
                 strokeWidth="3" 
                 strokeLinecap="round"
               />
               <text x="140" y="90" textAnchor="middle" fill="#94a3b8" className="text-[10px] font-bold uppercase tracking-[0.2em]">Khoang lái</text>
             </svg>
          </div>

          {/* Main Cabin Body */}
          <div className="relative -mt-1 w-full max-w-[280px] border-x-2 border-slate-200 bg-white shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-50 via-transparent to-slate-50 opacity-50"></div>
            
            <div className="relative z-10 flex flex-col gap-3 py-8 px-4">
              {Array.from({ length: data.layout.rows }).map((_, rowIndex) => {
                const rowNum = rowIndex + 1;
                return (
                  <div key={rowNum} className="flex items-center justify-center gap-1">
                    <div className="mr-1 w-5 text-right text-[10px] font-bold text-slate-300">{rowNum}</div>
                    
                    <div className="flex gap-1.5">
                      {data.layout.cols.map((col, colIndex) => {
                        const seatId = `${rowNum}${col}`;
                        const isOccupied = data.occupiedSeats.includes(seatId);
                        const isSelected = selectedSeats.includes(seatId);
                        const isAisle = data.layout.aisleAfter.includes(colIndex + 1);

                        return (
                          <div key={col} className="flex items-center">
                            <motion.button
                              whileHover={!isOccupied ? { scale: 1.1, y: -2 } : {}}
                              whileTap={!isOccupied ? { scale: 0.95 } : {}}
                              type="button"
                              disabled={isOccupied}
                              onClick={() => toggleSeat(seatId)}
                              className={`
                                group relative flex h-8 w-8 items-center justify-center rounded-lg border transition-all duration-200
                                ${isOccupied ? 'border-slate-100 bg-slate-50 text-slate-200 cursor-not-allowed' : 
                                  isSelected ? 'border-brand-600 bg-brand-600 text-white shadow-lg shadow-brand-200' : 
                                  'border-slate-200 bg-white text-slate-400 hover:border-brand-400 hover:bg-brand-50 hover:text-brand-600'}
                              `}
                            >
                              <Armchair size={16} className={isSelected ? 'fill-white/20' : ''} />
                              
                              <AnimatePresence>
                                {isSelected && (
                                  <motion.div 
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[8px] font-bold text-white shadow-sm"
                                  >
                                    ✓
                                  </motion.div>
                                )}
                              </AnimatePresence>

                              <span className="absolute -top-10 left-1/2 z-20 -translate-x-1/2 scale-0 rounded-lg bg-slate-900 px-2 py-1 text-[10px] font-bold text-white transition-all group-hover:scale-100 shadow-xl">
                                Ghế {seatId}
                              </span>
                            </motion.button>
                            {isAisle && <div className="mx-2 w-4"></div>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tail / Rear */}
          <div className="relative -mt-1 w-full max-w-[280px]">
            <svg viewBox="0 0 280 100">
               <path 
                 d="M20 0 L260 0 L220 80 C 140 100, 140 100, 60 80 Z" 
                 fill="white" 
                 stroke="#e2e8f0" 
                 strokeWidth="2"
               />
               <path 
                 d="M140 20 L140 80" 
                 fill="none" 
                 stroke="#e2e8f0" 
                 strokeWidth="1" 
                 strokeDasharray="4 4"
               />
            </svg>
          </div>

          {/* Wings (Visual decoration) */}
          <div className="absolute top-[25%] -left-32 -z-10 h-[80px] w-[140px] origin-right -rotate-15 rounded-l-full bg-gradient-to-l from-slate-200 to-transparent opacity-40"></div>
          <div className="absolute top-[25%] -right-32 -z-10 h-[80px] w-[140px] origin-left rotate-15 rounded-r-full bg-gradient-to-r from-slate-200 to-transparent opacity-40"></div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-12 flex flex-wrap justify-center gap-6 rounded-2xl bg-white p-6 shadow-sm">
        <LegendItem 
          color="bg-white border-slate-200" 
          icon={<Armchair size={14} className="text-slate-400" />} 
          label="Chỗ trống" 
        />
        <LegendItem 
          color="bg-brand-600 border-brand-600" 
          icon={<Armchair size={14} className="text-white" />} 
          label="Đang chọn" 
        />
        <LegendItem 
          color="bg-slate-50 border-slate-100" 
          icon={<Armchair size={14} className="text-slate-200" />} 
          label="Đã đặt" 
        />
      </div>

      {/* Helper info */}
      <div className="mt-6 flex items-start gap-3 rounded-xl bg-blue-50/50 p-4 text-xs text-blue-700">
        <Info size={16} className="shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Hãy chọn đúng số lượng ghế ({passengerCount} ghế). Những ghế ở gần lối đi hoặc phía trước thường mang lại trải nghiệm thoải mái hơn.
        </p>
      </div>
    </div>
  );
}

function LegendItem({ color, icon, label }: { color: string; icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className={`flex h-7 w-7 items-center justify-center rounded-lg border ${color} shadow-sm`}>
        {icon}
      </div>
      <span className="text-sm font-semibold text-slate-600">{label}</span>
    </div>
  );
}
