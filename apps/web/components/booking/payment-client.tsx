'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Building2, CheckCircle2, CreditCard, Landmark, QrCode, WalletCards } from 'lucide-react';
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
  { value: 'VNPAY', label: 'VNPay', icon: QrCode },
  { value: 'MOMO', label: 'MoMo', icon: WalletCards },
  { value: 'ZALOPAY', label: 'ZaloPay', icon: CreditCard },
  { value: 'BANK_TRANSFER', label: 'Chuyển khoản', icon: Landmark }
];

export function PaymentClient() {
  const bookingId = useSearchParams().get('bookingId') ?? '';
  const [method, setMethod] = useState('VNPAY');
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
      toast.success('Đã khởi tạo thanh toán.');
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
    <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1fr_360px]">
      <section className="rounded border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">Thanh toán</p>
        <h1 className="mt-1 text-2xl font-bold text-ink">Chọn phương thức thanh toán</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Với chuyển khoản, khách có thể quét QR và chuyển tiền vào tài khoản thật do đại lý cấu hình trong dashboard.
        </p>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {methods.map(({ value, label, icon: Icon }) => (
            <button key={value} onClick={() => setMethod(value)} className={`flex min-h-16 items-center gap-3 rounded border px-4 text-left transition ${method === value ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-700 hover:border-brand-200'}`}>
              <span className="grid h-10 w-10 place-items-center rounded bg-white shadow-sm">
                <Icon size={20} />
              </span>
              <span className="font-semibold">{label}</span>
            </button>
          ))}
        </div>

        <button disabled={loading || !bookingId} onClick={initiate} className="btn-primary mt-6 h-12 w-full">
          {loading ? 'Đang khởi tạo...' : 'Khởi tạo thanh toán'}
        </button>

        {result && (
          <div className="mt-6 rounded border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-2 font-semibold text-ink">
              <Building2 size={18} /> Thông tin thanh toán
            </div>

            {result.bankTransfer ? (
              <BankTransferPanel bankTransfer={result.bankTransfer} />
            ) : (
              <div className="mt-4 rounded border border-dashed border-slate-300 bg-white p-5 text-center">
                <QrCode className="mx-auto text-brand-600" size={42} />
                <p className="mt-3 font-semibold text-ink">Cổng thanh toán mock đã sẵn sàng</p>
                <p className="mt-1 text-sm text-slate-500">{result.paymentUrl}</p>
              </div>
            )}

            <button disabled={confirming} onClick={confirmPayment} className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded bg-brand-600 font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
              <CheckCircle2 size={18} />
              {confirming ? 'Đang xác nhận...' : 'Xác nhận đã thanh toán'}
            </button>
          </div>
        )}
      </section>

      <aside className="h-fit rounded border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">Kết quả</p>
        {confirmed ? (
          <div className="mt-4 grid gap-4">
            <div className="rounded border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-center gap-2 font-semibold text-emerald-700">
                <CheckCircle2 size={18} /> Đã xuất vé
              </div>
              <p className="mt-3 text-sm text-slate-600">Mã đặt vé</p>
              <p className="text-2xl font-bold text-brand-700">{confirmed.bookingCode}</p>
              <p className="mt-2 font-semibold text-ink">{currency.format(confirmed.totalAmountVND)}</p>
            </div>
            <div className="text-sm text-slate-600">
              <p className="font-semibold text-ink">{confirmed.flight.airline.name} · {confirmed.flight.flightNumber}</p>
              <p>{confirmed.flight.route.departure.city} → {confirmed.flight.route.arrival.city}</p>
              <p>{formatDate(confirmed.flight.departureTime)} · {formatTime(confirmed.flight.departureTime)} - {formatTime(confirmed.flight.arrivalTime)}</p>
            </div>
            <div className="grid gap-2">
              {confirmed.tickets.map((ticket) => (
                <div key={ticket.ticketNumber} className="rounded bg-slate-50 p-3 text-sm">
                  <p className="font-semibold text-ink">{ticket.ticketNumber}</p>
                  <p className="text-slate-500">PNR: {ticket.pnrCode || 'Đang cập nhật'}</p>
                </div>
              ))}
            </div>
            <Link href={`/track?code=${confirmed.bookingCode}`} className="grid h-11 place-items-center rounded border border-slate-300 font-semibold text-slate-700">
              Xem chi tiết vé
            </Link>
          </div>
        ) : (
          <p className="mt-4 text-sm leading-6 text-slate-500">
            Sau khi xác nhận thanh toán, mã vé, PNR và trạng thái đơn sẽ xuất hiện ở đây.
          </p>
        )}
      </aside>
    </main>
  );
}

function BankTransferPanel({ bankTransfer }: { bankTransfer: NonNullable<PaymentResult['bankTransfer']> }) {
  return (
    <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_180px]">
      <div className="grid gap-2 text-sm text-slate-700">
        <Info label="Ngân hàng" value={bankTransfer.bankName} />
        <Info label="Số tài khoản" value={bankTransfer.accountNumber} />
        <Info label="Chủ tài khoản" value={bankTransfer.accountName} />
        {bankTransfer.branch && <Info label="Chi nhánh" value={bankTransfer.branch} />}
        <Info label="Số tiền" value={currency.format(bankTransfer.amountVND)} />
        <Info label="Nội dung" value={bankTransfer.content} />
        {bankTransfer.note && <p className="mt-2 rounded bg-amber-50 p-3 text-amber-900">{bankTransfer.note}</p>}
      </div>
      <div className="rounded border border-slate-200 bg-white p-3">
        <p className="mb-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">QR chuyển khoản</p>
        <div className="grid aspect-square place-items-center overflow-hidden rounded bg-slate-50">
          {bankTransfer.qrImageDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={bankTransfer.qrImageDataUrl} alt="QR chuyển khoản" className="h-full w-full object-contain p-2" />
          ) : (
            <QrCode className="text-slate-300" size={68} />
          )}
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-200 py-2 last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-semibold text-ink">{value}</span>
    </div>
  );
}
