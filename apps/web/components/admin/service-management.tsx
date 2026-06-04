'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Utensils, 
  Luggage, 
  Plus, 
  Trash2, 
  Edit2, 
  Settings2,
  Check,
  ChevronDown,
  Building2,
  Info
} from 'lucide-react';
import { currency } from '@/lib/format';
import { apiGet } from '@/lib/api';

type Airline = { id: string; code: string; name: string };

export function ServiceManagement() {
  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [selectedAirline, setSelectedAirline] = useState<Airline | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<Airline[]>('/flights/airlines').then((res) => {
      setAirlines(res);
      if (res.length > 0) setSelectedAirline(res[0]);
      setLoading(false);
    });
  }, []);

  const [services, setServices] = useState([
    { id: '1', name: 'Suất ăn nóng tiêu chuẩn', price: 65000, category: 'MEAL', airlineId: 'VN' },
    { id: '2', name: 'Combo snack & nước suối', price: 45000, category: 'MEAL', airlineId: 'VJ' },
  ]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Airline Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
         <div>
            <h3 className="text-xl font-black text-ink flex items-center gap-3">
               <Building2 className="text-brand-600" size={24} />
               Cấu hình theo Hãng hàng không
            </h3>
            <p className="mt-1 text-sm text-slate-500 font-medium">Chọn hãng để thiết lập chính sách hành lý và dịch vụ riêng biệt.</p>
         </div>
         
         <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit">
            {airlines.map((airline) => (
               <button
                 key={airline.id}
                 onClick={() => setSelectedAirline(airline)}
                 className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${selectedAirline?.id === airline.id ? 'bg-white text-brand-600 shadow-sm border border-brand-100' : 'text-slate-500 hover:text-slate-700'}`}
               >
                 {airline.code} - {airline.name}
               </button>
            ))}
         </div>
      </div>

      <AnimatePresence mode="wait">
        {selectedAirline && (
          <motion.div 
            key={selectedAirline.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid gap-8 lg:grid-cols-2"
          >
            {/* Baggage Config */}
            <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                     <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500">
                        <Luggage size={20} />
                     </div>
                     <h3 className="font-black text-lg text-ink">Chính sách Hành lý {selectedAirline.code}</h3>
                  </div>
                  <button className="h-10 w-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center hover:bg-brand-600 hover:text-white transition-all">
                     <Plus size={20} strokeWidth={3} />
                  </button>
               </div>
               
               <div className="space-y-4">
                  <PolicyNote text={selectedAirline.code === 'VJ' ? 'Lưu ý: Hãng giá rẻ, mặc định 0kg hành lý ký gửi.' : 'Lưu ý: Hãng truyền thống, thường có sẵn 23kg hành lý.'} />
                  {[15, 20, 25, 30].map(w => (
                    <div key={w} className="flex items-center justify-between p-4 rounded-2xl border border-slate-50 bg-slate-50/30">
                       <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center font-black text-ink shadow-sm border border-slate-100">{w}kg</div>
                          <p className="text-sm font-black text-ink">{currency.format(w * 15000)}</p>
                       </div>
                       <button className="p-2 text-slate-400 hover:text-brand-600 transition-colors"><Edit2 size={16} /></button>
                    </div>
                  ))}
               </div>
            </div>

            {/* Services Config */}
            <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                     <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500">
                        <Utensils size={20} />
                     </div>
                     <h3 className="font-black text-lg text-ink">Suất ăn & Tiện ích {selectedAirline.code}</h3>
                  </div>
                  <button className="h-10 w-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center hover:bg-brand-600 hover:text-white transition-all">
                     <Plus size={20} strokeWidth={3} />
                  </button>
               </div>

               <div className="space-y-4">
                  {services.filter(s => s.airlineId === (selectedAirline.code === 'VJ' ? 'VJ' : 'VN')).map(sv => (
                    <div key={sv.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-50 bg-slate-50/30">
                       <div>
                          <p className="text-sm font-black text-ink">{sv.name}</p>
                          <span className="text-[10px] font-black text-emerald-600 uppercase mt-1 block">{currency.format(sv.price)}</span>
                       </div>
                       <button className="p-2 text-slate-400 hover:text-brand-600 transition-colors"><Edit2 size={16} /></button>
                    </div>
                  ))}
                  <div className="p-4 rounded-2xl border-2 border-dashed border-slate-100 text-center">
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Thêm dịch vụ mới cho {selectedAirline.name}</p>
                  </div>
               </div>
            </div>

            {/* Seat Price Config */}
            <div className="lg:col-span-2 rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="font-black text-lg text-ink">Bảng giá chỗ ngồi: {selectedAirline.name}</h3>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 text-amber-700 text-[10px] font-black uppercase border border-amber-100">
                     <Info size={14} /> Giá áp dụng theo từng hàng ghế
                  </div>
               </div>
               <div className="grid gap-6 md:grid-cols-3">
                  <SeatPriceCard label="Ghế Tiêu chuẩn" price={selectedAirline.code === 'VN' ? 0 : 30000} rows="10-30" color="bg-slate-200" />
                  <SeatPriceCard label="Ghế Phía trước" price={50000} rows="5-9" color="bg-brand-500" />
                  <SeatPriceCard label="Ghế Rộng chân" price={150000} rows="1-4" color="bg-emerald-500" />
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function PolicyNote({ text }: { text: string }) {
  return (
    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-6">
       <p className="text-xs font-bold text-slate-500 leading-relaxed italic">{text}</p>
    </div>
  );
}

function SeatPriceCard({ label, price, rows, color }: any) {
  return (
    <div className="p-6 rounded-3xl border border-slate-100 bg-slate-50/50 flex flex-col gap-4">
       <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-xl ${color} shadow-lg shadow-black/5`}></div>
          <div>
             <p className="text-sm font-black text-ink">{label}</p>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dãy hàng: {rows}</p>
          </div>
       </div>
       <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <span className="text-[10px] font-black text-slate-400 uppercase">Phụ phí</span>
          <span className="text-sm font-black text-brand-600">{price === 0 ? 'MIỄN PHÍ' : currency.format(price)}</span>
       </div>
    </div>
  );
}
