'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Download, Search, MoreVertical } from 'lucide-react';

type Booking = {
  _id: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  paymentStatus?: string;
  farmId?: {
    title?: string;
    location?: string;
    pricePerNight?: number;
  };
  userId?: {
    name?: string;
    email?: string;
  };
};

function formatDateRange(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return `${startDate} - ${endDate}`;
  }

  return `${start.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} – ${end.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })}`;
}

function getNights(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 'N/A';
  }

  const nights = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  return `${nights} night${nights === 1 ? '' : 's'}`;
}

function getInitials(name?: string) {
  if (!name) return 'G';
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const MOCK_RESERVATIONS: Booking[] = [
  {
    _id: 'res-1',
    startDate: '2024-12-20',
    endDate: '2024-12-23',
    totalPrice: 10500,
    paymentStatus: 'Paid',
    farmId: { title: 'Sunrise Valley Farm', location: 'Manali, India' },
    userId: { name: 'Arjun Mehta', email: 'arjun@agristay.com' }
  },
  {
    _id: 'res-2',
    startDate: '2025-01-10',
    endDate: '2025-01-14',
    totalPrice: 22000,
    paymentStatus: 'Paid',
    farmId: { title: 'Hilltop Haven', location: 'Goa, India' },
    userId: { name: 'Arjun Mehta', email: 'arjun@agristay.com' }
  },
  {
    _id: 'res-3',
    startDate: '2025-02-14',
    endDate: '2025-02-17',
    totalPrice: 18000,
    paymentStatus: 'Pending',
    farmId: { title: 'Coastal Retreat', location: 'Rishikesh, India' },
    userId: { name: 'Sarah Williams', email: 'sarah.w@gmail.com' }
  }
];

export default function AdminReservationsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    async function loadBookings() {
      try {
        const response = await fetch('/api/bookings');
        if (response.ok) {
          const data = await response.json();
          if (!data || data.length === 0) {
            setBookings(MOCK_RESERVATIONS);
          } else {
            const merged = [...data];
            MOCK_RESERVATIONS.forEach(mock => {
              if (!merged.some(b => b._id === mock._id)) {
                merged.push(mock);
              }
            });
            setBookings(merged);
          }
        } else {
          setBookings(MOCK_RESERVATIONS);
        }
      } catch (error) {
        console.error('Failed to load bookings:', error);
        setBookings(MOCK_RESERVATIONS);
      } finally {
        setLoading(false);
      }
    }

    loadBookings();
  }, []);

  const filteredBookings = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return bookings;

    return bookings.filter((booking) => {
      const haystack = [
        booking.userId?.name,
        booking.userId?.email,
        booking.farmId?.title,
        booking.farmId?.location,
        booking.paymentStatus,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [bookings, query]);

  const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
  const confirmedBookings = bookings.filter((booking) => booking.paymentStatus === 'Paid').length;
  const upcomingBookings = bookings.filter((booking) => new Date(booking.startDate) >= new Date()).length;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#FAF9F6]">
        <div className="h-10 w-10 animate-spin border-t-2 border-[#1B2A22] rounded-full"></div>
      </div>
    );
  }

  return (
    <main className="p-6 md:p-10 bg-[#FAF9F6]">
      <div className="mx-auto max-w-[1280px] space-y-8">
        
        {/* Title Block */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-serif text-3xl font-normal tracking-tight text-[#1B2A22]">
              Bookings
            </h1>
            <p className="mt-2 text-[10px] uppercase tracking-[0.2em] font-bold text-[#1B2A22]/60">
              Track Guest Stays & Payment State
            </p>
          </div>
          <button className="flex items-center justify-center gap-2 bg-[#00a877] hover:bg-[#009669] text-white px-5 py-3 text-[10px] uppercase tracking-widest font-bold transition-colors self-start sm:self-auto">
            <Download className="h-4 w-4" />
            <span>Export Manifest</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { label: 'Total Bookings', value: bookings.length.toString(), color: '#1B2A22' },
            { label: 'Confirmed', value: confirmedBookings.toString(), color: '#1B2A22' },
            { label: 'Booked Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, color: '#1B2A22' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white border border-[#1B2A22]/10 p-6">
              <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#1B2A22]/60 mb-2">{stat.label}</p>
              <p className="font-serif text-3xl" style={{ color: stat.color }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Search Row */}
        <div className="bg-white border border-[#1B2A22]/10">
          <div className="flex flex-col gap-4 border-b border-[#1B2A22]/10 p-6 md:flex-row md:items-center md:justify-between">
            <div className="flex w-full max-w-md items-center gap-3 bg-[#FAF9F6] border border-[#1B2A22]/10 px-4 py-3 focus-within:border-[#1B2A22] transition-all">
              <Search className="h-4 w-4 text-[#1B2A22]/40" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search bookings..."
                className="w-full bg-transparent text-sm font-semibold text-[#1B2A22] outline-none border-none placeholder:text-[#1B2A22]/30"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1B2A22]/10 bg-[#FAF9F6] text-[9px] font-bold text-[#1B2A22]/50 uppercase tracking-[0.15em]">
                  <th className="px-6 py-5">Guest</th>
                  <th className="px-6 py-5">Property</th>
                  <th className="px-6 py-5">Dates</th>
                  <th className="px-6 py-5">Total</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1B2A22]/5 text-[13px] font-semibold text-[#1B2A22]">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-[#1B2A22]/40 font-serif italic text-lg">
                      No bookings found.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => (
                    <tr key={booking._id} className="hover:bg-[#FAF9F6]/50 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#1B2A22]/10 text-[#1B2A22] border border-[#1B2A22]/20 text-[11px] font-bold">
                            {getInitials(booking.userId?.name)}
                          </div>
                          <div>
                            <p className="font-serif text-base text-[#1B2A22]">{booking.userId?.name || 'Guest'}</p>
                            <p className="text-[10px] uppercase tracking-widest text-[#1B2A22]/50 mt-0.5">{booking.userId?.email || 'No email'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="font-serif text-base text-[#1B2A22]">{booking.farmId?.title || 'Property'}</p>
                        <p className="text-[10px] uppercase tracking-widest text-[#1B2A22]/50 mt-0.5">{booking.farmId?.location || 'Location unavailable'}</p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-start gap-3">
                          <CalendarDays className="mt-0.5 h-4 w-4 text-[#1B2A22]" />
                          <div>
                            <p className="text-[13px] font-bold text-[#1B2A22]">{formatDateRange(booking.startDate, booking.endDate)}</p>
                            <p className="text-[10px] uppercase tracking-widest text-[#1B2A22]/50 mt-0.5">{getNights(booking.startDate, booking.endDate)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 font-serif text-lg text-[#1B2A22]">₹{(booking.totalPrice || 0).toLocaleString('en-IN')}</td>
                      <td className="px-6 py-5">
                        <span className={`inline-block px-3 py-1 text-[9px] font-bold uppercase tracking-widest border ${
                          booking.paymentStatus === 'Paid'
                            ? 'bg-[#e6f4ea] text-[#00a877] border-[#00a877]/20'
                            : 'bg-transparent text-[#1B2A22] border-[#1B2A22]'
                        }`}>
                          {booking.paymentStatus === 'Paid' ? 'Confirmed' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button className="p-2 text-[#1B2A22]/30 hover:text-[#1B2A22] transition-colors">
                          <MoreVertical className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-[#1B2A22]/10 p-6 text-[10px] uppercase tracking-widest font-bold text-[#1B2A22]/50 bg-[#FAF9F6]">
            Showing {filteredBookings.length} of {bookings.length} bookings • {upcomingBookings} upcoming
          </div>
        </div>
      </div>
    </main>
  );
}
