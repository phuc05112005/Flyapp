'use client';

import { useEffect, useState, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Plane, 
  Settings, 
  History, 
  Utensils, 
  Bell, 
  Search, 
  LogOut,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { apiGet } from '@/lib/api';

// Optimized dynamic imports
const AdminOverview = dynamic(() => import('@/components/admin/admin-overview').then(m => m.AdminOverview), { 
  loading: () => <TabLoader />
});
const FlightManagement = dynamic(() => import('@/components/admin/flight-management').then(m => m.FlightManagement), { loading: () => <TabLoader /> });
const ServiceManagement = dynamic(() => import('@/components/admin/service-management').then(m => m.ServiceManagement), { loading: () => <TabLoader /> });
const BookingHistory = dynamic(() => import('@/components/admin/booking-history').then(m => m.BookingHistory), { loading: () => <TabLoader /> });
const PaymentSettingsForm = dynamic(() => import('@/components/admin/payment-settings-form').then(m => m.PaymentSettingsForm), { loading: () => <TabLoader /> });
const StaffManagement = dynamic(() => import('@/components/admin/staff-management').then(m => m.StaffManagement), { loading: () => <TabLoader /> });

export type AgencyPaymentSetting = {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  branch?: string | null;
  qrImageDataUrl?: string | null;
  note?: string | null;
};

const MENU_ITEMS = [
  { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard },
  { id: 'flights', label: 'Quản lý chuyến bay', icon: Plane },
  { id: 'services', label: 'Dịch vụ & Hành lý', icon: Utensils },
  { id: 'bookings', label: 'Lịch sử đặt vé', icon: History },
  { id: 'settings', label: 'Cấu hình đại lý', icon: Settings },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [paymentSetting, setPaymentSetting] = useState<AgencyPaymentSetting | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(false);

  useEffect(() => {
    if (activeTab === 'settings') {
      setLoadingSettings(true);
      apiGet<AgencyPaymentSetting>('/admin/payment-settings')
        .then((res) => {
          setPaymentSetting(res);
          setLoadingSettings(false);
        })
        .catch(() => setLoadingSettings(false));
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: sidebarOpen ? 300 : 88 }}
        className="bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen z-40"
      >
        <div className="p-8 flex items-center gap-4">
           <div className="h-10 w-10 shrink-0 rounded-xl bg-brand-600 flex items-center justify-center font-black text-white shadow-lg shadow-brand-200">VF</div>
           <AnimatePresence>
             {sidebarOpen && (
               <motion.span 
                 initial={{ opacity: 0, x: -10 }} 
                 animate={{ opacity: 1, x: 0 }} 
                 exit={{ opacity: 0, x: -10 }}
                 className="font-black text-xl text-ink tracking-tighter truncate uppercase italic"
               >
                 VietFly
               </motion.span>
             )}
           </AnimatePresence>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
           {MENU_ITEMS.map((item) => (
             <button
               key={item.id}
               onClick={() => setActiveTab(item.id)}
               className={`
                 w-full flex items-center gap-4 px-4 py-4 rounded-[18px] transition-all group
                 ${activeTab === item.id ? 'bg-brand-600 text-white shadow-xl shadow-brand-100' : 'text-slate-500 hover:bg-slate-50'}
               `}
             >
               <item.icon size={22} className={activeTab === item.id ? 'text-white' : 'group-hover:text-brand-600'} />
               {sidebarOpen && (
                 <span className="font-bold text-sm whitespace-nowrap">
                   {item.label}
                 </span>
               )}
             </button>
           ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
           <button className="w-full flex items-center gap-4 px-4 py-4 rounded-[18px] text-rose-500 hover:bg-rose-50 font-bold text-sm transition-all">
              <LogOut size={22} />
              {sidebarOpen && <span>Đăng xuất</span>}
           </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-10 sticky top-0 z-30">
           <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 hover:bg-white transition-all"
              >
                 <ChevronRight className={`transition-transform duration-500 ${sidebarOpen ? 'rotate-180' : 'rotate-0'}`} />
              </button>
              <h2 className="font-black text-xl text-ink uppercase tracking-tight">
                {MENU_ITEMS.find(i => i.id === activeTab)?.label}
              </h2>
           </div>

           <div className="flex items-center gap-6">
              <div className="relative hidden lg:block">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                 <input 
                   placeholder="Tìm mã đặt vé, tên khách..." 
                   className="h-11 w-72 rounded-2xl bg-slate-50 border border-slate-100 pl-12 pr-4 text-xs font-bold outline-none focus:bg-white focus:border-brand-300 transition-all"
                 />
              </div>
              <div className="h-10 w-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 relative cursor-pointer hover:bg-white">
                 <Bell size={20} />
                 <span className="absolute top-0 right-0 h-2.5 w-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
              </div>
              <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
                 <div className="text-right hidden sm:block">
                    <p className="text-xs font-black text-ink">Phuc Nguyen</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Quản lý cấp cao</p>
                 </div>
                 <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 shadow-lg shadow-brand-100 ring-2 ring-white"></div>
              </div>
           </div>
        </header>

        {/* Content View */}
        <div className="p-10 max-w-7xl mx-auto w-full">
           <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'overview' && <AdminOverview />}
                {activeTab === 'flights' && <FlightManagement />}
                {activeTab === 'services' && <ServiceManagement />}
                {activeTab === 'bookings' && <BookingHistory />}
                {activeTab === 'settings' && (
                  <div className="space-y-10">
                    {loadingSettings ? (
                      <TabLoader />
                    ) : paymentSetting ? (
                      <PaymentSettingsForm initialSetting={paymentSetting} />
                    ) : null}
                    <StaffManagement />
                  </div>
                )}
              </motion.div>
           </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function TabLoader() {
  return (
    <div className="flex h-64 items-center justify-center rounded-[40px] border border-dashed border-slate-200 bg-white">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-brand-600" size={32} />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Đang tải dữ liệu...</p>
      </div>
    </div>
  );
}
