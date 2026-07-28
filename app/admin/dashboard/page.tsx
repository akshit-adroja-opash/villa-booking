'use client';

import {  useState, useEffect, useMemo  } from 'react';
import { Users, ClipboardList, Banknote, Home, ChevronDown } from 'lucide-react';

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [farms, setFarms] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [revenueTimeRange, setRevenueTimeRange] = useState('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all');
  const [bookingSortFilter, setBookingSortFilter] = useState('newest');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isBookingSortDropdownOpen, setIsBookingSortDropdownOpen] = useState(false);
  const [bookingSortColumn, setBookingSortColumn] = useState<'property' | 'guest' | 'dates' | 'amount' | 'status'>('dates');
  const [bookingSortOrder, setBookingSortOrder] = useState<'asc' | 'desc'>('desc');

  const timeRangeOptions = [
    { value: '1m', label: '1 Month' },
    { value: '3m', label: '3 Months' },
    { value: '6m', label: '6 Months' },
    { value: '1y', label: '1 Year' },
    { value: '5y', label: '5 Years' },
    { value: 'all', label: 'All Time' },
  ];

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

  const dbRevenue = bookings.filter(b => b.adminConfirmed).reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  const displayRevenue = `₹${dbRevenue.toLocaleString('en-IN')}`;

  const displayBookingsCount = String(bookings.filter(b => b.adminConfirmed).length);
  const displayActiveUsers = String(users.length);

  const displayOccupancy = useMemo(() => {
    if (farms.length === 0) return '0%';
    const confirmedCount = bookings.filter(b => b.adminConfirmed).length;
    const percentage = Math.min(100, Math.round((confirmedCount / farms.length) * 100));
    return `${percentage}%`;
  }, [bookings, farms]);

  // Percentage Growth Calculations (comparing last 30 days vs 30-60 days ago)
  const growthStats = useMemo(() => {
    const getPercentageChange = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? '+100%' : '0%';
      const change = ((curr - prev) / prev) * 100;
      const formatted = change.toFixed(0);
      return change >= 0 ? `+${formatted}%` : `${formatted}%`;
    };

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // 1. Revenue
    const revCurr = bookings
      .filter(b => b.adminConfirmed && new Date(b.createdAt || b.startDate) >= thirtyDaysAgo)
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    const revPrev = bookings
      .filter(b => b.adminConfirmed && new Date(b.createdAt || b.startDate) >= sixtyDaysAgo && new Date(b.createdAt || b.startDate) < thirtyDaysAgo)
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    const revenueGrowth = getPercentageChange(revCurr, revPrev);

    // 2. Bookings
    const bookCurr = bookings
      .filter(b => b.adminConfirmed && new Date(b.createdAt || b.startDate) >= thirtyDaysAgo)
      .length;
    const bookPrev = bookings
      .filter(b => b.adminConfirmed && new Date(b.createdAt || b.startDate) >= sixtyDaysAgo && new Date(b.createdAt || b.startDate) < thirtyDaysAgo)
      .length;
    const bookingsGrowth = getPercentageChange(bookCurr, bookPrev);

    // 3. Active Users
    const usersCurr = users
      .filter(u => new Date(u.createdAt) >= thirtyDaysAgo)
      .length;
    const usersPrev = users
      .filter(u => new Date(u.createdAt) >= sixtyDaysAgo && new Date(u.createdAt) < thirtyDaysAgo)
      .length;
    const usersGrowth = getPercentageChange(usersCurr, usersPrev);

    // 4. Occupancy Growth (using confirmed bookings count)
    const occupancyGrowth = getPercentageChange(bookCurr, bookPrev);

    return {
      revenue: revenueGrowth,
      bookings: bookingsGrowth,
      users: usersGrowth,
      occupancy: occupancyGrowth
    };
  }, [bookings, users]);

  const renderGrowthBadge = (changeStr: string) => {
    const isNegative = changeStr.startsWith('-');
    const colorClass = isNegative
      ? 'text-red-600 bg-red-50'
      : 'text-[#00a877] bg-[#e6f4ea]';
    return (
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colorClass}`}>
        {changeStr}
      </span>
    );
  };

  // Generate dynamic chart data based on time range showing stock market style price ups and downs
  const chartData = useMemo(() => {
    const now = new Date();
    let startDateLimit = new Date(0); // Default to all time

    if (revenueTimeRange === '1m') {
      startDateLimit = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (revenueTimeRange === '3m') {
      startDateLimit = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    } else if (revenueTimeRange === '6m') {
      startDateLimit = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
    } else if (revenueTimeRange === '1y') {
      startDateLimit = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    } else if (revenueTimeRange === '5y') {
      startDateLimit = new Date(now.getTime() - 5 * 365 * 24 * 60 * 60 * 1000);
    }

    const filteredBookings = bookings
      .filter(b => b.adminConfirmed)
      .filter(b => {
        const bDate = new Date(b.startDate);
        return !isNaN(bDate.getTime()) && bDate >= startDateLimit;
      })
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    if (filteredBookings.length === 0) {
      return [
        { label: 'Start', value: 0, bookings: [] },
        { label: 'End', value: 0, bookings: [] }
      ];
    }

    const groups: { [key: string]: { label: string, value: number, bookings: any[] } } = {};

    filteredBookings.forEach((b) => {
      const bDate = new Date(b.startDate);
      const label = bDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

      if (!groups[label]) {
        groups[label] = {
          label,
          value: 0,
          bookings: []
        };
      }

      groups[label].value += b.totalPrice || 0;
      groups[label].bookings.push({
        farmName: b.farmId?.title || 'Deleted Property',
        guestName: b.userId?.name || 'Guest',
        price: b.totalPrice || 0
      });
    });

    const result = Object.values(groups);

    if (result.length === 1) {
      const label = result[0].label;
      const parts = label.split(' ');
      const day = parseInt(parts[0], 10);
      const prevDateLabel = `${day - 1} ${parts[1] || ''}`.trim();
      return [
        { label: prevDateLabel, value: 0, bookings: [] },
        result[0]
      ];
    }

    return result;
  }, [bookings, revenueTimeRange]);

  const maxRevenue = useMemo(() => {
    const values = chartData.map(d => d.value);
    return Math.max(...values, 1);
  }, [chartData]);

  const chartPathData = useMemo(() => {
    const points = chartData.map((d, idx) => {
      const step = chartData.length > 1 ? 500 / (chartData.length - 1) : 500;
      const x = idx * step;
      const y = 170 - (d.value / maxRevenue) * 140;
      return { x, y, ...d };
    });

    if (points.length === 0) return { lineD: '', fillD: '', points: [] };

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
    return { lineD, fillD, points };
  }, [chartData, maxRevenue]);

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
      // Mock data for display if empty just to look like screenshot
      return [
        { name: 'Solan', percentage: 33 },
        { name: 'Manali', percentage: 17 },
        { name: 'Goa', percentage: 17 },
        { name: 'Munnar', percentage: 17 },
        { name: 'Other', percentage: 17 }
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
      if (restSum > 0) top.push({ name: 'Other', percentage: restSum });
      return top;
    }
    return sorted;
  }, [bookings]);

  const [animationProgress, setAnimationProgress] = useState(0);

  useEffect(() => {
    let startTime: number;
    const duration = 1500; // 1.5 seconds for the donut chart to fill

    const animate = (time: number) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);

      // easeOutQuart for a smooth decelerating curve
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      setAnimationProgress(easeProgress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    const rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const handleBookingHeaderSort = (col: 'property' | 'guest' | 'dates' | 'amount' | 'status') => {
    if (bookingSortColumn === col) {
      setBookingSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setBookingSortColumn(col);
      setBookingSortOrder(col === 'amount' || col === 'dates' ? 'desc' : 'asc');
    }
    setBookingSortFilter('custom');
  };

  const renderBookingHeader = (col: 'property' | 'guest' | 'dates' | 'amount' | 'status', label: string) => {
    const active = bookingSortColumn === col;
    return (
      <button type="button" onClick={() => handleBookingHeaderSort(col)}
        className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider transition-colors hover:text-[#00a877] ${active ? 'text-[#1B2A22]' : 'text-gray-400'}`}>
        <span>{label}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-all ${active ? 'opacity-100' : 'opacity-35'} ${active && bookingSortOrder === 'asc' ? 'rotate-180' : ''}`} />
      </button>
    );
  };

  const donutSegments = useMemo(() => {
    const colors = ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'];
    let currentOffset = 0;
    const totalPercentage = popularDestinations.reduce((sum, d) => sum + d.percentage, 0);

    return popularDestinations.map((dest, idx) => {
      const fullPercentage = totalPercentage > 0 ? Math.round((dest.percentage / totalPercentage) * 100) : 0;
      const percentage = fullPercentage * animationProgress;

      const strokeDasharray = `${percentage} ${100 - percentage}`;
      const strokeDashoffset = String(-currentOffset);
      currentOffset += percentage;

      return {
        name: dest.name,
        percentage: fullPercentage,
        strokeDasharray,
        strokeDashoffset,
        color: colors[idx % colors.length]
      };
    });
  }, [popularDestinations, animationProgress]);

  return (
    <main className="p-4 sm:p-6 md:p-8 lg:p-10 bg-[#FAF9F6]">
      <div className="w-full mx-auto space-y-8">

        {/* Title Block */}
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#1a1f1c]">
            Admin Dashboard
          </h1>
          <p className="text-[13px] font-medium text-gray-400 mt-1">
            Overview of your Enjoy Farm platform.
          </p>
        </div>

        {/* 4 Stat Metrics Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">

          {/* Revenue */}
          <div className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] p-6 relative flex flex-col justify-between h-[130px]">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-sans tracking-tight font-bold text-[28px] text-[#1B2A22] leading-none mb-1">{displayRevenue}</h3>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Total Revenue</p>
              </div>
              <div className="p-2 bg-amber-50 rounded-lg">
                <Banknote className="h-5 w-5 text-amber-500" />
              </div>
            </div>
            <div className="flex justify-end">
              {renderGrowthBadge(growthStats.revenue)}
            </div>
          </div>

          {/* Bookings */}
          <div className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] p-6 relative flex flex-col justify-between h-[130px]">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-sans tracking-tight font-bold text-[28px] text-[#1B2A22] leading-none mb-1">{displayBookingsCount}</h3>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Total Bookings</p>
              </div>
              <div className="p-2 bg-pink-50 rounded-lg">
                <ClipboardList className="h-5 w-5 text-pink-500" />
              </div>
            </div>
            <div className="flex justify-end">
              {renderGrowthBadge(growthStats.bookings)}
            </div>
          </div>

          {/* Active Users */}
          <div className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] p-6 relative flex flex-col justify-between h-[130px]">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-sans tracking-tight font-bold text-[28px] text-[#1B2A22] leading-none mb-1">{displayActiveUsers}</h3>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Active Users</p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
            </div>
            <div className="flex justify-end">
              {renderGrowthBadge(growthStats.users)}
            </div>
          </div>

          {/* Occupancy */}
          <div className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] p-6 relative flex flex-col justify-between h-[130px]">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-sans tracking-tight font-bold text-[28px] text-[#1B2A22] leading-none mb-1">{displayOccupancy}</h3>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Avg Occupancy</p>
              </div>
              <div className="p-2 bg-emerald-50 rounded-lg">
                <Home className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
            <div className="flex justify-end">
              {renderGrowthBadge(growthStats.occupancy)}
            </div>
          </div>

        </div>

        {/* Interactive Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Revenue Trends Chart (3/5) */}
          <div className="lg:col-span-3 bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] p-6 md:p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-serif text-[22px] font-bold text-[#1B2A22]">Revenue Trends</h3>
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`flex items-center justify-between gap-2 text-[13px] font-bold text-[#1B2A22] bg-white border rounded-xl px-4 py-2 focus:outline-none transition-all shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] min-w-[130px] ${isDropdownOpen ? 'border-[#00a877]' : 'border-gray-200 hover:border-[#00a877]'
                    }`}
                >
                  <span>{timeRangeOptions.find(opt => opt.value === revenueTimeRange)?.label}</span>
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${isDropdownOpen ? 'bg-[#e6f4ea] text-[#00a877]' : 'bg-gray-50 text-gray-500'}`}>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {isDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsDropdownOpen(false)}
                    ></div>
                    <div className="absolute top-full right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] py-2 z-50 overflow-hidden min-w-[150px]">
                      {timeRangeOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => {
                            setRevenueTimeRange(opt.value);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-1.5 text-[13px] font-semibold transition-colors ${revenueTimeRange === opt.value
                            ? 'bg-[#e6f4ea] text-[#00a877]'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
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
                <line x1="0" y1="50" x2="500" y2="50" stroke="#f3f4f6" strokeWidth="1" />
                <line x1="0" y1="100" x2="500" y2="100" stroke="#f3f4f6" strokeWidth="1" />
                <line x1="0" y1="150" x2="500" y2="150" stroke="#f3f4f6" strokeWidth="1" />

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
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                )}

                {/* Interactive dots on hover */}
                {chartPathData.points && chartPathData.points.map((pt: any, idx: number) => {
                  if (pt.label === 'Start' || pt.label === 'End' || (pt.value === 0 && chartPathData.points.length <= 2)) return null;

                  const isHovered = hoveredIdx === idx;

                  return (
                    <g key={idx}>
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isHovered ? 6 : 3.5}
                        fill={isHovered ? '#00a877' : '#ffffff'}
                        stroke="#00a877"
                        strokeWidth={isHovered ? 2.5 : 2}
                        className="transition-all duration-150 cursor-pointer"
                        onMouseEnter={() => setHoveredIdx(idx)}
                        onMouseLeave={() => setHoveredIdx(null)}
                      />
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="12"
                        fill="transparent"
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredIdx(idx)}
                        onMouseLeave={() => setHoveredIdx(null)}
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Hover Tooltip */}
              {hoveredIdx !== null && chartPathData.points && chartPathData.points[hoveredIdx] && (() => {
                const pt = chartPathData.points[hoveredIdx];
                if (!pt || pt.value === 0) return null;
                const leftPercent = (pt.x / 500) * 100;
                const topPercent = (pt.y / 200) * 100;
                let translateX = '-translate-x-1/2';
                if (leftPercent < 15) {
                  translateX = '-translate-x-[10%]';
                } else if (leftPercent > 85) {
                  translateX = '-translate-x-[90%]';
                }
                return (
                  <div
                    className={`absolute bg-white/95 backdrop-blur-md text-[#1B2A22] p-3 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] text-[11px] font-sans pointer-events-none z-30 transition-all duration-150 ${translateX} -translate-y-[115%] border border-gray-100 min-w-[200px]`}
                    style={{ left: `${leftPercent}%`, top: `${topPercent}%` }}
                  >
                    <div className="flex justify-between items-center gap-3 mb-2 pb-1.5 border-b border-gray-100">
                      <span className="text-[9px] text-gray-400 font-bold tracking-wider uppercase">{pt.label}</span>
                      <span className="text-[10px] text-gray-400 font-bold">
                        {pt.bookings.length} {pt.bookings.length === 1 ? 'Booking' : 'Bookings'}
                      </span>
                    </div>

                    <div className="space-y-2 mb-2 max-h-[120px] overflow-y-auto pr-1">
                      {pt.bookings.map((b: any, index: number) => (
                        <div key={index} className="flex flex-col gap-0.5">
                          <div className="flex justify-between items-center gap-2">
                            <span className="font-bold text-[12px] text-[#00a877]">
                              ₹{b.price.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <div className="text-gray-500 text-[9px] font-medium truncate max-w-[180px]">
                            {b.farmName}
                          </div>
                        </div>
                      ))}
                    </div>

                    {pt.bookings.length > 1 && (
                      <div className="flex justify-between items-center border-t border-gray-100 pt-2 mt-1">
                        <span className="text-[9px] font-bold text-gray-400 uppercase">Total Revenue</span>
                        <span className="text-[13px] font-bold text-[#1B2A22]">
                          ₹{pt.value.toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Dynamic Labels */}
              <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 mt-4 px-1">
                {chartData.map((d, idx) => {
                  const total = chartData.length;
                  const showLabel =
                    idx === 0 ||
                    idx === total - 1 ||
                    (total > 2 && idx === Math.floor(total / 2)) ||
                    (total > 4 && idx === Math.floor(total / 4)) ||
                    (total > 4 && idx === Math.floor(3 * total / 4));
                  return (
                    <span key={idx} className={showLabel ? '' : 'invisible h-0 w-0 absolute'}>
                      {d.label}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Popular Destinations Donut (2/5) */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] p-6 md:p-8 flex flex-col">
            <h3 className="font-serif text-[22px] font-bold text-[#1B2A22] mb-8">Popular Destinations</h3>

            {/* Donut SVG Rendering */}
            <div className="relative flex-1 flex items-center justify-center min-h-[160px] py-4">
              <div className="relative w-44 h-44">
                <svg className="w-full h-full transform -rotate-90 drop-shadow-sm" viewBox="0 0 36 36">
                  {/* Background Track */}
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f8f9fa" strokeWidth="3.5" />

                  {donutSegments.map((segment, idx) => (
                    <circle
                      key={idx}
                      cx="18"
                      cy="18"
                      r="15.915"
                      fill="none"
                      stroke={segment.color}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeDasharray={segment.strokeDasharray}
                      strokeDashoffset={segment.strokeDashoffset}
                      className="transition-all duration-1000 ease-out cursor-pointer hover:stroke-[4]"
                    />
                  ))}
                </svg>
                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total</span>
                  <span className="text-3xl font-sans tracking-tight font-bold text-[#1B2A22] leading-none">{popularDestinations.length > 0 ? '100%' : '0%'}</span>
                </div>
              </div>
            </div>

            {/* Legend Block */}
            <div className="flex flex-wrap justify-center gap-x-5 gap-y-3 text-[11px] font-bold text-gray-500 mt-8">
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
        <div className="w-full max-w-full bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] overflow-hidden">
          <div className="p-6 md:p-8 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <h3 className="font-serif text-[22px] font-bold text-[#1B2A22] shrink-0">Recent Bookings</h3>
            <div className="flex flex-col lg:flex-row gap-3 w-full lg:w-auto">
              <div className="flex items-center gap-2 bg-[#f9fafb] rounded-xl border border-transparent px-4 h-11 focus-within:border-[#00a877] focus-within:bg-white transition-all w-full lg:w-64">
                <svg className="h-4 w-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                <input value={bookingSearch} onChange={(e) => setBookingSearch(e.target.value)} placeholder="Search bookings..." className="w-full bg-transparent text-[13px] font-semibold text-[#1B2A22] outline-none border-none placeholder:text-gray-400" />
              </div>
              <div className="flex gap-2 w-full lg:w-auto">
                <div className="relative flex-1 lg:flex-none min-w-[110px] lg:min-w-[130px]">
                  <button
                    onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                    className={`flex items-center justify-between gap-2 text-[13px] font-bold text-[#1B2A22] rounded-xl px-4 h-11 focus:outline-none transition-all w-full border ${isStatusDropdownOpen
                      ? 'border-[#00a877] bg-white'
                      : 'border-transparent bg-[#f9fafb] hover:bg-gray-100 hover:border-[#00a877]/30'
                      }`}
                  >
                    <span>{bookingStatusFilter === 'all' ? 'All Status' : bookingStatusFilter === 'confirmed' ? 'Confirmed' : 'Pending'}</span>
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${isStatusDropdownOpen ? 'bg-[#e6f4ea] text-[#00a877]' : 'bg-transparent text-gray-500'}`}><ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isStatusDropdownOpen ? 'rotate-180' : ''}`} /></div>
                  </button>
                  {isStatusDropdownOpen && (<>
                    <div className="fixed inset-0 z-40" onClick={() => setIsStatusDropdownOpen(false)} />
                    <div className="absolute top-full right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] py-2 z-50 w-full min-w-[110px] lg:min-w-[130px]">
                      {[{ value: 'all', label: 'All Status' }, { value: 'confirmed', label: 'Confirmed' }, { value: 'pending', label: 'Pending' }].map((opt) => (
                        <button key={opt.value} onClick={() => { setBookingStatusFilter(opt.value); setIsStatusDropdownOpen(false); }} className={`w-full text-left px-5 py-2.5 text-[13px] font-semibold transition-colors ${bookingStatusFilter === opt.value ? 'bg-[#e6f4ea] text-[#00a877]' : 'text-gray-600 hover:bg-gray-50'}`}>{opt.label}</button>
                      ))}
                    </div>
                  </>)}
                </div>
                <div className="relative flex-1 lg:flex-none min-w-[125px] lg:min-w-[150px]">
                  <button
                    onClick={() => setIsBookingSortDropdownOpen(!isBookingSortDropdownOpen)}
                    className={`flex items-center justify-between gap-2 text-[13px] font-bold text-[#1B2A22] rounded-xl px-4 h-11 focus:outline-none transition-all w-full border ${isBookingSortDropdownOpen
                      ? 'border-[#00a877] bg-white'
                      : 'border-transparent bg-[#f9fafb] hover:bg-gray-100 hover:border-[#00a877]/30'
                      }`}
                  >
                    <span>{bookingSortFilter === 'newest' ? 'Newest First' : bookingSortFilter === 'oldest' ? 'Oldest First' : bookingSortFilter === 'amount-high' ? 'Amount (High)' : 'Amount (Low)'}</span>
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${isBookingSortDropdownOpen ? 'bg-[#e6f4ea] text-[#00a877]' : 'bg-transparent text-gray-500'}`}><ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isBookingSortDropdownOpen ? 'rotate-180' : ''}`} /></div>
                  </button>
                  {isBookingSortDropdownOpen && (<>
                    <div className="fixed inset-0 z-40" onClick={() => setIsBookingSortDropdownOpen(false)} />
                    <div className="absolute top-full right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] py-2 z-50 w-full min-w-[125px] lg:min-w-[150px]">
                      {[{ value: 'newest', label: 'Newest First' }, { value: 'oldest', label: 'Oldest First' }, { value: 'amount-high', label: 'Amount (High to Low)' }, { value: 'amount-low', label: 'Amount (Low to High)' }].map((opt) => (
                        <button key={opt.value} onClick={() => { setBookingSortFilter(opt.value); setIsBookingSortDropdownOpen(false); }} className={`w-full text-left px-5 py-2.5 text-[13px] font-semibold transition-colors ${bookingSortFilter === opt.value ? 'bg-[#e6f4ea] text-[#00a877]' : 'text-gray-600 hover:bg-gray-50'}`}>{opt.label}</button>
                      ))}
                    </div>
                  </>)}
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-[#fafafa] text-[10px] uppercase tracking-wider font-bold text-gray-400">
                  <th className="px-6 md:px-8 py-4 w-[10%]">ID</th>
                  <th className="px-6 py-4 w-[25%]">{renderBookingHeader('property', 'Property')}</th>
                  <th className="px-6 py-4 w-[15%]">{renderBookingHeader('guest', 'Guest')}</th>
                  <th className="px-6 py-4 w-[20%]">{renderBookingHeader('dates', 'Dates')}</th>
                  <th className="px-6 py-4 w-[15%]">{renderBookingHeader('amount', 'Amount')}</th>
                  <th className="px-6 md:px-13 py-4 w-[15%] text-right">{renderBookingHeader('status', 'Status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-[13px] font-semibold text-[#1B2A22]">
                {bookings.length === 0 ? (
                  <tr><td colSpan={6} className="px-8 py-8 text-center text-gray-400 font-medium">No recent bookings.</td></tr>
                ) : (() => {
                  const filtered = [...bookings]
                    .filter(b => {
                      const q = bookingSearch.toLowerCase();
                      const matchSearch = !q || (b.farmId?.title || '').toLowerCase().includes(q) || (b.userId?.name || '').toLowerCase().includes(q);
                      const isConfirmed = !!b.adminConfirmed;
                      const matchStatus = bookingStatusFilter === 'all' || (bookingStatusFilter === 'confirmed' ? isConfirmed : !isConfirmed);
                      return matchSearch && matchStatus;
                    })
                    .sort((a, b) => {
                      if (bookingSortFilter !== 'custom') {
                        if (bookingSortFilter === 'amount-high') return (b.totalPrice || 0) - (a.totalPrice || 0);
                        if (bookingSortFilter === 'amount-low') return (a.totalPrice || 0) - (b.totalPrice || 0);
                        if (bookingSortFilter === 'oldest') return new Date(a.createdAt || a.startDate).getTime() - new Date(b.createdAt || b.startDate).getTime();
                        return new Date(b.createdAt || b.startDate).getTime() - new Date(a.createdAt || a.startDate).getTime();
                      }
                      let cmp = 0;
                      if (bookingSortColumn === 'property') cmp = (a.farmId?.title || '').localeCompare(b.farmId?.title || '');
                      else if (bookingSortColumn === 'guest') cmp = (a.userId?.name || '').localeCompare(b.userId?.name || '');
                      else if (bookingSortColumn === 'dates') cmp = new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
                      else if (bookingSortColumn === 'amount') cmp = (a.totalPrice || 0) - (b.totalPrice || 0);
                      else if (bookingSortColumn === 'status') {
                        const aConf = (a.paymentStatus === 'paid' || a.paymentStatus === 'confirmed' || !!a.adminConfirmed) ? 1 : 0;
                        const bConf = (b.paymentStatus === 'paid' || b.paymentStatus === 'confirmed' || !!b.adminConfirmed) ? 1 : 0;
                        cmp = aConf - bConf;
                      }
                      return bookingSortOrder === 'asc' ? cmp : -cmp;
                    })
                    .slice(0, 5);
                  if (filtered.length === 0) return <tr><td colSpan={6} className="px-8 py-8 text-center text-gray-400 font-medium">No bookings found.</td></tr>;
                  return filtered.map((booking, index) => {
                    const farmTitle = booking.farmId?.title || 'Deleted Property';
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
                      <tr key={booking._id} className="hover:bg-[#fafafa] transition-colors">
                        <td className="px-6 md:px-8 py-5 text-gray-400">{idDisplay}</td>
                        <td className="px-6 py-5 font-bold text-[#1B2A22]">{farmTitle}</td>
                        <td className="px-6 py-5 text-gray-500">{guestName}</td>
                        <td className="px-6 py-5 text-gray-500">{dateRangeDisplay}</td>
                        <td className="px-6 py-5 font-sans tracking-tight font-bold">₹{amount.toLocaleString('en-IN')}</td>
                        <td className="px-6 md:px-8 py-5 text-right">
                          <span className={`inline-block px-3 py-1 text-[11px] font-bold rounded-full tracking-wide ${booking.adminConfirmed
                            ? 'bg-[#e6f4ea] text-[#00a877]'
                            : 'bg-amber-50 text-amber-600'
                            }`}>
                            {booking.adminConfirmed ? 'confirmed' : 'pending'}
                          </span>
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}
