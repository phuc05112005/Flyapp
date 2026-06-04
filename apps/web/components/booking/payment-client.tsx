'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { 
  Building2, 
  CheckCircle2, 
  CreditCard, 
  Landmark, 
  QrCode, 
  WalletCards, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Ticket,
  ChevronRight,
  Printer
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiPost } from '@/lib/api';
import { currency, formatDate, formatTime } from '@/lib/format';

type PaymentResult = {
  paymentUrl: string | null;
  bankTransfer: null | {
    bankName: string;
    accountNumber: string;
    accountName: string;
    branch?: string | null;
    qrImageDataUrl?: string | null;
    note?: string | null;
    content: string;
    amountVND: number;
  };
};

type ConfirmedBooking = {
  id: string;
  bookingCode: string;
  status: string;
  totalAmountVND: number;
  paidAt?: string;
  tickets: { ticketNumber: string; pnrCode?: string }[];
  flight: {
    flightNumber: string;
    departureTime: string;
    arrivalTime: string;
    airline: { name: string };
    route: { departure: { code: string; city: string }; arrival: { code: string; city: string } };
  };
};

const methods = [
  { value: 'BANK_TRANSFER', label: 'Chuyển khoản QR', icon: QrCode, desc: 'Tự động duyệt trong 1-2 phút' },
  { value: 'VNPAY', label: 'VNPay / Thẻ ATM', icon: Landmark, desc: 'Hỗ trợ tất cả ngân hàng VN' },
  { value: 'MOMO', label: 'Ví MoMo', icon: WalletCards, desc: 'Thanh toán tức thì 24/7' },
  { value: 'CREDIT_CARD', label: 'Thẻ quốc tế', icon: CreditCard, desc: 'Visa, Mastercard, JCB' }
];

export function PaymentClient() {
  const bookingId = useSearchParams().get('bookingId') ?? '';
  const [method, setMethod] = useState('BANK_TRANSFER');
  const [result, setResult] = useState<PaymentResult | null>(null);
  const [confirmed, setConfirmed] = useState<ConfirmedBooking | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function initiate() {
    setLoading(true);
    try {
      const data = await apiPost<PaymentResult>('/payments/initiate', { bookingId, method });
      setResult(data);
      setConfirmed(null);
      toast.success('Đã chọn phương thức thanh toán.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể khởi tạo thanh toán.');
    } finally {
      setLoading(false);
    }
  }

  async function confirmPayment() {
    setConfirming(true);
    try {
      const data = await apiPost<ConfirmedBooking>(`/payments/${bookingId}/confirm`, {});
      setConfirmed(data);
      toast.success('Thanh toán thành công. Vé đã được xuất.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể xác nhận thanh toán.');
    } finally {
      setConfirming(false);
    }
  }

  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-4 py-12 lg:grid-cols-[1fr_400px]">
      <div className="space-y-8">
        <section className="rounded-[40px] border border-slate-200 bg-white p-8 md:p-12 shadow-sm">
          <div className="mb-10">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-600 mb-2">Bước cuối cùng</p>
            <h1 className="text-4xl font-black text-ink">Thanh toán vé máy bay</h1>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {methods.map(({ value, label, icon: Icon, desc }) => (
              <button 
                key={value} 
                onClick={() => setMethod(value)} 
                className={`
                  relative flex items-center gap-4 rounded-3xl border-2 p-5 text-left transition-all duration-300
                  ${method === value ? 'border-brand-600 bg-brand-50 shadow-lg shadow-brand-100' : 'border-slate-100 bg-white hover:border-brand-200'}
                `}
              >
                <div className={`
                  flex h-12 w-12 items-center justify-center rounded-2xl shadow-inner
                  ${method === value ? 'bg-brand-600 text-white' : 'bg-slate-50 text-slate-400'}
                `}>
                  <Icon size={24} />
                </div>
                <div>
                  <p className={`font-black text-sm ${method === value ? 'text-brand-700' : 'text-ink'}`}>{label}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">{desc}</p>
                </div>
                {method === value && (
                  <motion.div 
                    layoutId="active-payment"
                    className="absolute top-4 right-4 h-2 w-2 rounded-full bg-brand-600"
                  />
                )}
              </button>
            ))}
          </div>

          <button 
            disabled={loading || !bookingId || !!confirmed} 
            onClick={initiate} 
            className="mt-10 flex h-16 w-full items-center justify-center gap-3 rounded-3xl bg-brand-600 font-black text-white shadow-2xl shadow-brand-100 transition-all hover:bg-brand-700 hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:translate-y-0"
          >
            {loading ? 'Đang chuẩn bị...' : 'Tiếp tục thanh toán'} <ArrowRight size={20} />
          </button>
        </section>

        <AnimatePresence>
          {result && !confirmed && (
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[40px] border border-slate-200 bg-white p-8 md:p-12 shadow-xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-400 to-coral"></div>
              
              <div className="flex items-center gap-4 mb-8">
                <div className="h-12 w-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600">
                  <QrCode size={24} />
                </div>
                <div>
                   <h2 className="text-xl font-black text-ink">Quét mã để thanh toán</h2>
                   <p className="text-sm text-slate-500 font-medium">Hệ thống sẽ tự động xác nhận sau khi nhận được tiền.</p>
                </div>
              </div>

              {result.bankTransfer ? (
                <div className="grid gap-10 lg:grid-cols-[1fr_240px]">
                   <div className="space-y-4">
                      <BankInfo label="Tên ngân hàng" value={result.bankTransfer.bankName} />
                      <BankInfo label="Số tài khoản" value={result.bankTransfer.accountNumber} copyable />
                      <BankInfo label="Chủ tài khoản" value={result.bankTransfer.accountName} />
                      <BankInfo label="Số tiền" value={currency.format(result.bankTransfer.amountVND)} highlight />
                      <BankInfo label="Nội dung" value={result.bankTransfer.content} copyable highlight />
                   </div>
                   <div className="flex flex-col items-center">
                      <div className="relative rounded-[32px] border-8 border-slate-50 bg-white p-4 shadow-xl">
                         {result.bankTransfer.qrImageDataUrl ? (
                           // eslint-disable-next-line @next/next/no-img-element
                           <img src={result.bankTransfer.qrImageDataUrl} alt="QR" className="h-40 w-40 object-contain" />
                         ) : (
                           <div className="flex h-40 w-40 items-center justify-center rounded-2xl bg-slate-50 text-slate-300">
                              <QrCode size={64} strokeWidth={1} />
                           </div>
                         )}
                         <div className="absolute -bottom-3 -right-3 h-10 w-10 rounded-2xl bg-brand-600 flex items-center justify-center text-white shadow-lg">
                            <Zap size={20} fill="currentColor" />
                         </div>
                      </div>
                      <p className="mt-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Quét bằng ứng dụng ngân hàng hoặc ví điện tử</p>
                   </div>
                </div>
              ) : (
                <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm text-brand-600">
                    <Zap size={40} fill="currentColor" />
                  </div>
                  <h3 className="text-lg font-black text-ink">Đã kết nối cổng {method}</h3>
                  <p className="mt-2 text-sm text-slate-500 font-medium">Vui lòng nhấn nút xác nhận bên dưới sau khi hoàn tất thanh toán trên ứng dụng.</p>
                </div>
              )}

              <button 
                disabled={confirming} 
                onClick={confirmPayment} 
                className="mt-10 flex h-16 w-full items-center justify-center gap-3 rounded-3xl bg-emerald-600 font-black text-white shadow-2xl shadow-emerald-100 transition-all hover:bg-emerald-700 hover:-translate-y-1 active:scale-95 disabled:opacity-50"
              >
                {confirming ? (
                   <div className="flex items-center gap-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
                      ĐANG XÁC NHẬN...
                   </div>
                ) : (
                  <>
                    XÁC NHẬN ĐÃ CHUYỂN TIỀN <CheckCircle2 size={20} />
                  </>
                )}
              </button>
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      <aside className="space-y-6">
        <div className="sticky top-24 space-y-6">
          <AnimatePresence mode="wait">
            {confirmed ? (
              <motion.div 
                key="confirmed"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="overflow-hidden rounded-[40px] border border-emerald-200 bg-white shadow-2xl shadow-emerald-100"
              >
                <div className="bg-emerald-600 p-8 text-white text-center">
                   <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                      <Ticket size={32} strokeWidth={3} />
                   </div>
                   <h2 className="text-2xl font-black italic">VÉ ĐÃ XUẤT THÀNH CÔNG</h2>
                   <p className="mt-2 text-emerald-100 text-sm font-medium">Chúc bạn có một chuyến bay tốt đẹp!</p>
                </div>
                
                <div className="p-8 space-y-6">
                   <div className="flex items-center justify-between">
                      <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mã đặt vé</p>
                         <p className="text-3xl font-black text-brand-600">{confirmed.bookingCode}</p>
                      </div>
                      <div className="text-right">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</p>
                         <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black text-emerald-700">CONFIRMED</span>
                      </div>
                   </div>

                   <div className="rounded-3xl bg-slate-50 p-6 border border-slate-100">
                      <div className="flex items-center justify-between font-black text-ink mb-4">
                         <span>{confirmed.flight.route.departure.code}</span>
                         <div className="flex-1 flex flex-col items-center px-4">
                            <ArrowRight size={16} className="text-slate-300" />
                         </div>
                         <span>{confirmed.flight.route.arrival.code}</span>
                      </div>
                      <p className="text-xs font-bold text-slate-500 uppercase">{confirmed.flight.airline.name} · {confirmed.flight.flightNumber}</p>
                      <p className="mt-1 text-xs text-slate-400">{formatDate(confirmed.flight.departureTime)} | {formatTime(confirmed.flight.departureTime)}</p>
                   </div>

                   <div className="space-y-3">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Danh sách vé điện tử</p>
                      {confirmed.tickets.map((t) => (
                         <div key={t.ticketNumber} className="flex items-center justify-between rounded-2xl border border-slate-100 p-4 transition-colors hover:bg-slate-50">
                            <div>
                               <p className="text-sm font-black text-ink">{t.ticketNumber}</p>
                               <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">PNR: {t.pnrCode}</p>
                            </div>
                            <Printer size={16} className="text-slate-300" />
                         </div>
                      ))}
                   </div>

                   <Link href={`/track?code=${confirmed.bookingCode}`} className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 font-black text-white hover:bg-black transition-colors">
                      XEM CHI TIẾT <ChevronRight size={18} />
                   </Link>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="summary"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-[40px] border border-slate-200 bg-white p-8 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-8">
                   <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                      <ShieldCheck size={20} />
                   </div>
                   <div>
                      <h3 className="font-black text-ink">Bảo mật thanh toán</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Giao dịch an toàn 100%</p>
                   </div>
                </div>

                <div className="space-y-4">
                   <div className="flex items-center justify-between text-sm">
                      <span className="font-bold text-slate-500">Giá vé</span>
                      <span className="font-black text-ink">Đã bao gồm thuế</span>
                   </div>
                   <div className="flex items-center justify-between text-sm">
                      <span className="font-bold text-slate-500">Phí dịch vụ</span>
                      <span className="font-black text-emerald-600">MIỄN PHÍ</span>
                   </div>
                   <div className="pt-4 border-t border-dashed border-slate-200">
                      <div className="flex items-center justify-between">
                         <span className="text-lg font-black text-ink">Tổng tiền</span>
                         <span className="text-2xl font-black text-coral">VND</span>
                      </div>
                      <p className="mt-4 text-[11px] leading-relaxed text-slate-400 font-medium italic">
                         Sau khi thanh toán thành công, hệ thống sẽ tự động xuất vé và gửi thông báo qua Email/SMS của bạn.
                      </p>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="rounded-[32px] border border-orange-100 bg-orange-50/50 p-6">
             <div className="flex items-start gap-3">
                <Zap className="mt-0.5 text-orange-500" size={18} fill="currentColor" />
                <div>
                   <p className="text-xs font-black text-orange-900 uppercase">Lưu ý quan trọng</p>
                   <p className="mt-1 text-[11px] leading-relaxed text-orange-800/70 font-medium">
                     Nếu quá 15 phút không thanh toán, hệ thống sẽ tự động hủy lệnh giữ chỗ để nhường cho khách hàng khác.
                   </p>
                </div>
             </div>
          </div>
        </div>
      </aside>
    </main>
  );
}

function BankInfo({ label, value, copyable = false, highlight = false }: { label: string; value: string; copyable?: boolean; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between group">
       <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">{label}</span>
       <div className="flex items-center gap-2">
          <span className={`text-sm font-black transition-colors ${highlight ? 'text-brand-600' : 'text-ink group-hover:text-brand-600'}`}>
            {value}
          </span>
          {copyable && (
            <button className="h-6 w-6 rounded-md bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-brand-100 hover:text-brand-600 transition-colors">
               <Ticket size={12} />
            </button>
          )}
       </div>
    </div>
  );
}
