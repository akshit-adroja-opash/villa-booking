'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Download, Search, ChevronDown, CheckCircle2, IndianRupee, Trash2 } from 'lucide-react';
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
 adminConfirmed?: boolean;
 createdAt?: string;
};

type SortColumn = 'guest' | 'property' | 'dates' | 'total' | 'status' | 'createdAt';
type SortOrder = 'asc' | 'desc';

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
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [sortFilter, setSortFilter] = useState('newest');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [sortColumn, setSortColumn] = useState<SortColumn>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const toggleConfirm = async (id: string, currentStatus: boolean) => {
    try {
      setUpdatingId(id);
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminConfirmed: !currentStatus })
      });
      if (res.ok) {
        toast.success(currentStatus ? 'Booking unconfirmed' : 'Booking confirmed');
        setBookings(prev => prev.map(b => b._id === id ? { ...b, adminConfirmed: !currentStatus } : b));
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      toast.error('Could not update status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteBooking = (id: string) => {
    toast((t) => (
      <div className="flex flex-col gap-2 p-1">
        <p className="text-[13px] font-semibold text-[#1B2A22]">Are you sure you want to delete this booking?</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              executeDelete(id);
            }}
            className="bg-red-500 text-white px-3 py-1 rounded text-xs font-bold hover:bg-red-600 transition-colors cursor-pointer"
          >
            Delete
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="bg-gray-100 text-[#1B2A22] px-3 py-1 rounded text-xs font-bold hover:bg-gray-200 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    ), {
      duration: 6000,
      position: 'bottom-center'
    });
  };

  const executeDelete = async (id: string) => {
    try {
      setDeletingId(id);
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success('Booking deleted successfully');
        setBookings(prev => prev.filter(b => b._id !== id));
      } else {
        toast.error('Failed to delete booking');
      }
    } catch (error) {
      toast.error('Could not delete booking.');
    } finally {
      setDeletingId(null);
    }
  };
 
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

 const handleSortPresetChange = (value: string) => {
 setCurrentPage(1);
 setSortFilter(value);

 if (value === 'newest') {
 setSortColumn('createdAt');
 setSortOrder('desc');
 } else if (value === 'oldest') {
 setSortColumn('createdAt');
 setSortOrder('asc');
 } else if (value === 'amount-high') {
 setSortColumn('total');
 setSortOrder('desc');
 } else if (value === 'amount-low') {
 setSortColumn('total');
 setSortOrder('asc');
 }
 };

 const handleHeaderSort = (column: SortColumn) => {
 const nextOrder = sortColumn === column
 ? (sortOrder === 'asc' ? 'desc' : 'asc')
 : (column === 'total' || column === 'dates' || column === 'createdAt' ? 'desc' : 'asc');

 setCurrentPage(1);
 setSortColumn(column);
 setSortOrder(nextOrder);
 setSortFilter('custom');
 };

 const getSortLabel = () => {
 if (sortColumn === 'createdAt') return sortOrder === 'desc' ? 'Newest First' : 'Oldest First';
 if (sortColumn === 'total') return sortOrder === 'desc' ? 'Amount (High to Low)' : 'Amount (Low to High)';
 if (sortColumn === 'guest') return sortOrder === 'asc' ? 'Guest (A-Z)' : 'Guest (Z-A)';
 if (sortColumn === 'property') return sortOrder === 'asc' ? 'Property (A-Z)' : 'Property (Z-A)';
 if (sortColumn === 'dates') return sortOrder === 'desc' ? 'Dates (Newest First)' : 'Dates (Oldest First)';
 return sortOrder === 'asc' ? 'Status (A-Z)' : 'Status (Z-A)';
 };

 const renderSortHeader = (column: SortColumn, label: string) => {
 const active = sortColumn === column;

 return (
 <button
 type="button"
 onClick={() => handleHeaderSort(column)}
 className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider transition-colors hover:text-[#00a877] ${
 active ? 'text-[#1B2A22]' : 'text-gray-400'
 }`}
 >
 <span>{label}</span>
 <ChevronDown className={`h-3.5 w-3.5 transition-all ${active ? 'opacity-100' : 'opacity-35'} ${active && sortOrder === 'asc' ? 'rotate-180' : ''}`} />
 </button>
 );
 };

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

  return [...result].sort((a, b) => {
    let comparison = 0;

    if (sortColumn === 'createdAt') {
      comparison = new Date(a.createdAt || a.startDate).getTime() - new Date(b.createdAt || b.startDate).getTime();
    } else if (sortColumn === 'guest') {
      comparison = (a.userId?.name || 'Guest').localeCompare(b.userId?.name || 'Guest');
    } else if (sortColumn === 'property') {
      comparison = (a.farmId?.title || 'Property').localeCompare(b.farmId?.title || 'Property');
    } else if (sortColumn === 'dates') {
      comparison = new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    } else if (sortColumn === 'total') {
      comparison = (a.totalPrice || 0) - (b.totalPrice || 0);
    } else if (sortColumn === 'status') {
      comparison = (a.paymentStatus || 'pending').localeCompare(b.paymentStatus || 'pending');
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });
 }, [bookings, query, sortColumn, sortOrder]);

 const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
 const paginatedBookings = filteredBookings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

 const totalRevenue = bookings.filter(b => b.adminConfirmed).reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
 const confirmedBookings = bookings.filter((booking) => booking.adminConfirmed).length;
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
        const checkIn = `"${new Date(b.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}"`;
        const checkOut = `"${new Date(b.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}"`;
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
      
      toast.success('Bookings exported successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export bookings');
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
 <div className="w-full mx-auto space-y-8">
 
 {/* Title Block */}
 <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
 <div>
 <h1 className="font-serif text-[32px] font-bold text-[#1a1f1c]">
 Bookings
 </h1>
 <p className="text-[13px] font-semibold text-gray-400 mt-1">
 Track every guest stay, payment state, and booking window.
 </p>
 </div>
 <button onClick={handleExport} className="flex items-center justify-center gap-2 bg-[#00a877] hover:bg-[#009669] text-white px-5 py-2.5 rounded-lg text-[13px] font-bold transition-all shadow-sm self-end sm:self-auto">
 <Download className="h-4 w-4"/>
 <span>Export</span>
 </button>
 </div>

 {/* Stats Grid */}
 <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
 {[
 { label: 'TOTAL BOOKINGS', value: bookings.length, icon: CalendarDays },
 { label: 'CONFIRMED', value: confirmedBookings, icon: CheckCircle2 },
 { label: 'BOOKED REVENUE', value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: IndianRupee },
 ].map((stat) => (
 <div key={stat.label} className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 p-6 flex items-start justify-between min-h-[110px]">
 <div className="flex flex-col justify-between h-full">
 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">{stat.label}</p>
 <h3 className="font-sans tracking-tight text-[28px] font-bold text-[#1B2A22] leading-none">{stat.value}</h3>
 </div>
 <div className="bg-[#e6f4ea] text-[#00a877] h-10 w-10 rounded-xl flex items-center justify-center shrink-0">
 <stat.icon className="h-5 w-5 stroke-[2]"/>
 </div>
 </div>
 ))}
 </div>

 {/* Table Layout Container */}
 <div className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
 
  {/* Search Row */}
  <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
  <div className="flex w-full md:w-1/2 items-center gap-3 bg-[#f9fafb] rounded-xl border border-transparent px-4 py-2.5 focus-within:border-gray-200 focus-within:bg-white transition-all">
  <Search className="h-4 w-4 text-gray-400"/>
  <input
  value={query}
  onChange={(event) => {
  setQuery(event.target.value);
  setCurrentPage(1);
  }}
  placeholder="Search Bookings..."
  className="w-full bg-transparent text-[13px] font-semibold text-[#1B2A22] outline-none border-none placeholder:text-gray-400"
  />
  </div>
  
  {/* Sort selector dropdown */}
  <div className="w-full md:w-auto min-w-[200px] relative">
    <div className="relative">
      <button 
        onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
        className="flex items-center justify-between gap-2 text-[13px] font-bold text-[#1B2A22] bg-[#f9fafb] border border-transparent rounded-xl px-4 h-11 hover:bg-gray-100 hover:border-[#00a877]/30 focus:outline-none focus:border-[#00a877] transition-all w-full"
      >
        <span>{getSortLabel()}</span>
        <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${isSortDropdownOpen ? 'bg-[#e6f4ea] text-[#00a877]' : 'bg-transparent text-gray-500'}`}>
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isSortDropdownOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>
     
      {isSortDropdownOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsSortDropdownOpen(false)}></div>
          <div className="absolute top-full right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] py-2 z-50 overflow-hidden w-full min-w-[200px]">
            {[
              { value: 'newest', label: 'Newest First' },
              { value: 'oldest', label: 'Oldest First' },
              { value: 'amount-high', label: 'Amount (High to Low)' },
              { value: 'amount-low', label: 'Amount (Low to High)' }
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  handleSortPresetChange(opt.value);
                  setIsSortDropdownOpen(false);
                }}
                className={`w-full text-left px-5 py-2.5 text-[13px] font-semibold transition-colors ${
                  sortFilter === opt.value ? 'bg-[#e6f4ea] text-[#00a877]' : 'text-gray-600 hover:bg-gray-50'
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
  </div>

 {/* Table */}
 <div className="overflow-x-auto">
 <table className="w-full min-w-[900px] text-left border-collapse whitespace-nowrap">
 <thead>
 <tr className="bg-[#fafafa] text-[10px] font-bold text-gray-400 tracking-wider uppercase border-b border-gray-100">
 <th className="px-8 py-5 w-[25%]">{renderSortHeader('guest', 'Guest')}</th>
 <th className="px-6 py-5 w-[25%]">{renderSortHeader('property', 'Property')}</th>
 <th className="px-6 py-5 w-[20%]">{renderSortHeader('dates', 'Dates')}</th>
 <th className="px-6 py-5 w-[10%]">{renderSortHeader('total', 'Total')}</th>
 <th className="px-6 py-5 w-[10%]">{renderSortHeader('status', 'Status')}</th>
 <th className="px-9 py-5 w-[10%]">Action</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-50 text-[13px] font-semibold text-[#1B2A22]">
 {filteredBookings.length === 0 ? (
 <tr>
 <td colSpan={6} className="px-8 py-12 text-center text-gray-400 font-medium">
 No bookings found.
 </td>
 </tr>
 ) : (
 paginatedBookings.map((booking) => {
 const isConfirmed = !!booking.adminConfirmed;
 
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
 <td className="px-6 py-5">
    <div className="flex items-center gap-6">
       <button 
         onClick={() => toggleConfirm(booking._id, !!booking.adminConfirmed)}
         disabled={updatingId === booking._id || deletingId === booking._id}
         className={`px-4 py-1.5 text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center w-[85px] ${
           booking.adminConfirmed 
           ? 'bg-red-50 text-red-600 hover:bg-red-100' 
           : 'bg-[#00a877] text-white hover:bg-[#009669]'
         } ${updatingId === booking._id ? 'opacity-70 cursor-not-allowed' : ''}`}
       >
         {updatingId === booking._id ? (
           <div className="h-3.5 w-3.5 animate-spin border-2 border-current border-t-transparent rounded-full"></div>
         ) : (
           booking.adminConfirmed ? 'Cancel' : 'Confirm'
         )}
       </button>
       
       <button
         onClick={() => handleDeleteBooking(booking._id)}
         disabled={updatingId === booking._id || deletingId === booking._id}
         className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50 flex items-center justify-center p-1.5 cursor-pointer"
         title="Delete Booking"
       >
         {deletingId === booking._id ? (
           <div className="h-3.5 w-3.5 animate-spin border-2 border-current border-t-transparent rounded-full"></div>
         ) : (
           <Trash2 className="h-4 w-4" />
         )}
       </button>
    </div>
  </td>
 </tr>
 );
 })
 )}
 </tbody>
 </table>
 </div>

 {/* Footer */}
  {totalPages > 1 && (
    <div className="flex items-center justify-between border-t border-gray-100 bg-white px-6 py-4">
      <p className="text-[13px] font-medium text-gray-500 hidden sm:block">
        Showing <span className="font-bold text-[#1B2A22]">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
        <span className="font-bold text-[#1B2A22]">{Math.min(currentPage * itemsPerPage, filteredBookings.length)}</span> of{' '}
        <span className="font-bold text-[#1B2A22]">{filteredBookings.length}</span> results
      </p>
      <div className="flex items-center gap-1.5 w-full sm:w-auto justify-center sm:justify-end">
        <button 
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1.5 text-[12px] font-bold text-gray-500 hover:text-[#002E1E] disabled:opacity-50 transition-colors bg-gray-50 hover:bg-gray-100 rounded-md"
        >
          Previous
        </button>
        <div className="flex items-center gap-1 mx-1">
          <span className="text-[12px] font-bold text-gray-500 sm:hidden mx-2">
            Page {currentPage} of {totalPages}
          </span>
          <div className="hidden sm:flex items-center gap-1">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx + 1)}
                className={`w-8 h-8 flex items-center justify-center text-[12px] font-bold rounded-md transition-colors ${
                  currentPage === idx + 1
                    ? 'bg-[#00a877] text-white shadow-sm'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-[#1B2A22]'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
        <button 
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 text-[12px] font-bold text-gray-500 hover:text-[#002E1E] disabled:opacity-50 transition-colors bg-gray-50 hover:bg-gray-100 rounded-md"
        >
          Next
        </button>
      </div>
    </div>
  )}
 </div>
 </div>
 </main>
 );
}
