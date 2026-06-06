'use client';

import { useState, useEffect, InputHTMLAttributes } from 'react';
import { UserPlus, Users, Loader2, ShieldCheck, Mail, Phone, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { apiGet, apiPut } from '@/lib/api';

type Staff = {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
};

export function StaffManagement() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: ''
  });

  useEffect(() => {
    loadStaff();
  }, []);

  async function loadStaff() {
    try {
      setLoading(true);
      const data = await apiGet<Staff[]>('/admin/staff');
      setStaff(data);
    } catch (error) {
      toast.error('Không thể tải danh sách nhân viên');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      setCreating(true);
      await apiPut('/admin/staff', form);
      toast.success('Đã tạo tài khoản nhân viên mới');
      setShowForm(false);
      setForm({ email: '', password: '', fullName: '', phone: '' });
      loadStaff();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Lỗi khi tạo nhân viên');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="rounded border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 p-5">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-ink">
            <Users size={22} className="text-brand-600" />
            Quản lý nhân viên đại lý
          </h2>
          <p className="mt-1 text-sm text-slate-500">Cấp tài khoản cho nhân viên bán vé</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          <UserPlus size={18} />
          {showForm ? 'Đóng' : 'Thêm nhân viên'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="border-b border-slate-200 bg-slate-50 p-5">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Field label="Họ tên" value={form.fullName} onChange={(v) => setForm({ ...form, fullName: v })} required />
            <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
            <Field label="Mật khẩu" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} required minLength={8} />
            <Field label="Số điện thoại" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              disabled={creating}
              className="flex h-10 items-center gap-2 rounded bg-brand-600 px-6 font-semibold text-white disabled:opacity-50"
            >
              {creating ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
              Xác nhận tạo
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-5 py-3 font-semibold">Nhân viên</th>
              <th className="px-5 py-3 font-semibold">Liên hệ</th>
              <th className="px-5 py-3 font-semibold">Ngày tạo</th>
              <th className="px-5 py-3 font-semibold">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={4} className="p-10 text-center">
                  <Loader2 className="mx-auto animate-spin text-slate-400" size={24} />
                </td>
              </tr>
            ) : staff.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-10 text-center text-slate-500">
                  Chưa có nhân viên nào được tạo.
                </td>
              </tr>
            ) : (
              staff.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <p className="font-bold text-ink">{s.fullName}</p>
                    <p className="text-xs text-slate-500 uppercase">Staff</p>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail size={14} /> {s.email}
                    </div>
                    {s.phone && (
                      <div className="mt-1 flex items-center gap-2 text-slate-600">
                        <Phone size={14} /> {s.phone}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Calendar size={14} /> {new Date(s.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700">Đang hoạt động</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface FieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  onChange: (v: string) => void;
}

function Field({ label, value, onChange, ...props }: FieldProps) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-bold text-slate-600 uppercase">{label}</span>
      <input
        {...props}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 rounded border border-slate-300 bg-white px-3 text-ink outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
      />
    </label>
  );
}
