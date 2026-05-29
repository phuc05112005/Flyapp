import Link from 'next/link';
import { CircleCheck, Luggage, PlaneTakeoff, Timer } from 'lucide-react';
import { FlightResult } from '@/lib/api';
import { currency, formatDuration, formatTime } from '@/lib/format';

export function FlightCard({ flight }: { flight: FlightResult }) {
  return (
    <article className="rounded border border-slate-200 bg-white p-4 shadow-sm transition hover:border-brand-200 hover:shadow-soft">
      <div className="grid gap-5 lg:grid-cols-[180px_1fr_190px] lg:items-center">
        <div>
          <div className="flex h-11 w-11 items-center justify-center rounded bg-brand-50 font-bold text-brand-700">
            {flight.airline.code}
          </div>
          <p className="mt-3 font-semibold text-ink">{flight.airline.name}</p>
          <p className="text-sm text-slate-500">{flight.flightNumber} · {flight.aircraft ?? 'Máy bay thân hẹp'}</p>
        </div>

        <div>
          <div className="grid grid-cols-[72px_1fr_72px] items-center gap-3">
            <div>
              <p className="text-2xl font-bold text-ink">{formatTime(flight.departureTime)}</p>
              <p className="text-sm text-slate-500">{flight.route.departure.code}</p>
            </div>
            <div className="text-center">
              <p className="mb-2 inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                <Timer size={13} /> {formatDuration(flight.durationMin)}
              </p>
              <div className="relative h-px bg-slate-300">
                <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-600" />
              </div>
              <p className="mt-2 text-xs text-slate-500">Bay thẳng</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-ink">{formatTime(flight.arrivalTime)}</p>
              <p className="text-sm text-slate-500">{flight.route.arrival.code}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-slate-600">
            <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-1"><CircleCheck size={13} /> Còn {flight.availableSeats} ghế</span>
            <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-1"><Luggage size={13} /> {flight.baggageKg}kg hành lý</span>
            <span className="rounded bg-slate-100 px-2 py-1">{flight.classType === 'BUSINESS' ? 'Thương gia' : 'Phổ thông'}</span>
          </div>
        </div>

        <div className="rounded bg-slate-50 p-4 text-right">
          <p className="text-xs text-slate-500">Giá khách thấy</p>
          <p className="text-2xl font-bold text-coral">{currency.format(flight.displayPriceVND)}</p>
          <p className="mt-1 text-xs text-slate-500">Đã gồm phí và hoa hồng {currency.format(flight.markupVND)}</p>
          <Link href={`/booking?flightId=${flight.id}&classType=${flight.classType}`} className="mt-4 flex h-10 items-center justify-center gap-2 rounded bg-brand-600 px-4 font-semibold text-white transition hover:bg-brand-700">
            <PlaneTakeoff size={17} /> Chọn vé
          </Link>
        </div>
      </div>
    </article>
  );
}
