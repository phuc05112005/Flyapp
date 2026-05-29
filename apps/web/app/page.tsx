import { SearchForm } from '@/components/search/search-form';
import {
  BadgeCheck,
  Headphones,
  PlaneTakeoff,
  ReceiptText,
  ShieldCheck,
  WalletCards
} from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-50">
      {/* HERO */}
      <section className="relative border-b border-slate-200 bg-white">
        <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-brand-100/40 blur-3xl" />
        <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-cyan-100/40 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-12 lg:grid-cols-[1fr_460px] lg:items-center lg:py-20">
          {/* LEFT */}
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700 shadow-sm">
              <BadgeCheck size={16} />
              Nền tảng bán vé cho đại lý Việt Nam
            </div>

            <h1 className="mt-6 text-3xl font-bold leading-tight tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
              Đặt vé máy bay nhanh,
              <span className="text-brand-600"> rõ giá </span>
              và chủ động hoa hồng.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 md:text-lg">
              Tìm chuyến bay, giữ chỗ, tạo đơn, thanh toán và quản lý doanh thu
              trên một hệ thống hiện đại dành cho đội bán vé chuyên nghiệp.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <ShieldCheck className="text-brand-600" size={20} />
                <span className="text-sm font-medium text-slate-700">
                  Giá đã cộng hoa hồng
                </span>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <WalletCards className="text-brand-600" size={20} />
                <span className="text-sm font-medium text-slate-700">
                  Nhiều phương thức thanh toán
                </span>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <Headphones className="text-brand-600" size={20} />
                <span className="text-sm font-medium text-slate-700">
                  Hỗ trợ online 24/7
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="relative w-full max-w-xl lg:ml-auto">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-200/40 blur-3xl" />

            <div className="relative rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    Tìm kiếm tức thì
                  </p>
                  <p className="text-lg font-semibold text-slate-900">
                    Chuyến bay nội địa
                  </p>
                </div>

                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-600 text-white shadow-lg">
                  <PlaneTakeoff size={24} />
                </div>
              </div>

              <SearchForm />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            [
              'Giữ chỗ 15 phút',
              'Tạo PNR mock trong môi trường dev, dễ dàng tích hợp provider thật.'
            ],
            [
              'Quy tắc hoa hồng',
              'Tự động cộng theo phần trăm hoặc số tiền cố định theo hãng.'
            ],
            [
              'Quản trị đại lý',
              'Theo dõi doanh thu, khách hàng và thao tác bán vé tập trung.'
            ]
          ].map(([title, description]) => (
            <div
              key={title}
              className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50">
                <ReceiptText className="text-brand-600" size={24} />
              </div>

              <p className="mt-5 text-lg font-semibold text-slate-900">
                {title}
              </p>

              <p className="mt-3 text-sm leading-7 text-slate-500">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* POPULAR ROUTES */}
      <section className="mx-auto max-w-7xl px-4 pb-20">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">
            Tuyến phổ biến
          </p>

          <h2 className="mt-2 text-3xl font-bold text-slate-900">
            Các hành trình bán chạy
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            ['Hà Nội', 'TP.HCM', 'HAN', 'SGN'],
            ['TP.HCM', 'Phú Quốc', 'SGN', 'PQC'],
            ['Hà Nội', 'Đà Nẵng', 'HAN', 'DAD']
          ].map(([fromCity, toCity, fromCode, toCode]) => (
            <div
              key={`${fromCode}-${toCode}`}
              className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-lg font-semibold text-slate-900">
                    {fromCity} → {toCity}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {fromCode} - {toCode}
                  </p>
                </div>

                <div className="rounded-2xl bg-brand-50 p-3">
                  <PlaneTakeoff className="text-brand-600" size={22} />
                </div>
              </div>

              <p className="mt-5 text-sm leading-7 text-slate-500">
                Nhiều khung giờ trong ngày, hiển thị giá cuối đã cộng hoa hồng
                đại lý.
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}