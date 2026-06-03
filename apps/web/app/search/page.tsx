import { AlertCircle, PlaneTakeoff, SlidersHorizontal } from 'lucide-react';
import { Suspense } from 'react';
import { FlightCard } from '@/components/search/flight-card';
import { SearchFilters } from '@/components/search/search-filters';
import { SearchForm } from '@/components/search/search-form';
import { apiGet, FlightResult } from '@/lib/api';
import { currency, formatDate } from '@/lib/format';

type SearchPageProps = {
  searchParams: Record<string, string | undefined>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const from = searchParams.from ?? 'HAN';
  const to = searchParams.to ?? 'SGN';
  const date = searchParams.date ?? new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const adults = searchParams.adults ?? '1';
  const classType = searchParams.classType ?? 'ECONOMY';
  const airline = searchParams.airline ?? '';
  const time = searchParams.time ?? '';
  const baggage = searchParams.baggage === '1';
  const seats = searchParams.seats === '1';
  const query = new URLSearchParams({ from, to, date, adults, classType });
  if (airline) query.set('airline', airline);

  let apiError = '';
  const fetchedFlights = await apiGet<FlightResult[]>(`/flights/search?${query.toString()}`).catch((error) => {
    apiError = error instanceof Error ? error.message : 'Không thể kết nối API.';
    return [];
  });
  const flights = applyFilters(fetchedFlights, { time, baggage, seats });
  const cheapest = flights.length > 0 ? Math.min(...flights.map((flight) => flight.displayPriceVND)) : 0;

  return (
    <main className="bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <Suspense fallback={<div className="h-48 rounded bg-slate-50" />}>
            <SearchForm />
          </Suspense>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[280px_1fr]">
        <aside className="h-fit rounded border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <SlidersHorizontal className="text-brand-600" size={18} />
            <p className="font-semibold text-ink">Bộ lọc</p>
          </div>
          <Suspense fallback={<div className="h-40 rounded bg-slate-50" />}>
            <SearchFilters />
          </Suspense>
        </aside>

        <section className="grid gap-4">
          <div className="rounded border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-brand-700">{from} → {to}</p>
            <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-ink">Chuyến bay ngày {formatDate(date)}</h1>
                <p className="text-sm text-slate-500">
                  {flights.length} kết quả · {adults} khách · {classType === 'BUSINESS' ? 'Thương gia' : 'Phổ thông'}
                </p>
              </div>
              {cheapest > 0 && (
                <div className="text-left sm:text-right">
                  <p className="text-xs text-slate-500">Giá tốt nhất</p>
                  <p className="text-xl font-bold text-coral">{currency.format(cheapest)}</p>
                </div>
              )}
            </div>
          </div>

          {apiError ? (
            <div className="rounded border border-amber-200 bg-amber-50 p-8 text-center shadow-sm">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-amber-100 text-amber-600">
                <AlertCircle size={28} />
              </div>
              <h2 className="mt-4 text-lg font-bold text-amber-900">Thông báo từ hệ thống</h2>
              <p className="mt-2 text-slate-600">{apiError}</p>
              <div className="mt-6 flex justify-center">
                <button 
                  onClick={() => window.location.reload()} 
                  className="rounded bg-amber-600 px-5 py-2 text-sm font-semibold text-white hover:bg-amber-700"
                >
                  Tải lại trang
                </button>
              </div>
            </div>
          ) : flights.length > 0 ? (
            flights.map((flight) => <FlightCard key={flight.id} flight={flight} />)
          ) : (
            <div className="rounded border border-slate-200 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-slate-50 text-slate-400">
                <PlaneTakeoff size={32} />
              </div>
              <h3 className="mt-5 text-xl font-bold text-ink">Không tìm thấy chuyến bay</h3>
              <p className="mt-2 text-slate-500">
                Rất tiếc, chúng tôi không tìm thấy chuyến bay nào phù hợp với yêu cầu của bạn vào ngày {formatDate(date)}.
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Hãy thử chọn ngày khác hoặc thay đổi bộ lọc tìm kiếm.
              </p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function applyFilters(flights: FlightResult[], filters: { time: string; baggage: boolean; seats: boolean }) {
  return flights.filter((flight) => {
    if (filters.baggage && flight.baggageKg <= 0) return false;
    if (filters.seats && flight.availableSeats < 20) return false;
    if (filters.time) {
      const hour = new Date(flight.departureTime).getHours();
      if (filters.time === 'morning' && (hour < 6 || hour >= 12)) return false;
      if (filters.time === 'afternoon' && (hour < 12 || hour >= 18)) return false;
      if (filters.time === 'evening' && (hour < 18 || hour > 23)) return false;
    }
    return true;
  });
}
