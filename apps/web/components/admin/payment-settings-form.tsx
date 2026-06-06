'use client';

import Image from 'next/image';
import { ChangeEvent, FormEvent, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { ImageUp, Save, Trash2, X, Check } from 'lucide-react';
import { apiPut } from '@/lib/api';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '@/lib/crop-image';

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
  
  // Cropper state
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  async function handleCropSave() {
    if (!tempImage || !croppedAreaPixels) return;
    try {
      const croppedImage = await getCroppedImg(tempImage, croppedAreaPixels);
      setSetting((current) => ({ ...current, qrImageDataUrl: croppedImage }));
      setTempImage(null);
    } catch (e) {
      toast.error('Lỗi khi cắt ảnh.');
    }
  }

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
    
    const reader = new FileReader();
    reader.onload = () => {
      setTempImage(String(reader.result));
    };
    reader.readAsDataURL(file);
    // Reset input to allow re-uploading same file
    event.target.value = '';
  }

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-brand-600">Cấu hình thanh toán</p>
            <h2 className="mt-2 text-2xl font-black text-ink italic">TÀI KHOẢN NHẬN TIỀN</h2>
            <p className="mt-1 text-sm text-slate-500 font-medium">Thông tin này sẽ hiển thị cho khách khi quét mã QR thanh toán.</p>
          </div>
          <button disabled={saving} className="flex h-12 items-center gap-3 rounded-2xl bg-brand-600 px-8 font-black text-white shadow-xl shadow-brand-100 transition-all hover:bg-brand-700 active:scale-95 disabled:opacity-50">
            <Save size={18} /> {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
          </button>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_280px]">
          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Ngân hàng" value={setting.bankName} onChange={(value) => setSetting({ ...setting, bankName: value })} />
            <Field label="Số tài khoản" value={setting.accountNumber} onChange={(value) => setSetting({ ...setting, accountNumber: value })} />
            <Field label="Chủ tài khoản" value={setting.accountName} onChange={(value) => setSetting({ ...setting, accountName: value })} />
            <Field label="Chi nhánh" value={setting.branch ?? ''} onChange={(value) => setSetting({ ...setting, branch: value })} />
            <label className="grid gap-2 text-sm font-bold text-slate-700 sm:col-span-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ghi chú cho khách</span>
              <textarea value={setting.note ?? ''} onChange={(event) => setSetting({ ...setting, note: event.target.value })} rows={3} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-ink outline-none transition focus:border-brand-500 focus:bg-white" />
            </label>
          </div>

          <div className="rounded-[32px] border border-slate-100 bg-slate-50 p-6">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">QR chuyển khoản</p>
            <div className="relative aspect-square overflow-hidden rounded-2xl border-4 border-white bg-white shadow-inner">
              {setting.qrImageDataUrl ? (
                <Image src={setting.qrImageDataUrl} alt="QR chuyển khoản" width={200} height={200} className="h-full w-full object-contain p-2" unoptimized />
              ) : (
                <div className="grid h-full place-items-center text-slate-300">
                   <div className="text-center">
                      <ImageUp size={48} strokeWidth={1} className="mx-auto mb-2 opacity-20" />
                      <p className="text-[10px] font-black uppercase tracking-tight">Chưa có ảnh</p>
                   </div>
                </div>
              )}
            </div>
            <label className="mt-4 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white text-xs font-black text-slate-600 shadow-sm transition-all hover:border-brand-300 hover:text-brand-600">
              <ImageUp size={16} /> Tải & Cắt QR
              <input type="file" accept="image/*" onChange={uploadQr} className="hidden" />
            </label>
            {setting.qrImageDataUrl && (
              <button type="button" onClick={() => setSetting({ ...setting, qrImageDataUrl: null })} className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-xl text-[10px] font-black text-rose-500 hover:bg-rose-50 transition-colors">
                <Trash2 size={14} /> Xóa ảnh hiện tại
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Cropping Modal */}
      {tempImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
           <div className="w-full max-w-xl overflow-hidden rounded-[40px] bg-white shadow-2xl">
              <div className="p-8 flex items-center justify-between border-b border-slate-100">
                 <h3 className="text-xl font-black text-ink">Cắt ảnh QR</h3>
                 <button onClick={() => setTempImage(null)} className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all">
                    <X size={20} />
                 </button>
              </div>
              
              <div className="relative h-96 w-full bg-slate-100">
                 <Cropper
                   image={tempImage}
                   crop={crop}
                   zoom={zoom}
                   aspect={1}
                   onCropChange={setCrop}
                   onZoomChange={setZoom}
                   onCropComplete={onCropComplete}
                 />
              </div>

              <div className="p-8 space-y-6">
                 <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black uppercase text-slate-400">Thu phóng</span>
                    <input
                      type="range"
                      value={zoom}
                      min={1}
                      max={3}
                      step={0.1}
                      aria-labelledby="Zoom"
                      onChange={(e) => setZoom(Number(e.target.value))}
                      className="flex-1 accent-brand-600"
                    />
                 </div>
                 <div className="flex gap-4">
                    <button onClick={() => setTempImage(null)} className="h-14 flex-1 rounded-2xl border border-slate-200 font-black text-slate-500 hover:bg-slate-50 transition-all">HỦY BỎ</button>
                    <button onClick={handleCropSave} className="h-14 flex-[2] rounded-2xl bg-brand-600 font-black text-white shadow-xl shadow-brand-100 flex items-center justify-center gap-2 hover:bg-brand-700 transition-all">
                       <Check size={20} strokeWidth={3} /> XÁC NHẬN CẮT ẢNH
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2">
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} required className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-ink outline-none transition focus:border-brand-500 focus:bg-white" />
    </label>
  );
}
