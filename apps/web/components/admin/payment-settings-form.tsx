'use client';

import Image from 'next/image';
import { ChangeEvent, FormEvent, useState } from 'react';
import { toast } from 'sonner';
import { ImageUp, Save, Trash2 } from 'lucide-react';
import { apiPut } from '@/lib/api';

export type AgencyPaymentSetting = {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  branch?: string | null;
  qrImageDataUrl?: string | null;
  note?: string | null;
};

export function PaymentSettingsForm({ initialSetting }: { initialSetting: AgencyPaymentSetting }) {
  const [setting, setSetting] = useState(initialSetting);
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      const updated = await apiPut<AgencyPaymentSetting>('/admin/payment-settings', {
        bankName: setting.bankName,
        accountNumber: setting.accountNumber,
        accountName: setting.accountName,
        branch: setting.branch || undefined,
        qrImageDataUrl: setting.qrImageDataUrl || undefined,
        note: setting.note || undefined
      });
      setSetting(updated);
      toast.success('Đã cập nhật thông tin chuyển khoản.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể cập nhật thông tin chuyển khoản.');
    } finally {
      setSaving(false);
    }
  }

  async function uploadQr(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh QR.');
      return;
    }
    if (file.size > 900_000) {
      toast.error('Ảnh QR nên nhỏ hơn 900KB để lưu ổn định trong môi trường dev.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSetting((current) => ({ ...current, qrImageDataUrl: String(reader.result) }));
    };
    reader.readAsDataURL(file);
  }

  return (
    <form onSubmit={submit} className="rounded border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">Cấu hình chuyển khoản</p>
          <h2 className="mt-1 text-xl font-bold text-ink">Tài khoản nhận tiền của đại lý</h2>
          <p className="mt-1 text-sm text-slate-500">Thông tin này sẽ hiển thị cho khách khi chọn phương thức chuyển khoản.</p>
        </div>
        <button disabled={saving} className="btn-primary h-10 px-4 text-sm">
          <Save size={16} /> {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
        </button>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_220px]">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Ngân hàng" value={setting.bankName} onChange={(value) => setSetting({ ...setting, bankName: value })} />
          <Field label="Số tài khoản" value={setting.accountNumber} onChange={(value) => setSetting({ ...setting, accountNumber: value })} />
          <Field label="Chủ tài khoản" value={setting.accountName} onChange={(value) => setSetting({ ...setting, accountName: value })} />
          <Field label="Chi nhánh" value={setting.branch ?? ''} onChange={(value) => setSetting({ ...setting, branch: value })} />
          <label className="grid gap-1 text-sm font-semibold text-slate-700 sm:col-span-2">
            Ghi chú cho khách
            <textarea value={setting.note ?? ''} onChange={(event) => setSetting({ ...setting, note: event.target.value })} rows={3} className="rounded border border-slate-300 bg-white px-3 py-2 text-ink outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100" />
          </label>
        </div>

        <div className="rounded border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-ink">QR chuyển khoản</p>
          <div className="mt-3 grid aspect-square place-items-center overflow-hidden rounded border border-dashed border-slate-300 bg-white">
            {setting.qrImageDataUrl ? (
              <Image src={setting.qrImageDataUrl} alt="QR chuyển khoản" width={180} height={180} className="h-full w-full object-contain p-2" unoptimized />
            ) : (
              <p className="px-4 text-center text-sm text-slate-500">Chưa tải QR</p>
            )}
          </div>
          <label className="btn-secondary mt-3 h-10 w-full cursor-pointer text-sm">
            <ImageUp size={16} /> Tải QR
            <input type="file" accept="image/*" onChange={uploadQr} className="hidden" />
          </label>
          {setting.qrImageDataUrl && (
            <button type="button" onClick={() => setSetting({ ...setting, qrImageDataUrl: null })} className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded border border-rose-200 bg-rose-50 text-sm font-semibold text-rose-700">
              <Trash2 size={16} /> Xóa QR
            </button>
          )}
        </div>
      </div>
    </form>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-1 text-sm font-semibold text-slate-700">
      {label}
      <input value={value} onChange={(event) => onChange(event.target.value)} required className="h-11 rounded border border-slate-300 bg-white px-3 text-ink outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100" />
    </label>
  );
}
