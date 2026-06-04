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
  Star,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { SearchForm } from '@/components/search/search-form';

export default function HomePage() {
  return (
    <main className="bg-slate-50 overflow-hidden">
      {/* Hero Section */}
      <section className="relative bg-white pt-20 pb-24 lg:pt-28 lg:pb-32">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
           <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-50 rounded-full blur-[140px] opacity-40"></div>
           <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-coral/5 rounded-full blur-[140px] opacity-40"></div>
        </div>

        <div className="relative mx-auto max-w-7xl px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-5 py-2 text-[10px] font-black tracking-widest text-brand-700 shadow-sm mb-8">
              <BadgeCheck size={14} className="text-brand-500" />
              NỀN TẢNG ĐẶT VÉ CÔNG NGHỆ MỚI 2026
            </div>
            
            <h1 className="text-5xl font-black leading-[1.1] text-ink md:text-7xl lg:text-8xl">
              Sải cánh vươn xa <br />
              <span className="text-brand-600 italic">Giá luôn tốt nhất.</span>
            </h1>
            
            <p className="mt-8 mx-auto max-w-2xl text-lg leading-relaxed text-slate-500 font-medium">
              Trải nghiệm đặt vé máy bay hiện đại nhất Việt Nam. Tìm kiếm thông minh, <br className="hidden md:block" /> giữ chỗ tức thì, và thanh toán bảo mật chỉ trong vài bước.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto max-w-6xl rounded-[48px] border border-slate-200 bg-white p-6 md:p-10 shadow-[0_32px_64px_-12px_rgba(15,23,42,0.12)] relative"
          >
            <div className="absolute -top-6 -right-6 hidden lg:flex h-24 w-24 rounded-[32px] bg-emerald-500 shadow-xl shadow-emerald-200 items-center justify-center text-white rotate-12 z-20">
               <Zap size={48} fill="currentColor" />
            </div>
            
            <Suspense fallback={<div className="h-64 rounded-3xl bg-slate-50 animate-pulse" />}>
              <SearchForm />
            </Suspense>
          </motion.div>

          <div className="mt-16 flex flex-wrap justify-center gap-8 md:gap-16">
            <Value icon={<ShieldCheck size={20} />} label="Giá vé minh bạch" />
            <Value icon={<Globe size={20} />} label="Mạng lưới 200+ sân bay" />
            <Value icon={<Star size={20} />} label="Hỗ trợ đại lý 24/7" />
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 border-y border-slate-100 bg-slate-50/50">
         <div className="mx-auto max-w-7xl px-4 flex flex-wrap justify-center items-center gap-12 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="font-black text-2xl tracking-tighter">VIETNAM AIRLINES</div>
            <div className="font-black text-2xl tracking-tighter">VIETJET AIR</div>
            <div className="font-black text-2xl tracking-tighter">BAMBOO AIRWAYS</div>
            <div className="font-black text-2xl tracking-tighter">VIETRAVEL AIRLINES</div>
         </div>
      </section>

      {/* Features Section */}
      <section className="mx-auto max-w-7xl px-4 py-24 lg:py-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
           <div className="max-w-2xl">
              <h2 className="text-4xl font-black text-ink md:text-5xl">Dịch vụ hàng không <br /> tiêu chuẩn 5 sao</h2>
              <p className="mt-6 text-lg text-slate-500 font-medium">Chúng tôi tối ưu hóa mọi quy trình để bạn có chuyến đi hoàn hảo nhất.</p>
           </div>
           <Link href="/search" className="flex items-center gap-2 font-black text-brand-600 hover:gap-3 transition-all">
              TÌM HIỂU THÊM <ChevronRight size={20} strokeWidth={3} />
           </Link>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <Feature 
            icon={<ReceiptText size={28} />} 
            title="Giữ chỗ thông minh" 
            description="Cho phép giữ chỗ trong 15 phút mà không cần thanh toán ngay, giúp bạn có thời gian kiểm tra kỹ thông tin." 
            delay={0.1}
          />
          <Feature 
            icon={<WalletCards size={28} />} 
            title="Thanh toán đa dạng" 
            description="Hỗ trợ tất cả các phương thức thanh toán phổ biến: Chuyển khoản, Thẻ quốc tế, Ví điện tử MoMo, ZaloPay." 
            delay={0.2}
          />
          <Feature 
            icon={<TicketCheck size={28} />} 
            title="Vé điện tử tức thì" 
            description="Nhận ngay vé điện tử qua Email và SMS ngay sau khi thanh toán thành công, tra cứu dễ dàng mọi lúc mọi nơi." 
            delay={0.3}
          />
        </div>
      </section>

      {/* Ticket Showcase Section */}
      <section className="mx-auto max-w-[90rem] px-4 pb-24">
         <div className="bg-slate-900 rounded-[64px] overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-full">
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-brand-600 rounded-full blur-[120px] opacity-20"></div>
            </div>
            
            <div className="relative px-8 py-20 md:px-20 lg:py-32 grid gap-16 lg:grid-cols-2 lg:items-center">
               <div>
                  <h2 className="text-5xl font-black leading-tight text-white md:text-7xl">
                    Quản lý <br />
                    <span className="text-brand-400">chuyên nghiệp.</span>
                  </h2>
                  <p className="mt-8 text-xl text-slate-400 font-medium leading-relaxed max-w-xl">
                    Hệ thống quản trị đại lý mạnh mẽ giúp bạn theo dõi đơn hàng, doanh thu và xuất vé tự động chỉ với 1 cú click.
                  </p>
                  <div className="mt-12 flex flex-wrap gap-10">
                     <div className="flex flex-col gap-2">
                        <span className="text-4xl font-black text-brand-400">100k+</span>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Vé đã xuất</span>
                     </div>
                     <div className="hidden sm:block h-16 w-px bg-slate-800"></div>
                     <div className="flex flex-col gap-2">
                        <span className="text-4xl font-black text-emerald-400">2.5k</span>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Đại lý tin dùng</span>
                     </div>
                  </div>
               </div>

               <motion.div 
                  whileHover={{ scale: 1.02, rotate: -1 }}
                  className="relative"
               >
                  <div className="relative rounded-[48px] border border-white/10 bg-white/5 p-8 md:p-12 backdrop-blur-2xl shadow-2xl">
                     <div className="flex items-center justify-between mb-12">
                        <div className="flex items-center gap-4">
                           <div className="h-14 w-14 rounded-2xl bg-brand-600 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-brand-600/20">VF</div>
                           <span className="font-black text-xl text-white tracking-tight">VIETFLY AGENCY</span>
                        </div>
                        <span className="rounded-full bg-emerald-500/20 px-5 py-2 text-[10px] font-black text-emerald-400 border border-emerald-500/30">ĐÃ THANH TOÁN</span>
                     </div>
                     
                     <div className="flex items-center justify-between gap-6 border-y border-white/10 py-12">
                        <div>
                           <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Khởi hành</p>
                           <p className="text-5xl font-black text-white mt-2">HAN</p>
                           <p className="text-sm text-slate-400 font-medium mt-1">Hà Nội</p>
                        </div>
                        <div className="flex flex-1 flex-col items-center">
                           <PlaneTakeoff size={32} className="text-brand-400" />
                           <div className="mt-4 h-0.5 w-full bg-white/10 relative">
                              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-brand-400 shadow-[0_0_15px_rgba(96,165,250,0.5)]"></div>
                           </div>
                           <span className="mt-4 text-xs font-black text-slate-500 uppercase tracking-widest">2h 10m</span>
                        </div>
                        <div className="text-right">
                           <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Điểm đến</p>
                           <p className="text-5xl font-black text-white mt-2">SGN</p>
                           <p className="text-sm text-slate-400 font-medium mt-1">TP. HCM</p>
                        </div>
                     </div>

                     <div className="mt-12 grid grid-cols-2 gap-12">
                        <div>
                           <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Mã đặt vé (PNR)</p>
                           <p className="text-2xl font-black text-brand-400 mt-2 uppercase tracking-wider">VF8K2P</p>
                        </div>
                        <div className="text-right">
                           <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Số hiệu</p>
                           <p className="text-2xl font-black text-white mt-2">VN317</p>
                        </div>
                     </div>
                  </div>
               </motion.div>
            </div>
         </div>
      </section>
    </main>
  );
}

function Value({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-brand-600 shadow-[0_8px_16px_-4px_rgba(15,23,42,0.08)] border border-slate-100">
        {icon}
      </div>
      <span className="text-sm font-black text-slate-700 uppercase tracking-tight">{label}</span>
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
      className="group rounded-[48px] border border-slate-200 bg-white p-12 shadow-sm transition-all hover:border-brand-200 hover:shadow-[0_40px_80px_-15px_rgba(15,23,42,0.1)] hover:-translate-y-2"
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-[28px] bg-brand-50 text-brand-700 group-hover:bg-brand-600 group-hover:text-white transition-all duration-500 shadow-inner">
        {icon}
      </div>
      <h3 className="mt-10 text-3xl font-black text-ink">{title}</h3>
      <p className="mt-6 text-lg text-slate-500 leading-relaxed font-medium">{description}</p>
    </motion.div>
  );
}
