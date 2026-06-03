'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ArrowRight, CircleCheck, ContactRound, Plane, Plus, UserRound, Armchair } from 'lucide-react';
import { apiGet, apiPost } from '@/lib/api';
import { getCurrentUser } from '@/lib/auth-client';
import { currency, formatDate, formatTime } from '@/lib/format';
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

export function BookingClient() {
  const router = useRouter();
  const params = useSearchParams();
  const flightId = params.get('flightId') ?? '';
  const classType = params.get('classType') ?? 'ECONOMY';
  const user = useMemo(() => getCurrentUser(), []);
  const [flight, setFlight] = useState<FlightDetail | null>(null);
  const [passengers, setPassengers] = useState<PassengerDraft[]>([emptyPassenger()]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [contactName, setContactName] = useState(user?.fullName ?? '');
  const [contactEmail, setContactEmail] = useState(user?.email ?? '');
  const [contactPhone, setContactPhone] = useState(user?.phone ?? '');
  const [promotionCode, setPromotionCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<BookingResponse | null>(null);

  useEffect(() => {
    if (!flightId) return;
    apiGet<FlightDetail>(`/flights/${flightId}`).then(setFlight).catch(() => toast.error('Không tải được thông tin chuyến bay.'));
  }, [flightId]);

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
    // Clear selected seats if count changes to avoid mismatch
    setSelectedSeats([]);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!flightId) {
      toast.error('Thiếu chuyến bay để đặt vé.');
      return;
    }

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
      toast.success('Giữ chỗ thành công. Bạn có thể thanh toán ngay.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể tạo đơn đặt vé.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[1fr_360px]">
      <form onSubmit={submit} className="grid gap-5">
        <section className="rounded border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">Bước 1</p>
              <h1 className="mt-1 text-2xl font-bold text-ink">Thông tin hành khách</h1>
              <p className="mt-1 text-sm text-slate-500">Nhập đúng họ tên theo giấy tờ tùy thân để xuất vé.</p>
            </div>
            <label className="grid gap-1 text-sm font-semibold text-slate-700">
              Số khách
              <input type="number" min={1} max={9} value={passengers.length} onChange={(event) => setPassengerCount(Number(event.target.value))} className="h-11 w-28 rounded border border-slate-300 px-3" />
            </label>
          </div>

          <div className="mt-5 grid gap-4">
            {passengers.map((passenger, index) => (
              <div key={index} className="rounded border border-slate-200 bg-slate-50 p-4">
                <div className="mb-4 flex items-center justify-between gap-2 font-semibold text-ink">
                  <div className="flex items-center gap-2">
                    <UserRound size={18} /> Hành khách {index + 1}
                  </div>
                  {selectedSeats[index] && (
                    <div className="flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-700">
                      <Armchair size={14} /> Ghế {selectedSeats[index]}
                    </div>
                  )}
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="Họ" value={passenger.lastName} onChange={(value) => updatePassenger(index, 'lastName', value)} required />
                  <Field label="Tên đệm và tên" value={passenger.firstName} onChange={(value) => updatePassenger(index, 'firstName', value)} required />
                  <label className="grid gap-1 text-sm font-semibold text-slate-700">
                    Loại khách
                    <select value={passenger.passengerType} onChange={(event) => updatePassenger(index, 'passengerType', event.target.value)} className="h-11 rounded border border-slate-300 bg-white px-3">
                      <option value="ADULT">Người lớn</option>
                      <option value="CHILD">Trẻ em</option>
                      <option value="INFANT">Em bé</option>
                    </select>
                  </label>
                  <label className="grid gap-1 text-sm font-semibold text-slate-700">
                    Giới tính
                    <select value={passenger.gender} onChange={(event) => updatePassenger(index, 'gender', event.target.value)} className="h-11 rounded border border-slate-300 bg-white px-3">
                      <option value="MALE">Nam</option>
                      <option value="FEMALE">Nữ</option>
                    </select>
                  </label>
                  <Field label="CCCD/Hộ chiếu" value={passenger.idNumber} onChange={(value) => updatePassenger(index, 'idNumber', value)} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <Armchair className="text-brand-600" size={20} />
            <h2 className="text-xl font-bold text-ink">Chọn chỗ ngồi trên máy bay</h2>
          </div>
          <SeatSelection 
            flightId={flightId} 
            passengerCount={passengers.length} 
            selectedSeats={selectedSeats} 
            onSelect={setSelectedSeats} 
          />
        </section>

        <section className="rounded border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <ContactRound className="text-brand-600" size={20} />
            <h2 className="text-xl font-bold text-ink">Thông tin liên hệ nhận vé</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <Field label="Người liên hệ" value={contactName} onChange={setContactName} required />
            <Field label="Email nhận vé" type="email" value={contactEmail} onChange={setContactEmail} required />
            <Field label="Số điện thoại" value={contactPhone ?? ''} onChange={setContactPhone} required />
          </div>
          <div className="mt-4 max-w-sm">
            <Field label="Mã khuyến mãi" value={promotionCode} onChange={(value) => setPromotionCode(value.toUpperCase())} />
            <p className="mt-2 text-xs text-slate-500">Có thể dùng mã mẫu BAYNGAY hoặc DAILY100 sau khi seed dữ liệu.</p>
          </div>
        </section>

        <button disabled={loading || !flightId} className="flex h-12 items-center justify-center gap-2 rounded bg-coral font-semibold text-white shadow-sm hover:bg-[#df4f43] disabled:opacity-60">
          {loading ? 'Đang giữ chỗ...' : 'Giữ chỗ và tạo đơn'}
          <ArrowRight size={18} />
        </button>
      </form>

      <aside className="h-fit rounded border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">Tóm tắt chuyến bay</p>
        {flight ? (
          <div className="mt-4 grid gap-4">
            <div className="rounded bg-slate-50 p-4">
              <div className="flex items-center gap-2 font-bold text-ink">
                <Plane size={18} /> {flight.airline.name}
              </div>
              <p className="mt-1 text-sm text-slate-500">{flight.flightNumber} · {flight.aircraft || 'Máy bay thân hẹp'}</p>
              <p className="mt-4 font-semibold text-ink">
                {flight.route.departure.code} → {flight.route.arrival.code}
              </p>
              <p className="text-sm text-slate-500">
                {formatDate(flight.departureTime)} · {formatTime(flight.departureTime)} - {formatTime(flight.arrivalTime)}
              </p>
            </div>
            <div className="grid gap-2 text-sm text-slate-600">
              <SummaryLine label="Hạng ghế" value={classType === 'BUSINESS' ? 'Thương gia' : 'Phổ thông'} />
              <SummaryLine label="Hành khách" value={`${passengers.length} khách`} />
              <SummaryLine label="Hành lý" value={`${selectedClass?.baggageKg ?? 0}kg/người`} />
              <SummaryLine label="Giá tạm tính" value={estimatedTotal > 0 ? currency.format(estimatedTotal) : 'Đang tính'} />
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">Đang tải thông tin chuyến bay...</p>
        )}

        {booking && (
          <div className="mt-5 rounded border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-center gap-2 font-semibold text-emerald-700">
              <CircleCheck size={18} /> Đã tạo đơn
            </div>
            <p className="mt-3 text-sm text-slate-600">Mã đặt vé</p>
            <p className="text-2xl font-bold text-brand-700">{booking.bookingCode}</p>
            <p className="mt-2 font-semibold text-ink">{currency.format(booking.totalAmountVND)}</p>
            <Link href={`/payment?bookingId=${booking.id}`} className="mt-4 flex h-11 items-center justify-center rounded bg-brand-600 font-semibold text-white">
              Thanh toán ngay
            </Link>
          </div>
        )}
      </aside>
    </main>
  );
}

function Field({ label, value, onChange, type = 'text', required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return (
    <label className="grid gap-1 text-sm font-semibold text-slate-700">
      {label}
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} required={required} className="h-11 rounded border border-slate-300 bg-white px-3 text-ink outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100" />
    </label>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 py-2 last:border-0">
      <span>{label}</span>
      <span className="font-semibold text-ink">{value}</span>
    </div>
  );
}
