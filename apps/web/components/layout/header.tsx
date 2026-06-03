'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { LogIn, Plane, Search, ShieldCheck, Ticket, UserRound } from 'lucide-react';
import { getCurrentUser, type AuthUser } from '@/lib/auth-client';

export function Header() {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
    function syncSession() {
      setUser(getCurrentUser());
    }
    window.addEventListener('storage', syncSession);
    window.addEventListener('vietfly-session', syncSession);
    return () => {
      window.removeEventListener('storage', syncSession);
      window.removeEventListener('vietfly-session', syncSession);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex min-w-0 items-center gap-2 text-base font-bold text-brand-700 sm:text-lg">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded bg-brand-600 text-white">
            <Plane size={19} />
          </span>
          <span className="truncate">VietFly Agency</span>
        </Link>

        <nav className="hidden items-center gap-5 text-sm font-medium text-slate-600 md:flex">
          <Link href="/search" className="flex items-center gap-1 hover:text-brand-700">
            <Search size={16} /> Tìm vé
          </Link>
          <Link href="/track" className="flex items-center gap-1 hover:text-brand-700">
            <Ticket size={16} /> Tra cứu vé
          </Link>
          {user && (user.role === 'ADMIN' || user.role === 'MANAGER' || user.role === 'STAFF') && (
            <Link href="/admin" className="flex items-center gap-1 hover:text-brand-700">
              <ShieldCheck size={16} /> Đại lý
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <Link href="/account" className="flex h-10 items-center gap-2 rounded border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:border-brand-200 hover:bg-brand-50">
              <UserRound size={16} />
              <span className="hidden max-w-[160px] truncate sm:inline">{user.fullName}</span>
            </Link>
          ) : (
            <Link href="/login" className="flex h-10 items-center gap-2 rounded bg-brand-600 px-3 text-sm font-semibold text-white hover:bg-brand-700">
              <LogIn size={16} />
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
