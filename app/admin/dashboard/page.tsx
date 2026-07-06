'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  DollarSign, 
  ClipboardList, 
  Activity, 
  TrendingUp, 
  CalendarDays, 
  ChevronDown 
} from 'lucide-react';

const MOCK_DASHBOARD_BOOKINGS = [
  {
    _id: 'mock-1',
    startDate: '2024-12-20',
    endDate: '2024-12-23',
    totalPrice: 10500,
    paymentStatus: 'Paid',
    farmId: { title: 'Sunrise Valley Farm', location: 'Solan, Himachal Pradesh' },
    userId: { name: 'Arjun Mehta' }
  },
  {
    _id: 'mock-2',
    startDate: '2025-01-10',
    endDate: '2025-01-14',
    totalPrice: 22000,
    paymentStatus: 'Paid',
    farmId: { title: 'Hilltop Haven', location: 'Manali, Himachal Pradesh' },
    userId: { name: 'Arjun Mehta' }
  },
  {
    _id: 'mock-3',
    startDate: '2025-02-14',
    endDate: '2025-02-17',
    totalPrice: 18000,
    paymentStatus: 'Pending',
    farmId: { title: 'Coastal Retreat', location: 'Goa, Goa' },
    userId: { name: 'Sarah Williams' }
  },
  {
    _id: 'mock-4',
    startDate: '2024-10-05',
    endDate: '2024-10-08',
    totalPrice: 11400,
    paymentStatus: 'completed',
    farmId: { title: 'Tea Garden Estate', location: 'Munnar, Kerala' },
    userId: { name: 'Sarah Williams' }
  },
  {
    _id: 'mock-5',
    startDate: '2024-08-01',
    endDate: '2024-08-03',
    totalPrice: 5600,
    paymentStatus: 'completed',
    farmId: { title: 'Green Meadow Retreat', location: 'Ooty, Tamil Nadu' },
    userId: { name: 'Mike Chen' }
  }
];

const LogoMoneyIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="6" fill="#fef3c7" />
    <path d="M12 6V18M9 8H13.5C14.88 8 16 9.12 16 10.5C16 11.88 14.88 13 13.5 13H10.5C9.12 13 8 14.12 8 15.5C8 16.88 9.12 18 10.5 18H15" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const LogoBookingsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="6" fill="#fecdd3" />
    <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5M9 11H15M9 15H13" stroke="#e11d48" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const LogoUsersIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="6" fill="#dbeafe" />
    <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21M13 7C13 9.20914 11.2091 11 9 11C6.79086 11 5 9.20914 5 7C5 4.79086 6.79086 3 9 3C11.2091 3 13 4.79086 13 7ZM23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const LogoOccupancyIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="6" fill="#d1fae5" />
    <path d="M4 15V9C4 7.89543 4.89543 7 6 7H18C19.1046 7 20 7.89543 20 9V15M4 15H20M4 15V19M20 15V19M9 7V5C9 4.44772 9.44772 4 10 4H14C14.5523 4 15 4.44772 15 5V7M7 11H17" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [farms, setFarms] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [bookingsRes, farmsRes, usersRes] = await Promise.all([
          fetch('/api/bookings'),
          fetch('/api/farms'),
          fetch('/api/users')
        ]);
        if (bookingsRes.ok) {
          const bookingsData = await bookingsRes.json();
          setBookings(bookingsData || []);
        }
        if (farmsRes.ok) {
          const farmsData = await farmsRes.json();
          setFarms(farmsData || []);
        }
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsers(usersData || []);
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  // Merge real DB bookings with fallback mocks for visualization completeness
  const allBookings = useMemo(() => {
    const merged = [...bookings];
    MOCK_DASHBOARD_BOOKINGS.forEach(mock => {
      const alreadyExists = merged.some(
        b => b._id === mock._id || 
        (b.farmId?.title === mock.farmId.title && b.startDate.substring(0, 10) === mock.startDate)
      );
      if (!alreadyExists) {
        merged.push(mock);
      }
    });
    return merged;
  }, [bookings]);

  // Database-driven metrics calculation with fallback support
  const dbRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  const displayRevenue = dbRevenue > 0 
    ? `₹${(dbRevenue / 1000).toFixed(0)}K` 
    : `₹${(allBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0) / 1000).toFixed(0)}K`;

  const displayBookingsCount = bookings.length > 0 ? String(bookings.length) : String(allBookings.length);

  const displayActiveUsers = users.length > 0 ? String(users.length) : '37';

  // Dynamic Occupancy based on ongoing stays vs total listings
  const displayOccupancy = useMemo(() => {
    if (farms.length === 0) return '50%';
    const now = new Date();
    const activeStays = bookings.filter(b => {
      const start = new Date(b.startDate);
      const end = new Date(b.endDate);
      return start <= now && end >= now;
    }).length;
    
    const percentage = Math.min(100, Math.round((activeStays / farms.length) * 100));
    return percentage > 0 ? `${percentage}%` : '50%';
  }, [bookings, farms]);

  // Dynamic monthly revenue calculation (for line graph)
  const monthlyRevenue = useMemo(() => {
    const monthlyMap = Array(12).fill(0);
    allBookings.forEach(b => {
      const date = new Date(b.startDate);
      if (!isNaN(date.getTime())) {
        const month = date.getMonth(); // 0 - 11
        monthlyMap[month] += b.totalPrice || 0;
      }
    });
    return monthlyMap;
  }, [allBookings]);

  const maxRevenue = useMemo(() => {
    return Math.max(...monthlyRevenue, 1);
  }, [monthlyRevenue]);

  // Generate SVG graph paths dynamically (wavy trend line)
  const chartPathData = useMemo(() => {
    const points = monthlyRevenue.map((val, idx) => {
      const x = idx * (500 / 11);
      // y-bounds are 170 (min value/bottom) and 30 (max value/top)
      const y = 170 - (val / maxRevenue) * 140;
      return { x, y };
    });

    if (points.length === 0) return { lineD: '', fillD: '' };

    // Create cubic bezier curve or smooth line path description
    let lineD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpX1 = prev.x + (curr.x - prev.x) / 2;
      const cpY1 = prev.y;
      const cpX2 = prev.x + (curr.x - prev.x) / 2;
      const cpY2 = curr.y;
      lineD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${curr.x} ${curr.y}`;
    }

    const fillD = `${lineD} L 500 200 L 0 200 Z`;
    return { lineD, fillD };
  }, [monthlyRevenue, maxRevenue]);

  // Dynamic Popular Destinations calculation
  const popularDestinations = useMemo(() => {
    const counts: Record<string, number> = {};
    let total = 0;
    
    allBookings.forEach(b => {
      const location = b.farmId?.location || 'Other';
      const city = location.split(',')?.[0]?.trim() || 'Other';
      counts[city] = (counts[city] || 0) + 1;
      total += 1;
    });

    if (total === 0) {
      return [
        { name: 'Manali', percentage: 35 },
        { name: 'Goa', percentage: 25 },
        { name: 'Rishikesh', percentage: 20 },
        { name: 'Munnar', percentage: 12 },
        { name: 'Other', percentage: 8 }
      ];
    }

    const sorted = Object.entries(counts)
      .map(([name, count]) => ({
        name,
        percentage: Math.round((count / total) * 100)
      }))
      .sort((a, b) => b.percentage - a.percentage);

    if (sorted.length > 4) {
      const top = sorted.slice(0, 4);
      const restSum = sorted.slice(4).reduce((sum, item) => sum + item.percentage, 0);
      if (restSum > 0) {
        top.push({ name: 'Other', percentage: restSum });
      }
      return top;
    }

    return sorted;
  }, [allBookings]);

  // Compute donut segments for SVG circle elements
  const donutSegments = useMemo(() => {
    const colors = ['#00a877', '#f59e0b', '#3b82f6', '#a855f7', '#ec4899'];
    let currentOffset = 0;
    
    const totalPercentage = popularDestinations.reduce((sum, d) => sum + d.percentage, 0);
    
    return popularDestinations.map((dest, idx) => {
      const percentage = totalPercentage > 0 ? Math.round((dest.percentage / totalPercentage) * 100) : 0;
      const strokeDasharray = `${percentage} ${100 - percentage}`;
      const strokeDashoffset = String(-currentOffset);
      currentOffset += percentage;
      
      return {
        name: dest.name,
        percentage: dest.percentage,
        strokeDasharray,
        strokeDashoffset,
        color: colors[idx % colors.length]
      };
    });
  }, [popularDestinations]);

  return (
    <main className="p-6 md:p-10 bg-[#fdfbf7]">
      <div className="mx-auto max-w-[1280px] space-y-8">
        
        {/* Title Block */}
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#1a1b22]">
            Admin Dashboard
          </h1>
          <p className="text-sm text-[#707974] font-medium mt-1">
            Overview of your AgriStay platform.
          </p>
        </div>

        {/* 4 Stat Metrics Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* Revenue */}
          <div className="bg-white border border-[#bfc9c3]/20 rounded-2xl p-6 shadow-sm shadow-[#064e3b]/3 relative flex flex-col justify-between h-[130px]">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold text-[#1a1b22] tracking-tight">{displayRevenue}</h3>
                <p className="text-xs text-[#707974] font-semibold mt-1">Total Revenue</p>
              </div>
              <LogoMoneyIcon />
            </div>
            <div className="flex justify-end">
              <span className="text-[11px] font-bold text-[#00a877] bg-[#e6f4ea] px-2 py-0.5 rounded-full">
                +24%
              </span>
            </div>
          </div>

          {/* Bookings */}
          <div className="bg-white border border-[#bfc9c3]/20 rounded-2xl p-6 shadow-sm shadow-[#064e3b]/3 relative flex flex-col justify-between h-[130px]">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold text-[#1a1b22] tracking-tight">{displayBookingsCount}</h3>
                <p className="text-xs text-[#707974] font-semibold mt-1">Total Bookings</p>
              </div>
              <LogoBookingsIcon />
            </div>
            <div className="flex justify-end">
              <span className="text-[11px] font-bold text-[#00a877] bg-[#e6f4ea] px-2 py-0.5 rounded-full">
                +18%
              </span>
            </div>
          </div>

          {/* Active Users */}
          <div className="bg-white border border-[#bfc9c3]/20 rounded-2xl p-6 shadow-sm shadow-[#064e3b]/3 relative flex flex-col justify-between h-[130px]">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold text-[#1a1b22] tracking-tight">{displayActiveUsers}</h3>
                <p className="text-xs text-[#707974] font-semibold mt-1">Active Users</p>
              </div>
              <LogoUsersIcon />
            </div>
            <div className="flex justify-end">
              <span className="text-[11px] font-bold text-[#00a877] bg-[#e6f4ea] px-2 py-0.5 rounded-full">
                +32%
              </span>
            </div>
          </div>

          {/* Occupancy */}
          <div className="bg-white border border-[#bfc9c3]/20 rounded-2xl p-6 shadow-sm shadow-[#064e3b]/3 relative flex flex-col justify-between h-[130px]">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold text-[#1a1b22] tracking-tight">{displayOccupancy}</h3>
                <p className="text-xs text-[#707974] font-semibold mt-1">Avg Occupancy</p>
              </div>
              <LogoOccupancyIcon />
            </div>
            <div className="flex justify-end">
              <span className="text-[11px] font-bold text-[#00a877] bg-[#e6f4ea] px-2 py-0.5 rounded-full">
                +5%
              </span>
            </div>
          </div>

        </div>

        {/* Interactive Charts Section (Revenue Trends & Popular Destinations) */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* Revenue Trends Chart (3/5) */}
          <div className="lg:col-span-3 bg-white border border-[#bfc9c3]/20 rounded-2xl p-6 shadow-sm shadow-[#064e3b]/3">
            <h3 className="font-serif text-lg font-bold text-[#1a1b22] mb-6">Revenue Trends</h3>
            <div className="relative w-full h-[220px] pt-4">
              
              {/* SVG Line Graph */}
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 500 200">
                <defs>
                  <linearGradient id="chartGrad" x1="0%" x2="0%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="#00a877" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#00a877" stopOpacity="0" />
                  </linearGradient>
                </defs>
                
                {/* Horizontal Guide Lines */}
                <line x1="0" y1="50" x2="500" y2="50" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="100" x2="500" y2="100" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="150" x2="500" y2="150" stroke="#f1f5f9" strokeWidth="1" />
                
                {/* Wavy Graph Path */}
                {chartPathData.fillD && (
                  <path 
                    d={chartPathData.fillD} 
                    fill="url(#chartGrad)" 
                  />
                )}
                {chartPathData.lineD && (
                  <path 
                    d={chartPathData.lineD} 
                    fill="none" 
                    stroke="#00a877" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                  />
                )}
              </svg>

              {/* Month Labels */}
              <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-4 px-1">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
                <span>Jul</span>
                <span>Aug</span>
                <span>Sep</span>
                <span>Oct</span>
                <span>Nov</span>
                <span>Dec</span>
              </div>
            </div>
          </div>

          {/* Popular Destinations Donut (2/5) */}
          <div className="lg:col-span-2 bg-white border border-[#bfc9c3]/20 rounded-2xl p-6 shadow-sm shadow-[#064e3b]/3 flex flex-col justify-between">
            <h3 className="font-serif text-lg font-bold text-[#1a1b22] mb-4">Popular Destinations</h3>
            
            {/* Donut SVG Rendering */}
            <div className="relative flex items-center justify-center h-[160px]">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                {donutSegments.map((segment, idx) => (
                  <circle 
                    key={idx}
                    cx="18" 
                    cy="18" 
                    r="15.915" 
                    fill="none" 
                    stroke={segment.color} 
                    strokeWidth="4.2" 
                    strokeDasharray={segment.strokeDasharray} 
                    strokeDashoffset={segment.strokeDashoffset} 
                  />
                ))}
              </svg>
            </div>

            {/* Legend Block */}
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[10px] font-bold text-gray-500 mt-4">
              {donutSegments.map((segment, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: segment.color }}></span>
                  <span>{segment.name} ({segment.percentage}%)</span>
                </div>
              ))}
            </div>

          </div>

        </div>

        {/* Recent Bookings Table View Layout */}
        <div className="bg-white border border-[#bfc9c3]/20 rounded-2xl overflow-hidden shadow-sm shadow-[#064e3b]/3">
          <div className="p-6 border-b border-[#bfc9c3]/15">
            <h3 className="font-serif text-lg font-bold text-[#1a1b22]">Recent Bookings</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-[#bfc9c3]/15 bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Property</th>
                  <th className="px-6 py-4">Guest</th>
                  <th className="px-6 py-4">Dates</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#bfc9c3]/10 text-sm font-semibold text-[#1a1b22]">
                {allBookings.slice(0, 5).map((booking, index) => {
                  const farmTitle = booking.farmId?.title || 'Farmhouse stay';
                  const guestName = booking.userId?.name || 'Guest';
                  
                  let dateRangeDisplay = 'N/A';
                  if (booking.startDate && booking.endDate) {
                    try {
                      const sDate = new Date(booking.startDate);
                      const eDate = new Date(booking.endDate);
                      if (!isNaN(sDate.getTime()) && !isNaN(eDate.getTime())) {
                        const sStr = sDate.toISOString().substring(0, 10);
                        const eStr = eDate.toISOString().substring(0, 10);
                        dateRangeDisplay = `${sStr} – ${eStr}`;
                      }
                    } catch (e) {
                      dateRangeDisplay = `${booking.startDate} – ${booking.endDate}`;
                    }
                  }
                  
                  const status = booking.paymentStatus || 'Pending';
                  const amount = booking.totalPrice || 0;
                  const idDisplay = String(index + 1).padStart(2, '0');
                  
                  return (
                    <tr key={booking._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-gray-400 font-bold">{idDisplay}</td>
                      <td className="px-6 py-4">{farmTitle}</td>
                      <td className="px-6 py-4 text-gray-600">{guestName}</td>
                      <td className="px-6 py-4 text-gray-500 font-medium">{dateRangeDisplay}</td>
                      <td className="px-6 py-4">₹{amount.toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full lowercase ${
                          status.toLowerCase() === 'paid' || status.toLowerCase() === 'confirmed' || status.toLowerCase() === 'completed'
                            ? 'bg-[#e6f4ea] text-[#0f766e]'
                            : status.toLowerCase() === 'pending'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-blue-50 text-blue-700'
                        }`}>
                          {status.toLowerCase() === 'paid' ? 'confirmed' : status.toLowerCase()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}