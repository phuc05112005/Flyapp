'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import type { ReactNode } from 'react';
import { 
  BadgeCheck, 
  CircleCheck, 
  Headphones, 
  PlaneTakeoff, 
  ReceiptText, 
  ShieldCheck, 
  TicketCheck, 
  WalletCards,
  ArrowRight,
  Globe,
  Zap,
  Star
} from 'lucide-react';
import { motion } from 'framer-motion';
import { SearchForm } from '@/components/search/search-form';

export default function HomePage() {
  return (
    <main className="bg-slate-50 overflow-hidden">
      {/* Hero Section */}
      <section className="relative border-b border-slate-200 bg-white pt-20 pb-24 lg:pt-32 lg:pb-40">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
           <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-50 rounded-full blur-[120px] opacity-60"></div>
           <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-coral/5 rounded-full blur-[120px] opacity-60"></div>
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-16 px-4 lg:grid-cols-[1fr_500px] lg:items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-5 py-2 text-sm font-bold text-brand-700 shadow-sm">
              <Sparkle icon={<BadgeCheck size={16} />} />
              NỀN TẢNG ĐẶT VÉ CÔNG NGHỆ MỚI 2026
            </div>
            
            <h1 className="mt-8 text-5xl font-black leading-[1.1] text-ink md:text-7xl">
              Sải cánh vươn xa <br />
              <span className="text-brand-600 italic">Giá luôn tốt nhất.</span>
            </h1>
            
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-slate-500 md:text-xl font-medium">
              Trải nghiệm đặt vé máy bay hiện đại nhất Việt Nam. Tìm kiếm thông minh, giữ chỗ tức thì, và thanh toán bảo mật chỉ trong vài bước.
            </p>
            
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/search" className="group flex h-14 items-center justify-center gap-3 rounded-2xl bg-coral px-8 font-black text-white shadow-xl shadow-coral/20 transition-all hover:bg-[#df4f43] hover:-translate-y-1">
                Tìm chuyến bay <ArrowRight size={20} strokeWidth={3} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/login" className="flex h-14 items-center justify-center gap-3 rounded-2xl border-2 border-slate-200 bg-white px-8 font-black text-ink transition-all hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700">
                Đăng nhập ngay
              </Link>
            </div>
            
            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              <Value icon={<ShieldCheck size={20} />} label="Giá minh bạch" />
              <Value icon={<Globe size={20} />} label="Mạng lưới rộng" />
              <Value icon={<Star size={20} />} label="Hỗ trợ 24/7" />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="rounded-[40px] border border-slate-200 bg-white p-8 shadow-2xl relative"
          >
            <div className="absolute -top-6 -right-6 h-20 w-20 rounded-3xl bg-emerald-500 shadow-lg shadow-emerald-200 flex items-center justify-center text-white rotate-12">
               <Zap size={40} fill="currentColor" />
            </div>
            
            <div className="mb-8 flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tra cứu nhanh</p>
                <p className="text-2xl font-black text-ink">Tìm vé máy bay</p>
              </div>
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-200">
                <PlaneTakeoff size={28} strokeWidth={2.5} />
              </div>
            </div>
            
            <Suspense fallback={<div className="h-64 rounded-3xl bg-slate-50 animate-pulse" />}>
              <SearchForm />
            </Suspense>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mx-auto max-w-7xl px-4 py-24">
        <div className="text-center mb-16">
           <h2 className="text-3xl font-black text-ink md:text-5xl">Dịch vụ tiêu chuẩn 5 sao</h2>
           <p className="mt-4 text-slate-500 font-medium">Chúng tôi tối ưu hóa mọi quy trình để bạn có chuyến đi hoàn hảo nhất.</p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <Feature 
            icon={<ReceiptText size={26} />} 
            title="Giữ chỗ thông minh" 
            description="Cho phép giữ chỗ trong 15 phút mà không cần thanh toán ngay, giúp bạn có thời gian kiểm tra kỹ thông tin." 
            delay={0.1}
          />
          <Feature 
            icon={<WalletCards size={26} />} 
            title="Thanh toán đa dạng" 
            description="Hỗ trợ tất cả các phương thức thanh toán phổ biến: Chuyển khoản, Thẻ quốc tế, Ví điện tử MoMo, ZaloPay." 
            delay={0.2}
          />
          <Feature 
            icon={<TicketCheck size={26} />} 
            title="Vé điện tử tức thì" 
            description="Nhận ngay vé điện tử qua Email và SMS ngay sau khi thanh toán thành công, tra cứu dễ dàng mọi lúc mọi nơi." 
            delay={0.3}
          />
        </div>
      </section>

      {/* Ticket Showcase Section */}
      <section className="bg-slate-900 py-24 text-white">
         <div className="mx-auto max-w-7xl px-4 grid gap-16 lg:grid-cols-2 lg:items-center">
            <div>
               <h2 className="text-4xl font-black leading-tight md:text-6xl">
                 Quản lý hành trình <br />
                 <span className="text-brand-400">chuyên nghiệp hơn.</span>
               </h2>
               <p className="mt-6 text-lg text-slate-400 font-medium leading-relaxed">
                 Hệ thống quản trị đại lý mạnh mẽ giúp bạn theo dõi đơn hàng, doanh thu và xuất vé tự động chỉ với 1 cú click.
               </p>
               <div className="mt-10 flex gap-6">
                  <div className="flex flex-col gap-1">
                     <span className="text-3xl font-black text-brand-400">100k+</span>
                     <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Vé đã xuất</span>
                  </div>
                  <div className="h-12 w-px bg-slate-800"></div>
                  <div className="flex flex-col gap-1">
                     <span className="text-3xl font-black text-emerald-400">2.5k</span>
                     <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Đại lý tin dùng</span>
                  </div>
               </div>
            </div>

            <motion.div 
               whileHover={{ scale: 1.02 }}
               className="relative"
            >
               <div className="absolute inset-0 bg-brand-500 rounded-[40px] blur-[80px] opacity-20"></div>
               <div className="relative rounded-[40px] border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-8">
                     <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-2xl bg-brand-600 flex items-center justify-center font-black">VF</div>
                        <span className="font-bold text-lg tracking-tight">VIETFLY AGENCY</span>
                     </div>
                     <span className="rounded-full bg-emerald-500/20 px-4 py-1.5 text-xs font-black text-emerald-400">ĐÃ THANH TOÁN</span>
                  </div>
                  
                  <div className="flex items-center justify-between gap-4 border-y border-white/10 py-8">
                     <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Khởi hành</p>
                        <p className="text-3xl font-black mt-1">HAN</p>
                        <p className="text-xs text-slate-400">Hà Nội</p>
                     </div>
                     <div className="flex flex-1 flex-col items-center">
                        <PlaneTakeoff size={24} className="text-brand-400" />
                        <div className="mt-2 h-px w-full bg-white/20 relative">
                           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-brand-400"></div>
                        </div>
                        <span className="mt-2 text-[10px] font-bold text-slate-500">2h 10m</span>
                     </div>
                     <div className="text-right">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Điểm đến</p>
                        <p className="text-3xl font-black mt-1">SGN</p>
                        <p className="text-xs text-slate-400">TP. HCM</p>
                     </div>
                  </div>

                  <div className="mt-8 grid grid-cols-2 gap-8">
                     <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mã PNR</p>
                        <p className="text-xl font-black text-brand-400 mt-1 uppercase">VF8K2P</p>
                     </div>
                     <div className="text-right">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Chuyến bay</p>
                        <p className="text-xl font-black mt-1">VN317</p>
                     </div>
                  </div>
               </div>
            </motion.div>
         </div>
      </section>
    </main>
  );
}

function Sparkle({ icon }: { icon: ReactNode }) {
  return <span className="text-brand-500 animate-pulse">{icon}</span>;
}

function Value({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-brand-600 shadow-inner">
        {icon}
      </div>
      <span className="text-sm font-bold text-slate-700">{label}</span>
    </div>
  );
}

function Feature({ icon, title, description, delay }: { icon: ReactNode; title: string; description: string; delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      viewport={{ once: true }}
      className="group rounded-[40px] border border-slate-200 bg-white p-10 shadow-sm transition-all hover:border-brand-200 hover:shadow-2xl hover:-translate-y-2"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-brand-50 text-brand-700 group-hover:bg-brand-600 group-hover:text-white transition-colors duration-500 shadow-inner">
        {icon}
      </div>
      <h3 className="mt-8 text-2xl font-black text-ink">{title}</h3>
      <p className="mt-4 text-slate-500 leading-relaxed font-medium">{description}</p>
    </motion.div>
  );
}
