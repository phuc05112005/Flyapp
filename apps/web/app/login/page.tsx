'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { FormEvent, useState } from 'react';
import { toast } from 'sonner';
import { ArrowRight, BadgeCheck, LockKeyhole, Mail, Phone, UserRound } from 'lucide-react';
import { apiPost, type AuthSession } from '@/lib/api';
import { saveSession } from '@/lib/auth-client';

type Mode = 'login' | 'register';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);

    try {
      const session = await apiPost<AuthSession>(mode === 'login' ? '/auth/login' : '/auth/register', {
        email: form.get('email'),
        password: form.get('password'),
        fullName: form.get('fullName'),
        phone: form.get('phone') || undefined
      });

      saveSession(session);
      window.dispatchEvent(new Event('vietfly-session'));
      toast.success(mode === 'login' ? 'Đăng nhập thành công.' : 'Tạo tài khoản thành công.');
      router.push(session.user.role === 'CUSTOMER' ? '/account' : '/admin');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể xử lý yêu cầu.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="bg-slate-50">
      <section className="mx-auto grid min-h-[calc(100vh-160px)] max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[1fr_460px] lg:items-center">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded border border-brand-100 bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-700">
            <BadgeCheck size={16} />
            Tài khoản khách hàng và đại lý
          </div>
          <h1 className="mt-5 text-4xl font-bold leading-tight text-ink md:text-5xl">
            Quản lý đặt vé, thanh toán và hồ sơ bay trong một nơi.
          </h1>
          <p className="mt-5 text-base leading-7 text-slate-600">
            Khách hàng có thể lưu thông tin, theo dõi vé, thanh toán mock. Đại lý dùng tài khoản nhân sự để xem dashboard, đơn mới và trạng thái xuất vé.
          </p>
          <div className="mt-7 grid gap-3 text-sm text-slate-700 sm:grid-cols-3">
            {['Giữ chỗ tức thì', 'Theo dõi mã vé', 'Quản trị đại lý'].map((item) => (
              <div key={item} className="rounded border border-slate-200 bg-white p-4 font-semibold shadow-sm">
                {item}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={submit} className="rounded border border-slate-200 bg-white p-6 shadow-soft">
          <div className="grid grid-cols-2 rounded bg-slate-100 p-1 text-sm font-semibold">
            <button type="button" onClick={() => setMode('login')} className={`h-10 rounded ${mode === 'login' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500'}`}>
              Đăng nhập
            </button>
            <button type="button" onClick={() => setMode('register')} className={`h-10 rounded ${mode === 'register' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500'}`}>
              Tạo tài khoản
            </button>
          </div>

          <div className="mt-6 grid gap-4">
            {mode === 'register' && (
              <>
                <Field icon={<UserRound size={18} />} label="Họ và tên" name="fullName" autoComplete="name" required />
                <Field icon={<Phone size={18} />} label="Số điện thoại" name="phone" autoComplete="tel" />
              </>
            )}
            <Field icon={<Mail size={18} />} label="Email" name="email" type="email" autoComplete="email" required />
            <Field icon={<LockKeyhole size={18} />} label="Mật khẩu" name="password" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required minLength={8} />
          </div>

          <button disabled={loading} className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded bg-coral px-4 font-semibold text-white hover:bg-[#df4f43] disabled:opacity-60">
            {loading ? 'Đang xử lý...' : mode === 'login' ? 'Vào tài khoản' : 'Tạo tài khoản'}
            <ArrowRight size={18} />
          </button>

          <div className="mt-5 rounded bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-semibold text-ink">Tài khoản đại lý mẫu</p>
            <p>admin@vietfly.vn / Admin@123456</p>
            <p>staff@vietfly.vn / Staff@123456</p>
          </div>
          <p className="mt-5 text-center text-sm text-slate-500">
            Muốn đặt vé ngay? <Link href="/search" className="font-semibold text-brand-700">Tìm chuyến bay</Link>
          </p>
        </form>
      </section>
    </main>
  );
}

function Field({ icon, label, ...props }: InputHTMLAttributes<HTMLInputElement> & { icon: ReactNode; label: string }) {
  return (
    <label className="grid gap-1 text-sm font-semibold text-slate-700">
      {label}
      <span className="relative">
        <span className="pointer-events-none absolute left-3 top-3 text-slate-400">{icon}</span>
        <input {...props} className="h-12 w-full rounded border border-slate-300 bg-white pl-10 pr-3 text-ink outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100" />
      </span>
    </label>
  );
}
