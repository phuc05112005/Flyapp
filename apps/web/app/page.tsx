import Link from 'next/link';
import { Suspense } from 'react';
import type { ReactNode } from 'react';
import { BadgeCheck, CircleCheck, Headphones, PlaneTakeoff, ReceiptText, ShieldCheck, TicketCheck, WalletCards } from 'lucide-react';
import { SearchForm } from '@/components/search/search-form';

export default function HomePage() {
  return (
    <main className="bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 lg:grid-cols-[1fr_460px] lg:items-center lg:py-14">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded border border-brand-100 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700">
              <BadgeCheck size={16} />
              Nền tảng đặt vé và quản trị đại lý
            </div>
            <h1 className="mt-6 text-4xl font-bold leading-tight text-ink md:text-6xl">
              Đặt vé máy bay nhanh, rõ giá, quản lý đơn chuyên nghiệp.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 md:text-lg">
              Khách hàng tìm chuyến bay, tạo tài khoản, giữ chỗ và thanh toán. Đại lý theo dõi booking, trạng thái xuất vé, doanh thu và thông tin khách trong một hệ thống thống nhất.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/search" className="btn-primary min-h-12 px-5">
                Tìm chuyến bay
              </Link>
              <Link href="/login" className="btn-secondary min-h-12 px-5">
                Đăng nhập / tạo tài khoản
              </Link>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <Value icon={<ShieldCheck size={19} />} label="Giá đã gồm phí" />
              <Value icon={<WalletCards size={19} />} label="Thanh toán mock" />
              <Value icon={<Headphones size={19} />} label="Theo dõi vé 24/7" />
            </div>
          </div>

          <div className="rounded border border-slate-200 bg-white p-5 shadow-soft">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">Tìm kiếm tức thì</p>
                <p className="text-lg font-bold text-ink">Chuyến bay nội địa</p>
              </div>
              <div className="grid h-12 w-12 place-items-center rounded bg-brand-600 text-white">
                <PlaneTakeoff size={23} />
              </div>
            </div>
            <Suspense fallback={<div className="h-48 rounded bg-slate-50" />}>
              <SearchForm />
            </Suspense>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 lg:grid-cols-[1fr_380px]">
        <div className="grid gap-6 md:grid-cols-3">
          <Feature title="Giữ chỗ thông minh" description="Tạo booking, giữ ghế, lưu PNR mock và kiểm soát số ghế còn lại theo từng hạng." />
          <Feature title="Tài khoản khách hàng" description="Khách đăng ký, xem lại lịch sử đặt vé, tiếp tục thanh toán và tra cứu vé điện tử." />
          <Feature title="Dashboard đại lý" description="Theo dõi doanh thu, đơn chờ xử lý, vé đã xuất và thông tin khách hàng mới nhất." />
        </div>

        <div className="rounded border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 font-bold text-ink">
            <TicketCheck className="text-brand-600" size={20} />
            Vé mẫu đã xuất
          </div>
          <div className="mt-5 rounded bg-slate-950 p-5 text-white">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-slate-300">HAN → SGN</p>
                <p className="mt-1 text-2xl font-bold">VN317</p>
              </div>
              <PlaneTakeoff size={28} />
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-400">Khởi hành</p>
                <p className="font-semibold">07:20</p>
              </div>
              <div>
                <p className="text-slate-400">PNR</p>
                <p className="font-semibold">VF8K2P</p>
              </div>
            </div>
          </div>
          <div className="mt-4 grid gap-2 text-sm text-slate-600">
            <Line text="Xác nhận thanh toán sinh vé tự động" />
            <Line text="Tra cứu booking bằng mã đặt vé" />
            <Line text="Đại lý xem đơn mới theo thời gian tạo" />
          </div>
        </div>
      </section>
    </main>
  );
}

function Value({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded border border-slate-200 bg-white p-4 shadow-sm">
      <span className="text-brand-600">{icon}</span>
      <span className="text-sm font-semibold text-slate-700">{label}</span>
    </div>
  );
}

function Feature({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded bg-brand-50 text-brand-700">
        <ReceiptText size={22} />
      </div>
      <p className="mt-5 text-lg font-bold text-ink">{title}</p>
      <p className="mt-3 text-sm leading-7 text-slate-500">{description}</p>
    </div>
  );
}

function Line({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2">
      <CircleCheck size={15} className="text-emerald-600" />
      <span>{text}</span>
    </div>
  );
}
