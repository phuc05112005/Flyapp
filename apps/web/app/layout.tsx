import type { Metadata } from 'next';
import React from 'react';
import { Toaster } from 'sonner';
import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import './globals.css';

export const metadata: Metadata = {
  title: 'VietFly Agency - Hệ thống đặt vé máy bay chuyên nghiệp',
  description: 'Nền tảng quản lý và đặt vé máy bay hàng đầu cho đại lý tại Việt Nam',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 128 128%22><circle cx=%2264%22 cy=%2264%22 r=%2264%22 fill=%22%232563eb%22/><path d=%22M30 45 L98 64 L30 83 L45 64 Z%22 fill=%22white%22/></svg>',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
