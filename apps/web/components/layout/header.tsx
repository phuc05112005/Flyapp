import Link from 'next/link';
import { Plane, Search, ShieldCheck } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-brand-700">
          <span className="grid h-9 w-9 place-items-center rounded bg-brand-600 text-white">
            <Plane size={19} />
          </span>
          VietFly Agency
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          <Link href="/search" className="flex items-center gap-1 hover:text-brand-700"><Search size={16} /> Tìm vé</Link>
          <Link href="/track">Tra cứu vé</Link>
          <Link href="/admin" className="flex items-center gap-1 hover:text-brand-700"><ShieldCheck size={16} /> Đại lý</Link>
        </nav>
      </div>
    </header>
  );
}
