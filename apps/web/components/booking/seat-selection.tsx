'use client';

import { useEffect, useState } from 'react';
import { Armchair } from 'lucide-react';
import { apiGet } from '@/lib/api';
import { toast } from 'sonner';

type SeatLayout = {
  rows: number;
  cols: string[];
  aisleAfter: number;
};

type SeatData = {
  occupiedSeats: string[];
  layout: SeatLayout;
  classes: { classType: string; rows?: number[] }[];
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
    apiGet<SeatData>(`/flights/${flightId}/seats`)
      .then(setData)
      .catch(() => toast.error('Không thể tải sơ đồ chỗ ngồi.'))
      .finally(() => setLoading(false));
  }, [flightId]);

  if (loading) return <div className="p-8 text-center text-slate-500">Đang tải sơ đồ chỗ ngồi...</div>;
  if (!data) return null;

  const { layout, occupiedSeats } = data;

  const toggleSeat = (seatId: string) => {
    if (occupiedSeats.includes(seatId)) return;

    if (selectedSeats.includes(seatId)) {
      onSelect(selectedSeats.filter((s) => s !== seatId));
    } else {
      if (selectedSeats.length < passengerCount) {
        onSelect([...selectedSeats, seatId]);
      } else {
        // Replace the last selected seat or toast
        toast.info(`Bạn chỉ có thể chọn tối đa ${passengerCount} chỗ ngồi.`);
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 rounded-lg border border-slate-200 bg-slate-50 p-6">
      <div className="text-center">
        <h3 className="text-lg font-bold text-ink">Chọn chỗ ngồi</h3>
        <p className="text-sm text-slate-500">Đã chọn {selectedSeats.length}/{passengerCount} chỗ</p>
      </div>

      <div className="flex flex-col gap-2 rounded-t-[100px] border-x-4 border-t-4 border-slate-300 bg-white p-8 shadow-inner">
        {/* Cockpit area */}
        <div className="mb-8 flex h-20 w-full items-center justify-center rounded-t-full bg-slate-100 border-b-2 border-slate-200">
           <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Khoang lái</span>
        </div>

        {Array.from({ length: layout.rows }).map((_, rowIndex) => {
          const rowNum = rowIndex + 1;
          return (
            <div key={rowNum} className="flex items-center gap-2">
              <div className="w-6 text-right text-xs font-bold text-slate-400">{rowNum}</div>
              <div className="flex gap-1">
                {layout.cols.map((col, colIndex) => {
                  const seatId = `${rowNum}${col}`;
                  const isOccupied = occupiedSeats.includes(seatId);
                  const isSelected = selectedSeats.includes(seatId);
                  const isAisle = colIndex === layout.aisleAfter;

                  return (
                    <div key={col} className="flex items-center">
                      {isAisle && <div className="mx-2 w-6 text-center text-[10px] font-bold text-slate-300">Lối đi</div>}
                      <button
                        type="button"
                        disabled={isOccupied}
                        onClick={() => toggleSeat(seatId)}
                        className={`
                          group relative flex h-9 w-9 items-center justify-center rounded-md border-2 transition-all
                          ${isOccupied ? 'border-slate-200 bg-slate-100 text-slate-300 cursor-not-allowed' : 
                            isSelected ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-sm' : 
                            'border-slate-300 bg-white text-slate-400 hover:border-brand-400 hover:bg-brand-50 hover:text-brand-600'}
                        `}
                      >
                        <Armchair size={18} className={isSelected ? 'fill-brand-100' : ''} />
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 scale-0 rounded bg-ink px-2 py-1 text-[10px] text-white transition-all group-hover:scale-100">
                          {seatId}
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-6 text-sm">
        <LegendItem color="bg-white border-slate-300" label="Còn trống" />
        <LegendItem color="bg-brand-50 border-brand-600 text-brand-700" label="Đang chọn" />
        <LegendItem color="bg-slate-100 border-slate-200 text-slate-300" label="Đã có người" />
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`h-5 w-5 rounded border-2 ${color}`}></div>
      <span className="text-slate-600">{label}</span>
    </div>
  );
}
