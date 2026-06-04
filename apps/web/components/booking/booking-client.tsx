'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { 
  ArrowRight, 
  CircleCheck, 
  ContactRound, 
  Plane, 
  Plus, 
  UserRound, 
  Armchair, 
  ChevronRight, 
  ShieldCheck, 
  Timer,
  Info,
  CreditCard,
  Check,
  Luggage,
  Utensils,
  BadgePercent
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiGet, apiPost } from '@/lib/api';
import { getCurrentUser } from '@/lib/auth-client';
import { currency, formatDate, formatTime, formatCountdown } from '@/lib/format';
import { SeatSelection } from './seat-selection';

type BaggageOption = { id: string; weightKg: number; priceVND: number };
type ExtraService = { id: string; name: string; priceVND: number; category: string };

type FlightDetail = {
  id: string;
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  durationMin: number;
  aircraft?: string;
  airline: { code: string; name: string };
  route: { departure: { code: string; city: string }; arrival: { code: string; city: string } };
  classes: { classType: string; availableSeats: number; basePriceVND: number; flightTaxVND: number; baggageKg: number }[];
};

type SeatDataResponse = {
  baggageOptions: BaggageOption[];
  extraServices: ExtraService[];
};

type BookingResponse = {
  id: string;
  bookingCode: string;
  totalAmountVND: number;
  expiresAt?: string;
};

type PassengerDraft = {
  passengerType: 'ADULT' | 'CHILD' | 'INFANT';
  firstName: string;
  lastName: string;
  gender: 'MALE' | 'FEMALE';
  idNumber: string;
  baggageId?: string;
  serviceIds: string[];
  seat?: { id: string; price: number };
};

const emptyPassenger = (): PassengerDraft => ({
  passengerType: 'ADULT',
  firstName: '',
  lastName: '',
  gender: 'MALE',
  idNumber: '',
  serviceIds: []
});

const STEPS = [
  { id: 1, name: 'Hành khách' },
  { id: 2, name: 'Dịch vụ thêm' },
  { id: 3, name: 'Chỗ ngồi' },
  { id: 4, name: 'Thanh toán' }
];

export function BookingClient() {
  const router = useRouter();
  const params = useSearchParams();
  const flightId = params.get('flightId') ?? '';
  const classType = params.get('classType') ?? 'ECONOMY';
  const user = useMemo(() => getCurrentUser(), []);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [flight, setFlight] = useState<FlightDetail | null>(null);
  const [extras, setExtras] = useState<SeatDataResponse | null>(null);
  const [passengers, setPassengers] = useState<PassengerDraft[]>([emptyPassenger()]);
  const [contactName, setContactName] = useState(user?.fullName ?? '');
  const [contactEmail, setContactEmail] = useState(user?.email ?? '');
  const [contactPhone, setContactPhone] = useState(user?.phone ?? '');
  const [promotionCode, setPromotionCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!flightId) return;
    apiGet<FlightDetail>(`/flights/${flightId}`).then(setFlight);
    apiGet<SeatDataResponse>(`/flights/${flightId}/seats`).then(setExtras);
  }, [flightId]);

  useEffect(() => {
    if (!timeLeft) return;
    if (timeLeft <= 0) {
      toast.error('Hết hạn giữ chỗ.');
      router.push('/search');
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev ? prev - 1 : null), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, router]);

  const selectedClass = flight?.classes.find((item) => item.classType === classType);
  const basePricePerPerson = selectedClass ? Number(selectedClass.basePriceVND) + Number(selectedClass.flightTaxVND) : 0;
  
  const totalAmount = useMemo(() => {
    let total = basePricePerPerson * passengers.length;
    passengers.forEach(p => {
      if (p.baggageId && extras) {
        const bg = extras.baggageOptions.find(b => b.id === p.baggageId);
        if (bg) total += bg.priceVND;
      }
      p.serviceIds.forEach(sid => {
        const s = extras?.extraServices.find(es => es.id === sid);
        if (s) total += s.priceVND;
      });
      if (p.seat) total += p.seat.price;
    });
    return total;
  }, [basePricePerPerson, passengers, extras]);

  function updatePassenger(index: number, update: Partial<PassengerDraft>) {
    setPassengers(prev => prev.map((p, i) => i === index ? { ...p, ...update } : p));
  }

  async function handleCreateBooking() {
    setLoading(true);
    try {
      const result = await apiPost<BookingResponse>('/bookings', {
        userId: user?.id,
        flightId,
        classType,
        contactName,
        contactEmail,
        contactPhone,
        promotionCode: promotionCode || undefined,
        passengers: passengers.map(p => ({
          ...p,
          seatNumber: p.seat?.id,
          extraServices: p.serviceIds.map(sid => {
            const s = extras?.extraServices.find(es => es.id === sid);
            return s ? { name: s.name, price: s.priceVND } : null;
          }).filter(Boolean)
        }))
      });
      setBooking(result);
      if (result.expiresAt) {
        setTimeLeft(Math.floor((new Date(result.expiresAt).getTime() - Date.now()) / 1000));
      }
      setCurrentStep(4);
    } catch (error) {
      toast.error('Không thể tạo đơn đặt vé.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            {STEPS.map((step) => (
              <div key={step.id} className="flex items-center gap-2">
                <div className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-black ${currentStep >= step.id ? 'bg-brand-600 text-white shadow-lg shadow-brand-100' : 'bg-slate-100 text-slate-400'}`}>
                  {currentStep > step.id ? <Check size={12} /> : step.id}
                </div>
                <span className={`text-xs font-black uppercase tracking-wider ${currentStep >= step.id ? 'text-ink' : 'text-slate-400'}`}>{step.name}</span>
                {step.id < 4 && <ChevronRight size={14} className="text-slate-200" />}
              </div>
            ))}
          </div>
          {timeLeft !== null && (
            <div className="flex items-center gap-2 rounded-full bg-orange-50 px-4 py-1.5 text-orange-700 border border-orange-100">
              <Timer size={14} />
              <span className="text-sm font-black">{formatCountdown(timeLeft)}</span>
            </div>
          )}
        </div>
      </div>

      <main className="mx-auto mt-8 grid max-w-7xl gap-8 px-4 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                <div className="rounded-[40px] border border-slate-200 bg-white p-8 md:p-12 shadow-sm">
                  <h2 className="text-2xl font-black text-ink mb-8">Thông tin hành khách</h2>
                  <div className="space-y-8">
                    {passengers.map((p, i) => (
                      <div key={i} className="rounded-3xl border border-slate-100 bg-slate-50/50 p-6">
                         <div className="flex items-center gap-2 font-black text-ink mb-6">
                            <span className="h-6 w-6 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center text-[10px]">{i + 1}</span>
                            Hành khách {i + 1}
                         </div>
                         <div className="grid gap-6 md:grid-cols-2">
                            <Field label="Họ (Vd: NGUYEN)" value={p.lastName} onChange={(v) => updatePassenger(i, { lastName: v.toUpperCase() })} />
                            <Field label="Tên & Tên đệm" value={p.firstName} onChange={(v) => updatePassenger(i, { firstName: v.toUpperCase() })} />
                            <div className="grid gap-2">
                               <label className="text-[10px] font-black uppercase text-slate-400">Giới tính</label>
                               <div className="flex gap-2">
                                  {['MALE', 'FEMALE'].map(g => (
                                    <button key={g} type="button" onClick={() => updatePassenger(i, { gender: g as any })} className={`flex-1 h-12 rounded-xl border font-bold text-sm transition-all ${p.gender === g ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-200 bg-white text-slate-400'}`}>
                                      {g === 'MALE' ? 'Nam' : 'Nữ'}
                                    </button>
                                  ))}
                               </div>
                            </div>
                         </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[40px] border border-slate-200 bg-white p-8 md:p-12 shadow-sm">
                   <h2 className="text-2xl font-black text-ink mb-8">Thông tin liên hệ nhận vé</h2>
                   <div className="grid gap-6 md:grid-cols-3">
                      <Field label="Email nhận vé" value={contactEmail} onChange={setContactEmail} />
                      <Field label="Số điện thoại" value={contactPhone} onChange={setContactPhone} />
                      <Field label="Tên người nhận" value={contactName} onChange={setContactName} />
                   </div>
                </div>

                <button onClick={() => setCurrentStep(2)} className="h-16 w-full rounded-3xl bg-brand-600 font-black text-white shadow-xl shadow-brand-100 flex items-center justify-center gap-3">
                   TIẾP THEO: DỊCH VỤ THÊM <ArrowRight size={20} />
                </button>
              </motion.div>
            )}

            {currentStep === 2 && extras && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                <div className="rounded-[40px] border border-slate-200 bg-white p-8 md:p-12 shadow-sm">
                   <h2 className="text-2xl font-black text-ink mb-4">Hành lý & Suất ăn</h2>
                   <p className="text-slate-500 mb-8 font-medium">Mua thêm hành lý và dịch vụ để tiết kiệm lên đến 40% so với mua tại sân bay.</p>
                   
                   <div className="space-y-12">
                      {passengers.map((p, i) => (
                        <div key={i} className="space-y-6">
                           <div className="flex items-center gap-2 font-black text-ink">
                              <UserRound size={18} className="text-brand-600" />
                              HK {i + 1}: {p.lastName} {p.firstName}
                           </div>
                           
                           <div className="grid gap-6 lg:grid-cols-2">
                              {/* Baggage */}
                              <div className="rounded-3xl border border-slate-100 bg-slate-50/50 p-6">
                                 <div className="flex items-center gap-2 text-sm font-black text-ink mb-4">
                                    <Luggage size={16} /> Hành lý ký gửi
                                 </div>
                                 <select 
                                   value={p.baggageId || ''} 
                                   onChange={(e) => updatePassenger(i, { baggageId: e.target.value })}
                                   className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold outline-none focus:border-brand-500"
                                 >
                                    <option value="">Chưa chọn hành lý</option>
                                    {extras.baggageOptions.map(bg => (
                                      <option key={bg.id} value={bg.id}>+ {bg.weightKg}kg ({currency.format(bg.priceVND)})</option>
                                    ))}
                                 </select>
                              </div>

                              {/* Services */}
                              <div className="rounded-3xl border border-slate-100 bg-slate-50/50 p-6">
                                 <div className="flex items-center gap-2 text-sm font-black text-ink mb-4">
                                    <Utensils size={16} /> Suất ăn & Dịch vụ
                                 </div>
                                 <div className="flex flex-wrap gap-2">
                                    {extras.extraServices.map(sv => (
                                      <button
                                        key={sv.id}
                                        onClick={() => {
                                          const next = p.serviceIds.includes(sv.id) ? p.serviceIds.filter(id => id !== sv.id) : [...p.serviceIds, sv.id];
                                          updatePassenger(i, { serviceIds: next });
                                        }}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black border transition-all ${p.serviceIds.includes(sv.id) ? 'bg-brand-600 border-brand-600 text-white' : 'bg-white border-slate-200 text-slate-500 hover:border-brand-200'}`}
                                      >
                                        {sv.name} (+{currency.format(sv.priceVND)})
                                      </button>
                                    ))}
                                 </div>
                              </div>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="flex gap-4">
                   <button onClick={() => setCurrentStep(1)} className="h-16 flex-1 rounded-3xl border border-slate-200 bg-white font-black text-slate-500">QUAY LẠI</button>
                   <button onClick={() => setCurrentStep(3)} className="h-16 flex-[2] rounded-3xl bg-brand-600 font-black text-white shadow-xl shadow-brand-100">TIẾP THEO: CHỌN GHẾ NGỒI</button>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                 <SeatSelection 
                   flightId={flightId} 
                   passengerCount={passengers.length} 
                   selectedSeats={passengers.map(p => p.seat).filter(Boolean) as any} 
                   onSelect={(seats) => {
                      setPassengers(prev => prev.map((p, i) => ({ ...p, seat: seats[i] || undefined })));
                   }} 
                 />
                 <div className="flex gap-4">
                    <button onClick={() => setCurrentStep(2)} className="h-16 flex-1 rounded-3xl border border-slate-200 bg-white font-black text-slate-500">QUAY LẠI</button>
                    <button onClick={handleCreateBooking} disabled={loading} className="h-16 flex-[2] rounded-3xl bg-brand-600 font-black text-white shadow-xl shadow-brand-100 flex items-center justify-center gap-3">
                       {loading ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN & GIỮ CHỖ'} <ArrowRight size={20} />
                    </button>
                 </div>
              </motion.div>
            )}

            {currentStep === 4 && booking && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                 <div className="rounded-[40px] border border-emerald-200 bg-emerald-50/50 p-12 text-center">
                    <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                       <Check size={40} strokeWidth={4} />
                    </div>
                    <h2 className="text-3xl font-black text-emerald-900 italic">GIỮ CHỖ THÀNH CÔNG</h2>
                    <p className="mt-4 text-emerald-700 font-medium">Mã đặt vé của bạn là: <span className="font-black text-emerald-900 text-2xl">{booking.bookingCode}</span></p>
                    <div className="mt-8 mx-auto w-fit rounded-full bg-white px-8 py-3 shadow-sm border border-emerald-100 flex items-center gap-3 text-emerald-900">
                       <span className="text-xs font-black uppercase tracking-widest">Tổng tiền</span>
                       <span className="text-2xl font-black">{currency.format(booking.totalAmountVND)}</span>
                    </div>
                 </div>
                 
                 <Link href={`/payment?bookingId=${booking.id}`} className="h-20 w-full rounded-[40px] bg-coral font-black text-white text-xl shadow-2xl shadow-coral/20 flex items-center justify-center gap-3 transition-transform hover:-translate-y-1">
                    THANH TOÁN NGAY <ArrowRight size={28} />
                 </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <aside className="space-y-6">
          <div className="sticky top-24 space-y-6">
            <div className="overflow-hidden rounded-[40px] border border-slate-200 bg-white shadow-sm">
               <div className="bg-slate-900 p-8 text-white">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Tóm tắt hành trình</p>
                  {flight && (
                    <div className="mt-4 flex items-center justify-between">
                       <div className="text-2xl font-black italic">{flight.route.departure.code} → {flight.route.arrival.code}</div>
                       <Plane size={24} className="text-brand-400" />
                    </div>
                  )}
               </div>
               <div className="p-8 space-y-6">
                  {flight ? (
                    <>
                      <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-3xl border border-slate-100">
                         <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center font-black text-brand-600 text-xs shadow-sm">{flight.airline.code}</div>
                         <div>
                            <p className="text-sm font-black text-ink">{flight.airline.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">{flight.flightNumber} · {flight.aircraft || 'A321'}</p>
                         </div>
                      </div>
                      <div className="space-y-4">
                         <Line label="Người lớn" value={`${passengers.length} HK`} />
                         <Line label="Hạng vé" value={classType === 'BUSINESS' ? 'Thương gia' : 'Phổ thông'} />
                         <div className="pt-4 border-t border-dashed border-slate-200">
                            <div className="flex items-center justify-between">
                               <span className="text-sm font-black text-slate-400 uppercase">Tổng cộng</span>
                               <span className="text-2xl font-black text-coral">{currency.format(totalAmount)}</span>
                            </div>
                         </div>
                      </div>
                    </>
                  ) : (
                    <div className="h-40 w-full animate-pulse bg-slate-50 rounded-3xl"></div>
                  )}
               </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
  return (
    <div className="grid gap-2">
       <label className="text-[10px] font-black uppercase text-slate-400 pl-1">{label}</label>
       <input value={value} onChange={e => onChange(e.target.value)} className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-ink outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all" />
    </div>
  );
}

function Line({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
       <span className="font-bold text-slate-400">{label}</span>
       <span className="font-black text-ink">{value}</span>
    </div>
  );
}
