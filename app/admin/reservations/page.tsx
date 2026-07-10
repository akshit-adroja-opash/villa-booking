'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Download, Search } from 'lucide-react';
import toast from 'react-hot-toast';

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

 return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} \u2013 ${end.toLocaleDateString('en-US', {
 month: 'short',
 day: 'numeric',
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
 setBookings(data || []);
 } else {
 setBookings([]);
 }
 } catch (error) {
 console.error('Failed to load bookings:', error);
 setBookings([]);
 } finally {
 setLoading(false);
 }
 }

 loadBookings();
 }, []);

 const filteredBookings = useMemo(() => {
 const normalizedQuery = query.trim().toLowerCase();
 let result = bookings;
 
 if (normalizedQuery) {
 result = bookings.filter((booking) => {
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
 }

 // Sort by startDate in descending order
 return [...result].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
 }, [bookings, query]);

 const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
 const confirmedBookings = bookings.filter((booking) => booking.paymentStatus === 'Paid' || booking.paymentStatus?.toLowerCase() === 'confirmed').length;
 const upcomingBookings = bookings.filter((booking) => new Date(booking.startDate) >= new Date()).length;

 const handleExport = () => {
    try {
      const headers = ['Guest Name', 'Email', 'Property', 'Check-in', 'Check-out', 'Nights', 'Total Amount', 'Status', 'Booking ID'];
      const csvRows = [];
      csvRows.push(headers.join(','));

      filteredBookings.forEach((b) => {
        const guestName = b.userId?.name ? `"${b.userId.name}"` : 'N/A';
        const email = b.userId?.email ? `"${b.userId.email}"` : 'N/A';
        const property = b.farmId?.title ? `"${b.farmId.title}"` : 'N/A';
        const checkIn = new Date(b.startDate).toLocaleDateString('en-IN');
        const checkOut = new Date(b.endDate).toLocaleDateString('en-IN');
        const nights = Math.max(1, Math.ceil((new Date(b.endDate).getTime() - new Date(b.startDate).getTime()) / (1000 * 60 * 60 * 24)));
        const amount = b.totalPrice;
        const status = b.paymentStatus || 'Pending';
        const bookingId = b._id;
        csvRows.push([guestName, email, property, checkIn, checkOut, nights, amount, status, bookingId].join(','));
      });

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reservations_export_${new Date().getTime()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Reservations exported successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export reservations');
    }
  };

 if (loading) {
 return (
 <div className="flex min-h-[60vh] items-center justify-center bg-[#FAF9F6]">
 <div className="h-10 w-10 animate-spin border-t-2 border-[#1B2A22] rounded-full"></div>
 </div>
 );
 }

 return (
 <main className="p-6 md:p-10 bg-[#FAF9F6] min-h-screen">
 <div className="mx-auto max-w-[1280px] space-y-8">
 
 {/* Title Block */}
 <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
 <div>
 <h1 className="font-serif text-[32px] font-bold text-[#1a1f1c]">
 Reservations
 </h1>
 <p className="text-[13px] font-semibold text-gray-400 mt-1">
 Track every guest stay, payment state, and booking window.
 </p>
 </div>
 <button onClick={handleExport} className="flex items-center justify-center gap-2 bg-[#00a877] hover:bg-[#009669] text-white px-5 py-2.5 rounded-lg text-[13px] font-bold transition-all shadow-sm self-start sm:self-auto">
 <Download className="h-4 w-4"/>
 <span>Export</span>
 </button>
 </div>

 {/* Stats Grid */}
 <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
 <div className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 p-6 flex flex-col justify-center min-h-[110px]">
 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">TOTAL RESERVATIONS</p>
 <p className="font-sans tracking-tight text-[28px] font-bold text-[#1B2A22]">{bookings.length}</p>
 </div>
 <div className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 p-6 flex flex-col justify-center min-h-[110px]">
 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">CONFIRMED</p>
 <p className="font-sans tracking-tight text-[28px] font-bold text-[#1B2A22]">{confirmedBookings}</p>
 </div>
 <div className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 p-6 flex flex-col justify-center min-h-[110px]">
 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">BOOKED REVENUE</p>
 <p className="font-sans tracking-tight text-[28px] font-bold text-[#1B2A22]">₹{totalRevenue.toLocaleString('en-IN')}</p>
 </div>
 </div>

 {/* Table Layout Container */}
 <div className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
 
 {/* Search Row */}
 <div className="p-6 border-b border-gray-100">
 <div className="flex w-full max-w-md items-center gap-3 bg-white rounded-xl border border-gray-200 px-4 py-2.5 focus-within:border-gray-300 transition-all shadow-sm">
 <Search className="h-4 w-4 text-gray-400"/>
 <input
 value={query}
 onChange={(event) => setQuery(event.target.value)}
 placeholder="Search reservations..."
 className="w-full bg-transparent text-[13px] font-semibold text-[#1B2A22] outline-none border-none placeholder:text-gray-400"
 />
 </div>
 </div>

 {/* Table */}
 <div className="overflow-x-auto">
 <table className="w-full min-w-[900px] text-left border-collapse whitespace-nowrap">
 <thead>
 <tr className="bg-[#fafafa] text-[10px] font-bold text-gray-400 tracking-wider uppercase border-b border-gray-100">
 <th className="px-8 py-5">Guest</th>
 <th className="px-6 py-5">Property</th>
 <th className="px-6 py-5">Dates</th>
 <th className="px-6 py-5">Total</th>
 <th className="px-6 py-5">Status</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-50 text-[13px] font-semibold text-[#1B2A22]">
 {filteredBookings.length === 0 ? (
 <tr>
 <td colSpan={5} className="px-8 py-12 text-center text-gray-400 font-medium">
 No bookings found.
 </td>
 </tr>
 ) : (
 filteredBookings.map((booking) => {
 const status = booking.paymentStatus?.toLowerCase() || 'pending';
 const isConfirmed = status === 'paid' || status === 'confirmed';
 
 return (
 <tr key={booking._id} className="hover:bg-[#fafafa] transition-colors">
 <td className="px-8 py-5">
 <div className="flex items-center gap-4">
 <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e6f4ea] text-[#00a877] text-sm font-bold font-sans">
 {getInitials(booking.userId?.name)}
 </div>
 <div>
 <p className="font-bold text-[#1B2A22] text-[14px]">{booking.userId?.name || 'Guest'}</p>
 <p className="text-[11px] font-bold text-gray-400 mt-0.5">{booking.userId?.email || 'No email'}</p>
 </div>
 </div>
 </td>
 <td className="px-6 py-5">
 <p className="font-bold text-[#1B2A22] text-[14px]">{booking.farmId?.title || 'Property'}</p>
 <p className="text-[11px] font-bold text-gray-400 mt-0.5">{booking.farmId?.location?.split(',')[0] || 'Location unavailable'}</p>
 </td>
 <td className="px-6 py-5">
 <div className="flex items-start gap-3">
 <CalendarDays className="mt-0.5 h-4 w-4 text-gray-400"/>
 <div>
 <p className="text-[13px] font-bold text-[#1B2A22]">{formatDateRange(booking.startDate, booking.endDate)}</p>
 <p className="text-[11px] font-bold text-gray-400 mt-0.5">{getNights(booking.startDate, booking.endDate)}</p>
 </div>
 </div>
 </td>
 <td className="px-6 py-5 font-sans tracking-tight font-bold text-[14px] text-[#1B2A22]">
 ₹{(booking.totalPrice || 0).toLocaleString('en-IN')}
 </td>
 <td className="px-6 py-5">
 <span className={`inline-block px-3 py-1 text-[10px] font-bold rounded-full tracking-wide ${
 isConfirmed
 ? 'bg-[#e6f4ea] text-[#00a877]'
 : 'bg-orange-50 text-orange-500'
 }`}>
 {isConfirmed ? 'confirmed' : 'pending'}
 </span>
 </td>
 </tr>
 );
 })
 )}
 </tbody>
 </table>
 </div>

 {/* Footer */}
 <div className="border-t border-gray-100 p-6 text-[12px] font-bold text-gray-400 bg-white">
 Showing {filteredBookings.length} of {bookings.length} reservations. {upcomingBookings} upcoming.
 </div>
 </div>
 </div>
 </main>
 );
}
