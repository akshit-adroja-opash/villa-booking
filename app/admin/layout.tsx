'use client';
import toast from 'react-hot-toast';

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
 toast.error('Access Denied: Admins Only');
 router.push('/');
 }
 }, [adminUser?.role, session, status, router]);

 if (status === 'loading') {
 return (
 <div className="flex min-h-screen items-center justify-center bg-[#FAF9F6]">
 <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#1B2A22] border-t-transparent"></div>
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
 { href: '/admin/users', icon: Users, label: 'Guests' },
 { href: '/admin/properties', icon: Home, label: 'Farmhouses' },
 { href: '/admin/reservations', icon: CalendarDays, label: 'Bookings' },
 { href: '/admin/financials', icon: CreditCard, label: 'Revenue' },
 { href: '/settings', icon: Settings, label: 'Settings' },
 ];

 return (
 <div className="min-h-screen bg-[#FAF9F6] flex flex-col font-sans antialiased text-[#1B2A22]">
 {/* Global Navbar */}
 <Navbar />

 {/* Main Admin Columns (Sidebar + Content) */}
 <div className="flex flex-1 pt-16">
 
 {/* Left Sidebar */}
 <aside className="fixed top-16 left-0 z-40 hidden h-[calc(100vh-64px)] w-64 flex-col border-r border-[#1B2A22]/10 bg-white p-4 md:flex">
 
 {/* Sidebar Title */}
 <div className="px-3 py-6 mb-2">
 <h2 className="text-sm font-medium text-[#1B2A22]">Admin Portal</h2>
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
 className={`flex items-center justify-between rounded-none px-4 py-3 transition-all duration-200 border-l-2 ${
 isActive
 ? 'bg-[#FAF9F6] text-[#1B2A22] font-bold border-[#1B2A22]'
 : 'text-[#1B2A22]/60 hover:bg-[#FAF9F6] border-transparent font-semibold'
 }`}
 >
 <div className="flex items-center gap-4">
 <item.icon className={`h-4 w-4 ${isActive ? 'text-[#1B2A22]' : 'text-[#1B2A22]/40'}`} />
 <span className="text-sm font-medium">{item.label}</span>
 </div>
 
 {item.badge && (
 <span className="text-sm font-medium font-bold bg-[#1B2A22]/10 text-[#1B2A22] rounded-full px-2 py-0.5 border border-[#1B2A22]/20">
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
