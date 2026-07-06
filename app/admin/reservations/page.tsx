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
        console.error('Failed to load reservations:', error);
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
      <div className="flex min-h-[60vh] items-center justify-center bg-[#fdfbf7]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#00a877] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <main className="p-6 md:p-10 bg-[#fdfbf7]">
      <div className="mx-auto max-w-[1280px] space-y-8">
        
        {/* Title Block */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-[#1a1b22]">
              Reservations
            </h1>
            <p className="mt-1 text-sm text-[#707974] font-medium">
              Track every guest stay, payment state, and booking window.
            </p>
          </div>
          <button className="flex items-center justify-center gap-2 bg-[#00a877] hover:bg-[#009669] text-white px-5 py-3 rounded-xl text-sm font-bold shadow-md shadow-[#00a877]/10 transition-all active:scale-[0.98] self-start sm:self-auto">
            <Download className="h-4.5 w-4.5" />
            <span>Export</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { label: 'Total Reservations', value: bookings.length.toString() },
            { label: 'Confirmed', value: confirmedBookings.toString() },
            { label: 'Booked Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}` },
          ].map((stat) => (
            <div key={stat.label} className="bg-white border border-[#bfc9c3]/20 rounded-2xl p-6 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#707974]">{stat.label}</p>
              <p className="mt-2 font-serif text-2xl font-bold text-[#1a1b22]">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Search Row */}
        <div className="bg-white border border-[#bfc9c3]/20 rounded-2xl overflow-hidden shadow-sm shadow-[#064e3b]/3">
          <div className="flex flex-col gap-4 border-b border-[#bfc9c3]/15 p-6 md:flex-row md:items-center md:justify-between">
            <div className="flex w-full max-w-md items-center gap-3 bg-white border border-[#bfc9c3]/40 rounded-xl px-4 py-3 shadow-sm focus-within:border-[#00a877] transition-all">
              <Search className="h-4.5 w-4.5 text-gray-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search reservations..."
                className="w-full bg-transparent text-sm font-semibold outline-none border-none p-0 focus:ring-0"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left border-collapse">
              <thead>
                <tr className="border-b border-[#bfc9c3]/15 bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Guest</th>
                  <th className="px-6 py-4">Property</th>
                  <th className="px-6 py-4">Dates</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#bfc9c3]/10 text-sm font-semibold text-[#1a1b22]">
                {filteredBookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e6f4ea] text-[#00a877] font-bold">
                          {getInitials(booking.userId?.name)}
                        </div>
                        <div>
                          <p className="font-bold text-[#1a1b22]">{booking.userId?.name || 'Guest'}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{booking.userId?.email || 'No email'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-[#1a1b22]">{booking.farmId?.title || 'Property'}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{booking.farmId?.location || 'Location unavailable'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2">
                        <CalendarDays className="mt-0.5 h-4.5 w-4.5 text-gray-400" />
                        <div>
                          <p className="text-sm font-bold text-[#1a1b22]">{formatDateRange(booking.startDate, booking.endDate)}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{getNights(booking.startDate, booking.endDate)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-[#003527]">₹{(booking.totalPrice || 0).toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full lowercase ${
                        booking.paymentStatus === 'Paid'
                          ? 'bg-[#e6f4ea] text-[#0f766e]'
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {booking.paymentStatus === 'Paid' ? 'confirmed' : 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-gray-400 hover:text-[#00a877] rounded-lg transition-colors">
                        <MoreVertical className="h-4.5 w-4.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-[#bfc9c3]/15 p-6 text-xs text-[#707974] font-semibold bg-gray-50">
            Showing {filteredBookings.length} of {bookings.length} reservations. {upcomingBookings} upcoming.
          </div>
        </div>
      </div>
    </main>
  );
}
