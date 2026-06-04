'use client';

import { useState } from 'react';
import { 
  LayoutDashboard, 
  Plane, 
  Settings, 
  Users, 
  History, 
  Wallet, 
  Utensils, 
  Luggage, 
  BarChart3, 
  Bell, 
  Search, 
  LogOut,
  ChevronRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Sub-components for different tabs
import { AdminOverview } from '@/components/admin/admin-overview';
import { FlightManagement } from '@/components/admin/flight-management';
import { ServiceManagement } from '@/components/admin/service-management';
import { BookingHistory } from '@/components/admin/booking-history';

const MENU_ITEMS = [
  { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard },
  { id: 'flights', label: 'Quản lý chuyến bay', icon: Plane },
  { id: 'services', label: 'Dịch vụ & Hành lý', icon: Utensils },
  { id: 'bookings', label: 'Lịch sử đặt vé', icon: History },
  { id: 'finance', label: 'Doanh thu & Tài chính', icon: BarChart3 },
  { id: 'settings', label: 'Cấu hình đại lý', icon: Settings },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
                 className="font-black text-xl text-ink tracking-tighter truncate"
               >
                 VIETFLY ADMIN
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
               <AnimatePresence>
                 {sidebarOpen && (
                   <motion.span 
                     initial={{ opacity: 0 }} 
                     animate={{ opacity: 1 }} 
                     className="font-bold text-sm"
                   >
                     {item.label}
                   </motion.span>
                 )}
               </AnimatePresence>
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
              <h2 className="font-black text-xl text-ink">
                {MENU_ITEMS.find(i => i.id === activeTab)?.label}
              </h2>
           </div>

           <div className="flex items-center gap-6">
              <div className="relative hidden md:block">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                 <input 
                   placeholder="Tìm mã đơn, tên khách..." 
                   className="h-11 w-72 rounded-2xl bg-slate-50 border border-slate-100 pl-12 pr-4 text-xs font-bold outline-none focus:bg-white focus:border-brand-300 transition-all"
                 />
              </div>
              <div className="h-10 w-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 relative">
                 <Bell size={20} />
                 <span className="absolute top-0 right-0 h-2.5 w-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
              </div>
              <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
                 <div className="text-right hidden sm:block">
                    <p className="text-xs font-black text-ink">Phuc Nguyen</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Quản lý cấp cao</p>
                 </div>
                 <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 shadow-md"></div>
              </div>
           </div>
        </header>

        {/* Content View */}
        <div className="p-10">
           <AnimatePresence mode="wait">
              {activeTab === 'overview' && <AdminOverview key="overview" />}
              {activeTab === 'flights' && <FlightManagement key="flights" />}
              {activeTab === 'services' && <ServiceManagement key="services" />}
              {activeTab === 'bookings' && <BookingHistory key="bookings" />}
           </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
