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
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiGet, apiPost } from '@/lib/api';
import { getCurrentUser } from '@/lib/auth-client';
import { currency, formatDate, formatTime, formatCountdown } from '@/lib/format';
import { SeatSelection } from './seat-selection';

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
};

const emptyPassenger = (): PassengerDraft => ({
  passengerType: 'ADULT',
  firstName: '',
  lastName: '',
  gender: 'MALE',
  idNumber: ''
});

const STEPS = [
  { id: 1, name: 'Thông tin khách' },
  { id: 2, name: 'Chọn chỗ ngồi' },
  { id: 3, name: 'Thanh toán' }
];

export function BookingClient() {
  const router = useRouter();
  const params = useSearchParams();
  const flightId = params.get('flightId') ?? '';
  const classType = params.get('classType') ?? 'ECONOMY';
  const user = useMemo(() => getCurrentUser(), []);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [flight, setFlight] = useState<FlightDetail | null>(null);
  const [passengers, setPassengers] = useState<PassengerDraft[]>([emptyPassenger()]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [contactName, setContactName] = useState(user?.fullName ?? '');
  const [contactEmail, setContactEmail] = useState(user?.email ?? '');
  const [contactPhone, setContactPhone] = useState(user?.phone ?? '');
  const [promotionCode, setPromotionCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!flightId) return;
    apiGet<FlightDetail>(`/flights/${flightId}`)
      .then(setFlight)
      .catch(() => toast.error('Không tải được thông tin chuyến bay.'));
  }, [flightId]);

  // Countdown timer logic
  useEffect(() => {
    if (!timeLeft) return;
    if (timeLeft <= 0) {
      toast.error('Thời gian giữ chỗ đã hết hạn. Vui lòng đặt lại.');
      router.push('/search');
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev ? prev - 1 : null), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, router]);

  const selectedClass = flight?.classes.find((item) => item.classType === classType);
  const estimatedBase = selectedClass ? Number(selectedClass.basePriceVND) + Number(selectedClass.flightTaxVND) : 0;
  const estimatedTotal = estimatedBase * passengers.length;

  function updatePassenger(index: number, field: keyof PassengerDraft, value: string) {
    setPassengers((current) => current.map((passenger, itemIndex) => itemIndex === index ? { ...passenger, [field]: value } : passenger));
  }

  function setPassengerCount(count: number) {
    const nextCount = Math.min(Math.max(count, 1), 9);
    setPassengers((current) => {
      const next = current.slice(0, nextCount);
      while (next.length < nextCount) next.push(emptyPassenger());
      return next;
    });
    setSelectedSeats([]);
  }

  async function handleCreateBooking() {
    if (!flightId) return;
    
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
        passengers: passengers.map((passenger, index) => ({
          ...passenger,
          idNumber: passenger.idNumber || undefined,
          seatNumber: selectedSeats[index] || undefined
        }))
      });
      setBooking(result);
      if (result.expiresAt) {
        const expiry = new Date(result.expiresAt).getTime();
        const now = new Date().getTime();
        setTimeLeft(Math.floor((expiry - now) / 1000));
      } else {
        setTimeLeft(900); // Default 15 mins
      }
      setCurrentStep(3);
      toast.success('Giữ chỗ thành công! Chỗ ngồi của bạn đã được tạm khóa.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể tạo đơn đặt vé.');
    } finally {
      setLoading(false);
    }
  }

  const nextStep = () => {
    if (currentStep === 1) {
      // Basic validation
      const invalid = passengers.some(p => !p.firstName || !p.lastName);
      if (invalid) return toast.error('Vui lòng nhập đầy đủ họ tên hành khách.');
      if (!contactEmail || !contactPhone) return toast.error('Vui lòng nhập thông tin liên hệ.');
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (selectedSeats.length < passengers.length) {
        return toast.info('Bạn chưa chọn đủ chỗ ngồi. Bạn có muốn tiếp tục không?', {
          action: {
            label: 'Tiếp tục',
            onClick: handleCreateBooking
          }
        });
      }
      handleCreateBooking();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Header Stepper */}
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              {STEPS.map((step) => (
                <div key={step.id} className="flex items-center gap-3">
                  <div className={`
                    flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all
                    ${currentStep >= step.id ? 'bg-brand-600 text-white shadow-lg shadow-brand-100' : 'bg-slate-100 text-slate-400'}
                  `}>
                    {currentStep > step.id ? <Check size={14} /> : step.id}
                  </div>
                  <span className={`text-sm font-bold ${currentStep >= step.id ? 'text-ink' : 'text-slate-400'}`}>
                    {step.name}
                  </span>
                  {step.id < 3 && <ChevronRight size={16} className="text-slate-300" />}
                </div>
              ))}
            </div>

            {timeLeft !== null && (
              <div className="flex items-center gap-2 rounded-full bg-orange-50 px-4 py-1.5 text-orange-700 shadow-sm border border-orange-100">
                <Timer size={16} className="animate-pulse" />
                <span className="text-sm font-black tabular-nums">{formatCountdown(timeLeft)}</span>
                <span className="text-[10px] font-bold uppercase tracking-tight">Hết hạn</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="mx-auto mt-8 grid max-w-7xl gap-8 px-4 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.section 
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                  <div className="mb-8 flex items-start justify-between">
                    <div>
                      <h1 className="text-2xl font-black text-ink">Thông tin hành khách</h1>
                      <p className="mt-1 text-slate-500">Vui lòng nhập chính xác như trên giấy tờ tùy thân.</p>
                    </div>
                    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-2 border border-slate-100">
                       <span className="pl-2 text-xs font-bold text-slate-400 uppercase">Số khách</span>
                       <input 
                         type="number" 
                         min={1} 
                         max={9} 
                         value={passengers.length} 
                         onChange={(e) => setPassengerCount(Number(e.target.value))} 
                         className="h-10 w-16 rounded-xl border border-slate-200 bg-white text-center font-bold text-ink focus:border-brand-500 outline-none" 
                       />
                    </div>
                  </div>

                  <div className="space-y-6">
                    {passengers.map((passenger, index) => (
                      <div key={index} className="group relative rounded-2xl border border-slate-100 bg-slate-50/50 p-6 transition-all hover:border-brand-200 hover:bg-white hover:shadow-md">
                        <div className="mb-6 flex items-center gap-2 font-bold text-ink">
                          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-100 text-brand-700 text-[10px]">
                            {index + 1}
                          </div>
                          Hành khách {index + 1}
                        </div>
                        <div className="grid gap-5 md:grid-cols-2">
                          <Field label="Họ (Vd: NGUYEN)" value={passenger.lastName} onChange={(v) => updatePassenger(index, 'lastName', v.toUpperCase())} required />
                          <Field label="Tên đệm & Tên (Vd: VAN AN)" value={passenger.firstName} onChange={(v) => updatePassenger(index, 'firstName', v.toUpperCase())} required />
                          <div className="grid gap-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Loại khách</label>
                            <select 
                              value={passenger.passengerType} 
                              onChange={(e) => updatePassenger(index, 'passengerType', e.target.value)}
                              className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none focus:border-brand-500"
                            >
                              <option value="ADULT">Người lớn (Trên 12 tuổi)</option>
                              <option value="CHILD">Trẻ em (2 - 12 tuổi)</option>
                              <option value="INFANT">Em bé (Dưới 2 tuổi)</option>
                            </select>
                          </div>
                          <div className="grid gap-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Giới tính</label>
                            <div className="flex gap-2">
                               {['MALE', 'FEMALE'].map(g => (
                                 <button
                                   key={g}
                                   type="button"
                                   onClick={() => updatePassenger(index, 'gender', g as any)}
                                   className={`flex-1 h-12 rounded-xl border font-semibold text-sm transition-all ${passenger.gender === g ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'}`}
                                 >
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

                <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="rounded-xl bg-brand-50 p-2 text-brand-600">
                      <ContactRound size={20} />
                    </div>
                    <h2 className="text-xl font-black text-ink">Thông tin liên hệ</h2>
                  </div>
                  <div className="grid gap-5 md:grid-cols-3">
                    <Field label="Họ tên người nhận" value={contactName} onChange={setContactName} required />
                    <Field label="Email nhận vé" type="email" value={contactEmail} onChange={setContactEmail} required />
                    <Field label="Số điện thoại" value={contactPhone} onChange={setContactPhone} required />
                  </div>
                </div>

                <button onClick={nextStep} className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 font-bold text-white shadow-xl shadow-brand-100 transition-all hover:bg-brand-700 hover:-translate-y-1 active:scale-95">
                  Tiếp tục chọn chỗ ngồi <ArrowRight size={20} />
                </button>
              </motion.section>
            )}

            {currentStep === 2 && (
              <motion.section 
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <SeatSelection 
                  flightId={flightId} 
                  passengerCount={passengers.length} 
                  selectedSeats={selectedSeats} 
                  onSelect={setSelectedSeats} 
                />
                
                <div className="flex gap-4">
                   <button onClick={() => setCurrentStep(1)} className="h-14 flex-1 rounded-2xl border border-slate-200 bg-white font-bold text-slate-600 hover:bg-slate-50">
                     Quay lại
                   </button>
                   <button onClick={nextStep} disabled={loading} className="h-14 flex-[2] rounded-2xl bg-brand-600 font-bold text-white shadow-xl shadow-brand-100 hover:bg-brand-700 disabled:opacity-50">
                     {loading ? 'Đang xử lý...' : 'Xác nhận & Giữ chỗ'}
                   </button>
                </div>
              </motion.section>
            )}

            {currentStep === 3 && booking && (
              <motion.section 
                key="step3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="rounded-3xl border border-emerald-200 bg-emerald-50/50 p-8 text-center">
                   <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-200">
                     <Check size={32} strokeWidth={3} />
                   </div>
                   <h2 className="text-2xl font-black text-emerald-900">Giữ chỗ thành công!</h2>
                   <p className="mt-2 text-emerald-700">Mã đặt vé của bạn là <span className="font-black text-emerald-900">{booking.bookingCode}</span></p>
                   
                   <div className="mt-8 flex flex-col items-center gap-2 rounded-2xl bg-white p-6 shadow-sm border border-emerald-100">
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Số tiền cần thanh toán</p>
                      <p className="text-4xl font-black text-brand-600">{currency.format(booking.totalAmountVND)}</p>
                      <div className="mt-4 flex items-center gap-2 text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full">
                         <Timer size={14} /> Thanh toán trong {formatCountdown(timeLeft ?? 0)} để hoàn tất đặt vé
                      </div>
                   </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                   <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                      <h3 className="mb-4 font-black text-ink flex items-center gap-2">
                         <CreditCard size={18} className="text-brand-600" /> Phương thức thanh toán
                      </h3>
                      <div className="space-y-3">
                         <PaymentOption icon="🏦" name="Chuyển khoản ngân hàng" desc="Xử lý trong 1-5 phút" active />
                         <PaymentOption icon="💳" name="Thẻ quốc tế Visa/Master" desc="Phí 2.5% + 5.000đ" />
                         <PaymentOption icon="📱" name="Ví điện tử MoMo/ZaloPay" desc="Thanh toán tức thì" />
                      </div>
                   </div>
                   <div className="flex flex-col justify-end">
                      <Link 
                        href={`/payment?bookingId=${booking.id}`} 
                        className="flex h-16 items-center justify-center gap-3 rounded-2xl bg-coral font-black text-white shadow-xl shadow-coral/20 hover:bg-[#df4f43] transition-all hover:-translate-y-1"
                      >
                        Thanh toán ngay <ArrowRight size={20} />
                      </Link>
                      <p className="mt-4 text-center text-xs text-slate-400 font-medium">
                        Bằng cách nhấn thanh toán, bạn đồng ý với <Link href="#" className="underline">Điều khoản dịch vụ</Link> của chúng tôi.
                      </p>
                   </div>
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar Summary */}
        <aside className="space-y-6">
          <div className="sticky top-24 space-y-6">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="bg-slate-900 p-6 text-white">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Tóm tắt chuyến bay</p>
                {flight ? (
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <p className="text-xl font-black">{flight.route.departure.code} → {flight.route.arrival.code}</p>
                      <p className="text-xs font-medium text-slate-400">{formatDate(flight.departureTime)}</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-brand-400">
                      <Plane size={20} />
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 h-12 w-full animate-pulse rounded-lg bg-white/5"></div>
                )}
              </div>
              
              <div className="p-6">
                {flight ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                       <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white font-black text-brand-600 shadow-sm border border-slate-100 text-xs">
                         {flight.airline.code}
                       </div>
                       <div>
                         <p className="text-sm font-bold text-ink">{flight.airline.name}</p>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{flight.flightNumber} · {flight.aircraft || 'A321'}</p>
                       </div>
                    </div>

                    <div className="space-y-3 py-2">
                       <SummaryLine label="Hạng ghế" value={classType === 'BUSINESS' ? 'Thương gia' : 'Phổ thông'} />
                       <SummaryLine label="Hành khách" value={`${passengers.length} người`} />
                       <SummaryLine label="Hành lý" value={`${selectedClass?.baggageKg ?? 20}kg / khách`} />
                       {selectedSeats.length > 0 && (
                         <SummaryLine 
                           label="Chỗ ngồi" 
                           value={selectedSeats.join(', ')} 
                           highlight 
                         />
                       )}
                    </div>

                    <div className="mt-4 border-t border-dashed border-slate-200 pt-4">
                       <div className="flex items-center justify-between">
                         <span className="text-sm font-bold text-slate-500">Tổng cộng</span>
                         <span className="text-xl font-black text-coral">{currency.format(estimatedTotal)}</span>
                       </div>
                       <p className="mt-1 text-right text-[10px] text-slate-400 font-medium">Đã bao gồm thuế & phí</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="h-20 w-full animate-pulse rounded-2xl bg-slate-50"></div>
                    <div className="h-40 w-full animate-pulse rounded-2xl bg-slate-50"></div>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-brand-100 bg-brand-50/50 p-6">
               <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 text-brand-600" size={18} />
                  <div>
                    <p className="text-xs font-black text-brand-900 uppercase tracking-tight">An tâm đặt vé</p>
                    <p className="mt-1 text-[11px] leading-relaxed text-brand-700/80 font-medium">
                      Chúng tôi cam kết bảo mật thông tin và hỗ trợ thay đổi vé linh hoạt theo chính sách hãng.
                    </p>
                  </div>
               </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return (
    <div className="grid gap-1.5">
      <label className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</label>
      <input 
        type={type} 
        value={value} 
        onChange={(event) => onChange(event.target.value)} 
        required={required} 
        className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-ink outline-none transition-all focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10" 
      />
    </div>
  );
}

function SummaryLine({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="font-medium text-slate-500">{label}</span>
      <span className={`font-bold ${highlight ? 'text-brand-600' : 'text-ink'}`}>{value}</span>
    </div>
  );
}

function PaymentOption({ icon, name, desc, active = false }: { icon: string; name: string; desc: string; active?: boolean }) {
  return (
    <div className={`
      flex items-center gap-4 rounded-2xl border p-4 transition-all cursor-pointer
      ${active ? 'border-brand-600 bg-brand-50' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}
    `}>
       <div className="text-2xl">{icon}</div>
       <div className="flex-1">
          <p className="text-sm font-bold text-ink">{name}</p>
          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">{desc}</p>
       </div>
       {active && <div className="h-5 w-5 rounded-full bg-brand-600 flex items-center justify-center text-white"><Check size={12} strokeWidth={4} /></div>}
    </div>
  );
}
