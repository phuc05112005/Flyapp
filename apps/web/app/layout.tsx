import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import './globals.css';

export const metadata: Metadata = {
  title: 'VietFly Agency - Đặt vé máy bay',
  description: 'Nền tảng đặt vé máy bay trực tuyến cho đại lý Việt Nam'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <Header />
        {children}
        <Footer />
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
