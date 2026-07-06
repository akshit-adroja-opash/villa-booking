'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/Navbar';
import { 
  LayoutDashboard, 
  Users, 
  Home, 
  CalendarDays, 
  CreditCard, 
  Settings,
  ShieldAlert
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const adminUser = session?.user as ({ role?: string; name?: string | null } | undefined);

  React.useEffect(() => {
    if (status === 'loading') return;
    if (!session || adminUser?.role !== 'admin') {
      alert('Access Denied: Admins Only');
      router.push('/');
    }
  }, [adminUser?.role, session, status, router]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fdfbf7]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#00a877] border-t-transparent"></div>
      </div>
    );
  }

  if (!session || adminUser?.role !== 'admin') {
    return null;
  }

  interface MenuItem {
    href: string;
    icon: React.ComponentType<any>;
    label: string;
    badge?: string;
  }

  const menuItems: MenuItem[] = [
    { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/users', icon: Users, label: 'Users' },
    { href: '/admin/properties', icon: Home, label: 'Properties' },
    { href: '/admin/reservations', icon: CalendarDays, label: 'Bookings' },
    { href: '/admin/financials', icon: CreditCard, label: 'Revenue' },
    { href: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-[#fdfbf7] flex flex-col font-sans antialiased text-[#1a1b22]">
      {/* Global Navbar */}
      <Navbar />

      {/* Main Admin Columns (Sidebar + Content) */}
      <div className="flex flex-1 pt-20">
        
        {/* Left Sidebar */}
        <aside className="fixed top-20 left-0 z-40 hidden h-[calc(100vh-80px)] w-64 flex-col border-r border-[#bfc9c3]/20 bg-white p-4 shadow-sm md:flex">
          
          {/* Sidebar Title */}
          <div className="px-3 py-4 mb-2">
            <h2 className="text-lg font-bold text-[#1a1b22]">Admin Panel</h2>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto">
            <ul className="space-y-1.5">
              {menuItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && item.href !== '#' && pathname.startsWith(item.href));
                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className={`flex items-center justify-between rounded-xl px-4 py-3 transition-all duration-200 ${
                        isActive
                          ? 'bg-[#e6f4ea] text-[#00a877] font-semibold'
                          : 'text-[#404944] hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className={`h-5 w-5 ${isActive ? 'text-[#00a877]' : 'text-gray-400'}`} />
                        <span className="text-sm font-semibold">{item.label}</span>
                      </div>
                      
                      {item.badge && (
                        <span className="text-[10px] font-bold bg-red-50 text-red-500 rounded-full px-2 py-0.5 border border-red-100">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* Right Content Panel */}
        <div className="flex-1 flex flex-col min-w-0 md:pl-64">
          <div className="flex-grow">
            {children}
          </div>
        </div>

      </div>
    </div>
  );
}
