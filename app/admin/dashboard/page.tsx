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

const LogoMoneyIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="6" fill="#D4AF37" fillOpacity="0.1" />
    <path d="M12 6V18M9 8H13.5C14.88 8 16 9.12 16 10.5C16 11.88 14.88 13 13.5 13H10.5C9.12 13 8 14.12 8 15.5C8 16.88 9.12 18 10.5 18H15" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const LogoBookingsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="6" fill="#1B2A22" fillOpacity="0.05" />
    <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5M9 11H15M9 15H13" stroke="#1B2A22" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.6" />
  </svg>
);

const LogoUsersIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="6" fill="#1B2A22" fillOpacity="0.05" />
    <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21M13 7C13 9.20914 11.2091 11 9 11C6.79086 11 5 9.20914 5 7C5 4.79086 6.79086 3 9 3C11.2091 3 13 4.79086 13 7ZM23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="#1B2A22" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.6" />
  </svg>
);

const LogoOccupancyIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="6" fill="#1B2A22" fillOpacity="0.05" />
    <path d="M4 15V9C4 7.89543 4.89543 7 6 7H18C19.1046 7 20 7.89543 20 9V15M4 15H20M4 15V19M20 15V19M9 7V5C9 4.44772 9.44772 4 10 4H14C14.5523 4 15 4.44772 15 5V7M7 11H17" stroke="#1B2A22" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.6" />
  </svg>
);

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [farms, setFarms] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [revenueTimeRange, setRevenueTimeRange] = useState('all');

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

  // Database-driven metrics calculation
  const dbRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  const displayRevenue = `₹${(dbRevenue / 1000).toFixed(0)}K`;

  const displayBookingsCount = String(bookings.length);

  const displayActiveUsers = String(users.length);

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

  // Generate dynamic chart data based on time range
  const chartData = useMemo(() => {
    const now = new Date();
    let dataPoints: { label: string, value: number, start: Date, end: Date }[] = [];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    if (revenueTimeRange === '1m') {
      for (let i = 3; i >= 0; i--) {
        const end = new Date(now);
        end.setDate(now.getDate() - i * 7);
        const start = new Date(now);
        start.setDate(now.getDate() - (i + 1) * 7);
        dataPoints.push({ label: `W${4 - i}`, value: 0, start, end });
      }
    } else if (revenueTimeRange === '5y') {
      for (let i = 4; i >= 0; i--) {
        const year = now.getFullYear() - i;
        const start = new Date(year, 0, 1);
        const end = new Date(year, 11, 31, 23, 59, 59);
        dataPoints.push({ label: String(year), value: 0, start, end });
      }
    } else {
      const numMonths = revenueTimeRange === '3m' ? 3 : revenueTimeRange === '6m' ? 6 : 12;
      for (let i = numMonths - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setMonth(now.getMonth() - i);
        const start = new Date(d.getFullYear(), d.getMonth(), 1);
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
        dataPoints.push({ label: monthNames[d.getMonth()], value: 0, start, end });
      }
    }

    bookings.forEach(b => {
      const bDate = new Date(b.startDate);
      if (!isNaN(bDate.getTime())) {
        for (let point of dataPoints) {
          if (bDate >= point.start && bDate <= point.end) {
            point.value += b.totalPrice || 0;
            break;
          }
        }
      }
    });

    return dataPoints;
  }, [bookings, revenueTimeRange]);

  const maxRevenue = useMemo(() => {
    const values = chartData.map(d => d.value);
    return Math.max(...values, 1);
  }, [chartData]);

  // Generate SVG graph paths dynamically (wavy trend line)
  const chartPathData = useMemo(() => {
    const points = chartData.map((d, idx) => {
      const step = chartData.length > 1 ? 500 / (chartData.length - 1) : 500;
      const x = idx * step;
      // y-bounds are 170 (min value/bottom) and 30 (max value/top)
      const y = 170 - (d.value / maxRevenue) * 140;
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

    const fillD = `${lineD} L ${points[points.length - 1].x} 200 L 0 200 Z`;
    return { lineD, fillD };
  }, [chartData, maxRevenue]);

  // Dynamic Popular Destinations calculation
  const popularDestinations = useMemo(() => {
    const counts: Record<string, number> = {};
    let total = 0;
    
    bookings.forEach(b => {
      const location = b.farmId?.location || 'Other';
      const city = location.split(',')?.[0]?.trim() || 'Other';
      counts[city] = (counts[city] || 0) + 1;
      total += 1;
    });

    if (total === 0) {
      return []; // Return empty if no bookings
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
  }, [bookings]);

  // Compute donut segments for SVG circle elements
  const donutSegments = useMemo(() => {
    const colors = ['#1B2A22', '#D4AF37', '#2c4236', '#c29f31', '#111827'];
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
    <main className="p-6 md:p-10 bg-[#FAF9F6]">
      <div className="mx-auto max-w-[1280px] space-y-8">
        
        {/* Title Block */}
        <div>
          <h1 className="font-serif text-3xl font-normal tracking-tight text-[#1B2A22]">
            Dashboard
          </h1>
          <p className="flex items-center gap-2 mt-2">
            <TrendingUp className="h-3.5 w-3.5 text-[#00a877]" />
            <span className="text-[10px] uppercase tracking-widest text-[#00a877] font-bold">
              Estate Portfolio Overview
            </span>
          </p>
        </div>

        {/* 4 Stat Metrics Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* Revenue */}
          <div className="bg-white border border-[#1B2A22]/10 p-6 relative flex flex-col justify-between h-[130px]">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-serif text-3xl text-[#1B2A22]">{displayRevenue}</h3>
                <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#1B2A22]/60 mt-1">Total Revenue</p>
              </div>
              <LogoMoneyIcon />
            </div>
            <div className="flex justify-end">
              <span className="text-[10px] font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 uppercase tracking-wider">
                +24%
              </span>
            </div>
          </div>

          {/* Bookings */}
          <div className="bg-white border border-[#1B2A22]/10 p-6 relative flex flex-col justify-between h-[130px]">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-serif text-3xl text-[#1B2A22]">{displayBookingsCount}</h3>
                <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#1B2A22]/60 mt-1">Reservations</p>
              </div>
              <LogoBookingsIcon />
            </div>
            <div className="flex justify-end">
              <span className="text-[10px] font-bold text-[#1B2A22] bg-[#1B2A22]/10 px-2 py-0.5 uppercase tracking-wider">
                +18%
              </span>
            </div>
          </div>

          {/* Active Users */}
          <div className="bg-white border border-[#1B2A22]/10 p-6 relative flex flex-col justify-between h-[130px]">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-serif text-3xl text-[#1B2A22]">{displayActiveUsers}</h3>
                <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#1B2A22]/60 mt-1">Patrons</p>
              </div>
              <LogoUsersIcon />
            </div>
            <div className="flex justify-end">
              <span className="text-[10px] font-bold text-[#1B2A22] bg-[#1B2A22]/10 px-2 py-0.5 uppercase tracking-wider">
                +32%
              </span>
            </div>
          </div>

          {/* Occupancy */}
          <div className="bg-white border border-[#1B2A22]/10 p-6 relative flex flex-col justify-between h-[130px]">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-serif text-3xl text-[#1B2A22]">{displayOccupancy}</h3>
                <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#1B2A22]/60 mt-1">Avg Occupancy</p>
              </div>
              <LogoOccupancyIcon />
            </div>
            <div className="flex justify-end">
              <span className="text-[10px] font-bold text-[#1B2A22] bg-[#1B2A22]/10 px-2 py-0.5 uppercase tracking-wider">
                +5%
              </span>
            </div>
          </div>

        </div>

        {/* Interactive Charts Section (Revenue Trends & Popular Destinations) */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* Revenue Trends Chart (3/5) */}
          <div className="lg:col-span-3 bg-white border border-[#1B2A22]/10 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-serif text-lg font-normal text-[#1B2A22]">Revenue Trends</h3>
              <select 
                value={revenueTimeRange} 
                onChange={(e) => setRevenueTimeRange(e.target.value)}
                className="text-[10px] uppercase tracking-widest font-bold text-[#1B2A22] bg-[#FAF9F6] border border-[#1B2A22]/10 px-3 py-1.5 outline-none cursor-pointer"
              >
                <option value="1m">1 Month</option>
                <option value="3m">3 Months</option>
                <option value="6m">6 Months</option>
                <option value="1y">1 Year</option>
                <option value="5y">5 Years</option>
                <option value="all">All Time</option>
              </select>
            </div>
            <div className="relative w-full h-[220px] pt-4">
              
              {/* SVG Line Graph */}
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 500 200">
                <defs>
                  <linearGradient id="chartGrad" x1="0%" x2="0%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="#00a877" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#00a877" stopOpacity="0" />
                  </linearGradient>
                </defs>
                
                {/* Horizontal Guide Lines */}
                <line x1="0" y1="50" x2="500" y2="50" stroke="#FAF9F6" strokeWidth="1" />
                <line x1="0" y1="100" x2="500" y2="100" stroke="#FAF9F6" strokeWidth="1" />
                <line x1="0" y1="150" x2="500" y2="150" stroke="#FAF9F6" strokeWidth="1" />
                
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

              {/* Dynamic Labels */}
              <div className="flex justify-between items-center text-[9px] font-bold text-[#1B2A22]/40 uppercase tracking-widest mt-4 px-1">
                {chartData.map((d, idx) => (
                  <span key={idx}>{d.label}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Popular Destinations Donut (2/5) */}
          <div className="lg:col-span-2 bg-white border border-[#1B2A22]/10 p-6 flex flex-col justify-between">
            <h3 className="font-serif text-lg font-normal text-[#1B2A22] mb-4">Locations</h3>
            
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
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[9px] uppercase tracking-widest font-bold text-[#1B2A22]/60 mt-4">
              {donutSegments.map((segment, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="h-2 w-2" style={{ backgroundColor: segment.color }}></span>
                  <span>{segment.name} ({segment.percentage}%)</span>
                </div>
              ))}
            </div>

          </div>

        </div>

        {/* Recent Bookings Table View Layout */}
        <div className="bg-white border border-[#1B2A22]/10 overflow-hidden">
          <div className="p-6 border-b border-[#1B2A22]/10">
            <h3 className="font-serif text-lg font-normal text-[#1B2A22]">Recent Reservations</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-[#1B2A22]/10 bg-[#FAF9F6] text-[9px] font-bold text-[#1B2A22]/50 uppercase tracking-[0.2em]">
                  <th className="px-6 py-4">Ref</th>
                  <th className="px-6 py-4">Estate</th>
                  <th className="px-6 py-4">Patron</th>
                  <th className="px-6 py-4">Dates</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1B2A22]/5 text-[13px] font-semibold text-[#1B2A22]">
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-[#1B2A22]/50 font-serif italic">No recent reservations.</td>
                  </tr>
                ) : bookings.slice(0, 5).map((booking, index) => {
                  const farmTitle = booking.farmId?.title || 'Estate stay';
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
                  const idDisplay = booking._id?.slice(-6).toUpperCase() || String(index + 1).padStart(2, '0');
                  
                  return (
                    <tr key={booking._id} className="hover:bg-[#FAF9F6] transition-colors">
                      <td className="px-6 py-4 text-[#1B2A22]/50">{idDisplay}</td>
                      <td className="px-6 py-4 font-serif">{farmTitle}</td>
                      <td className="px-6 py-4 text-[#1B2A22]/70">{guestName}</td>
                      <td className="px-6 py-4 text-[#1B2A22]/50">{dateRangeDisplay}</td>
                      <td className="px-6 py-4 font-serif">₹{amount.toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest border ${
                          status.toLowerCase() === 'paid' || status.toLowerCase() === 'confirmed' || status.toLowerCase() === 'completed'
                            ? 'bg-[#e6f4ea] text-[#00a877] border-[#00a877]/20'
                            : status.toLowerCase() === 'pending'
                              ? 'bg-[#D4AF37]/5 text-[#D4AF37] border border-[#D4AF37]/30'
                              : 'bg-[#1B2A22]/5 text-[#1B2A22]/50 border border-[#1B2A22]/20'
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