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
    ShieldAlert,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { data: session, status } = useSession() || {};
    const router = useRouter();
    const adminUser = session?.user as ({ role?: string; name?: string | null } | undefined);
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

    React.useEffect(() => {
        if (status === 'loading') return;
        if (!session || adminUser?.role !== 'admin') {
            toast.error('Admin access required');
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
        { href: '/admin/users', icon: Users, label: 'User Management' },
        { href: '/admin/properties', icon: Home, label: 'Farmhouses' },
        { href: '/admin/bookings', icon: CalendarDays, label: 'Bookings' },
        { href: '/admin/financials', icon: CreditCard, label: 'Revenue' },
        { href: '/admin/settings', icon: Settings, label: 'My Profile' },
    ];

    return (
        <div className="min-h-screen bg-[#FAF9F6] flex flex-col font-sans antialiased text-[#1B2A22]">
            {/* Global Navbar */}
            <Navbar />

            {/* Main Admin Columns (Sidebar + Content) */}
            <div className="flex flex-1 pt-16">

                {/* Left Sidebar */}
                <aside className={`fixed top-16 left-0 z-40 hidden h-[calc(100vh-64px)] flex-col border-r border-[#1B2A22]/10 bg-white md:flex transition-all duration-300 ${isSidebarOpen ? 'w-64 p-4' : 'w-20 p-2 items-center'}`}>

                    {/* Sidebar Title & Toggle */}
                    <div className={`w-full flex items-center mb-6 py-2 ${isSidebarOpen ? 'justify-between px-3' : 'justify-center px-0'}`}>
                        {isSidebarOpen && <h2 className="text-sm font-medium text-[#1B2A22] whitespace-nowrap overflow-hidden">Admin Portal</h2>}
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 transition-colors shrink-0">
                            {isSidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                        </button>
                    </div>

                    {/* Menu Items */}
                    <nav className="flex-1 overflow-y-auto w-full overflow-x-hidden">
                        <ul className="space-y-1.5 w-full">
                            {menuItems.map((item) => {
                                const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && item.href !== '#' && pathname.startsWith(item.href));
                                return (
                                    <li key={item.label} className="w-full">
                                        <Link
                                            href={item.href}
                                            title={!isSidebarOpen ? item.label : undefined}
                                            className={`flex items-center rounded-r-xl py-3 transition-all duration-200 border-l-4 w-[95%] ${isSidebarOpen ? 'justify-between px-4' : 'justify-center px-0'
                                                } ${isActive
                                                    ? 'bg-white text-[#1B2A22] font-bold border-[#00a877] shadow-[0_4px_12px_rgba(0,168,119,0.12)]'
                                                    : 'text-[#1B2A22]/60 hover:bg-[#FAF9F6] border-transparent font-semibold'
                                                }`}
                                        >
                                            <div className={`flex items-center ${isSidebarOpen ? 'gap-4' : 'gap-0'}`}>
                                                <item.icon className={`h-[18px] w-[18px] shrink-0 ${isActive ? 'text-[#00a877]' : 'text-[#1B2A22]/40'}`} />
                                                {isSidebarOpen && <span className="text-sm font-semibold whitespace-nowrap">{item.label}</span>}
                                            </div>

                                            {isSidebarOpen && item.badge && (
                                                <span className="text-xs font-medium font-bold bg-[#1B2A22]/10 text-[#1B2A22] rounded-full px-2 py-0.5 border border-[#1B2A22]/20">
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
                <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isSidebarOpen ? 'md:pl-64' : 'md:pl-20'}`}>

                    <div className="flex-grow">
                        {children}
                    </div>
                </div>

            </div>
        </div>
    );
}
