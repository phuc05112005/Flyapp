import { AlertCircle, SlidersHorizontal } from 'lucide-react';
import { FlightCard } from '@/components/search/flight-card';
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
  const query = new URLSearchParams({ from, to, date, adults, classType });
  let apiError = '';
  const flights = await apiGet<FlightResult[]>(`/flights/search?${query.toString()}`).catch((error) => {
    apiError = error instanceof Error ? error.message : 'Không thể kết nối API.';
    return [];
  });
  const cheapest = flights.length > 0 ? Math.min(...flights.map((flight) => flight.displayPriceVND)) : 0;

  return (
    <main className="bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <SearchForm />
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[280px_1fr]">
        <aside className="h-fit rounded border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="text-brand-600" size={18} />
            <p className="font-semibold text-ink">Bộ lọc</p>
          </div>
          <div className="mt-5 grid gap-5 text-sm text-slate-600">
            <FilterGroup title="Hãng bay" items={['Vietnam Airlines', 'VietJet Air', 'Bamboo Airways']} />
            <FilterGroup title="Giờ khởi hành" items={['Sáng 06:00 - 12:00', 'Chiều 12:00 - 18:00', 'Tối 18:00 - 23:00']} />
            <FilterGroup title="Tiện ích" items={['Có hành lý ký gửi', 'Bay thẳng', 'Còn nhiều ghế']} />
          </div>
        </aside>

        <section className="grid gap-4">
          <div className="rounded border border-slate-200 bg-white p-5">
            <p className="text-sm font-semibold text-brand-700">{from} → {to}</p>
            <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-ink">Chuyến bay ngày {formatDate(date)}</h1>
                <p className="text-sm text-slate-500">{flights.length} kết quả · {adults} khách · {classType === 'BUSINESS' ? 'Thương gia' : 'Phổ thông'}</p>
              </div>
              {cheapest > 0 && (
                <div className="text-right">
                  <p className="text-xs text-slate-500">Giá tốt nhất</p>
                  <p className="text-xl font-bold text-coral">{currency.format(cheapest)}</p>
                </div>
              )}
            </div>
          </div>

          {apiError ? (
            <div className="rounded border border-amber-200 bg-amber-50 p-6 text-amber-900">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5" size={20} />
                <div>
                  <p className="font-semibold">Backend API chưa sẵn sàng</p>
                  <p className="mt-1 text-sm">Hãy chạy `npm.cmd run dev:api` rồi tải lại trang. Nếu API đang chạy, kiểm tra `DATABASE_URL` và seed dữ liệu.</p>
                </div>
              </div>
            </div>
          ) : flights.length > 0 ? flights.map((flight) => <FlightCard key={flight.id} flight={flight} />) : (
            <div className="rounded border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
              Chưa có chuyến bay phù hợp. Hãy thử chọn ngày khác hoặc tuyến bay khác.
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function FilterGroup({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="mb-3 font-semibold text-ink">{title}</p>
      <div className="grid gap-2">
        {items.map((item) => (
          <label key={item} className="flex items-center gap-2">
            <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-brand-600" />
            {item}
          </label>
        ))}
      </div>
    </div>
  );
}
