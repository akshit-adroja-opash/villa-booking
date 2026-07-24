'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Download, IndianRupee, WalletCards, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

type Booking = {
 _id: string;
 startDate: string;
 totalPrice: number;
 paymentStatus?: string;
 razorpayOrderId?: string;
 farmId?: {
 title?: string;
 };
 userId?: {
 name?: string;
 email?: string;
 };
 adminConfirmed?: boolean;
 createdAt?: string;
};

type SortColumn = 'guest' | 'property' | 'orderId' | 'status' | 'amount' | 'createdAt';
type SortOrder = 'asc' | 'desc';

export default function AdminFinancialsPage() {
 const [bookings, setBookings] = useState<Booking[]>([]);
 const [loading, setLoading] = useState(true);

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
 console.error('Failed to load financials:', error);
 setBookings([]);
 } finally {
 setLoading(false);
 }
 }

 loadBookings();
 }, []);

 const paidBookings = bookings.filter((booking) => booking.adminConfirmed);
 const pendingBookings = bookings.filter((booking) => !booking.adminConfirmed);
 const grossRevenue = paidBookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
 const pendingRevenue = pendingBookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);

  const handleExport = () => {
    try {
      const headers = ['Date', 'Farmhouse', 'Guest', 'Amount', 'Status', 'Booking ID'];
      const csvRows = [];
      csvRows.push(headers.join(','));

      let totalAmount = 0;

      bookings.forEach((b) => {
        // Format as "15 Jul 2026" to prevent Excel from showing #######
        const date = new Date(b.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        const farm = b.farmId?.title ? `"${b.farmId.title}"` : 'N/A';
        const guest = b.userId?.name ? `"${b.userId.name}"` : 'N/A';
        const amount = b.totalPrice || 0;
        totalAmount += amount;
        const status = b.paymentStatus || 'Pending';
        const bookingId = b._id;
        csvRows.push([date, farm, guest, amount, status, bookingId].join(','));
      });

      // Add summary rows at the bottom
      csvRows.push(''); // Empty spacing line
      csvRows.push(`,,Total Guests:,${bookings.length},,`);
      csvRows.push(`,,Total Revenue:,"₹${totalAmount.toLocaleString('en-IN')}",,`);

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `financial_report_${new Date().getTime()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Report exported successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export report');
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [sortFilter, setSortFilter] = useState('newest');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [sortColumn, setSortColumn] = useState<SortColumn>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const getOrderId = (booking: Booking) => booking.razorpayOrderId || `order_${booking._id.slice(-10)}`;

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
      setSortColumn('amount');
      setSortOrder('desc');
    } else if (value === 'amount-low') {
      setSortColumn('amount');
      setSortOrder('asc');
    }
  };

  const handleHeaderSort = (column: SortColumn) => {
    const nextOrder = sortColumn === column
      ? (sortOrder === 'asc' ? 'desc' : 'asc')
      : (column === 'amount' || column === 'createdAt' ? 'desc' : 'asc');

    setCurrentPage(1);
    setSortColumn(column);
    setSortOrder(nextOrder);
    setSortFilter('custom');
  };

  const getSortLabel = () => {
    if (sortColumn === 'createdAt') return sortOrder === 'desc' ? 'Newest First' : 'Oldest First';
    if (sortColumn === 'amount') return sortOrder === 'desc' ? 'Amount (High to Low)' : 'Amount (Low to High)';
    if (sortColumn === 'guest') return sortOrder === 'asc' ? 'Guest (A-Z)' : 'Guest (Z-A)';
    if (sortColumn === 'property') return sortOrder === 'asc' ? 'Property (A-Z)' : 'Property (Z-A)';
    if (sortColumn === 'orderId') return sortOrder === 'asc' ? 'Order ID (A-Z)' : 'Order ID (Z-A)';
    return sortOrder === 'asc' ? 'Status (A-Z)' : 'Status (Z-A)';
  };

  const renderSortHeader = (column: SortColumn, label: string, align: 'left' | 'right' = 'left') => {
    const active = sortColumn === column;

    return (
      <button
        type="button"
        onClick={() => handleHeaderSort(column)}
        className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider transition-colors hover:text-[#00a877] ${
          align === 'right' ? 'justify-end' : 'justify-start'
        } ${active ? 'text-[#1B2A22]' : 'text-gray-500'}`}
      >
        <span>{label}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-all ${active ? 'opacity-100' : 'opacity-35'} ${active && sortOrder === 'asc' ? 'rotate-180' : ''}`} />
      </button>
    );
  };

  const sortedTransactions = useMemo(() => {
    return [...bookings].sort((a, b) => {
      let comparison = 0;

      if (sortColumn === 'createdAt') {
        comparison = new Date(a.createdAt || a.startDate).getTime() - new Date(b.createdAt || b.startDate).getTime();
      } else if (sortColumn === 'guest') {
        comparison = (a.userId?.name || 'Guest').localeCompare(b.userId?.name || 'Guest');
      } else if (sortColumn === 'property') {
        comparison = (a.farmId?.title || 'Property').localeCompare(b.farmId?.title || 'Property');
      } else if (sortColumn === 'orderId') {
        comparison = getOrderId(a).localeCompare(getOrderId(b));
      } else if (sortColumn === 'status') {
        comparison = (a.paymentStatus || 'pending').localeCompare(b.paymentStatus || 'pending');
      } else if (sortColumn === 'amount') {
        comparison = (a.totalPrice || 0) - (b.totalPrice || 0);
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [bookings, sortColumn, sortOrder]);

  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);
  const paginatedTransactions = sortedTransactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
 Financials
 </h1>
 <p className="text-[13px] font-semibold text-gray-400 mt-1">
 Revenue, pending payments, and transaction activity.
 </p>
 </div>
 <button onClick={handleExport} className="flex items-center justify-center gap-2 bg-[#00a877] hover:bg-[#009669] text-white px-5 py-2.5 rounded-lg text-[13px] font-bold transition-all shadow-sm self-end sm:self-auto">
 <Download className="h-4 w-4"/>
 <span>Export Report</span>
 </button>
 </div>

 {/* Stats Grid */}
 <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
 {[
 { label: 'TOTAL REVENUE', value: `₹${grossRevenue.toLocaleString('en-IN')}`, icon: IndianRupee },
 { label: 'PENDING REVENUE', value: `₹${pendingRevenue.toLocaleString('en-IN')}`, icon: WalletCards },
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

 {/* Transaction History Section */}
 <div className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
 <div className="p-6 md:p-8 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
 <div>
 <h3 className="font-serif text-[22px] font-bold text-[#1B2A22]">All Transactions</h3>
 <p className="text-[13px] font-semibold text-gray-400 mt-1">Latest booking payments from guests.</p>
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

 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse min-w-[850px]">
 <thead>
 <tr className="bg-[#fafafa] text-[10px] uppercase tracking-wider font-bold text-gray-500 border-b border-gray-100">
 <th className="px-8 py-5">{renderSortHeader('guest', 'Guest')}</th>
 <th className="px-6 py-5">{renderSortHeader('property', 'Property')}</th>
 <th className="px-6 py-5">{renderSortHeader('orderId', 'Order ID')}</th>
 <th className="px-6 py-5">{renderSortHeader('status', 'Status')}</th>
 <th className="px-8 py-5 text-right">{renderSortHeader('amount', 'Amount', 'right')}</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-50 text-[13px] font-semibold text-[#1B2A22]">
 {paginatedTransactions.length === 0 ? (
 <tr>
 <td colSpan={5} className="px-8 py-12 text-center text-gray-400 font-medium">
 No recent transactions found.
 </td>
 </tr>
 ) : (
 paginatedTransactions.map((booking) => {
 const isPaid = !!booking.adminConfirmed;

 return (
 <tr key={booking._id} className="hover:bg-[#fafafa] transition-colors">
 <td className="px-8 py-5">
 <p className="font-bold text-[#1B2A22] text-[14px]">{booking.userId?.name || 'Guest'}</p>
 <p className="text-[11px] font-bold text-gray-400 mt-0.5">{booking.userId?.email || 'No email'}</p>
 </td>
 <td className="px-6 py-5 font-bold text-[#1B2A22] text-[14px]">{booking.farmId?.title || 'Property'}</td>
 <td className="px-6 py-5 text-gray-400 font-medium">{getOrderId(booking)}</td>
 <td className="px-6 py-5">
 <span className={`inline-block px-3 py-1 text-[10px] font-bold rounded-full tracking-wide ${
 isPaid
 ? 'bg-[#e6f4ea] text-[#00a877]'
 : 'bg-orange-50 text-orange-500'
 }`}>
 {isPaid ? 'paid' : 'pending'}
 </span>
 </td>
 <td className="px-8 py-5 text-right font-sans tracking-tight font-bold text-[14px] text-[#1B2A22]">
 ₹{(booking.totalPrice || 0).toLocaleString('en-IN')}
 </td>
 </tr>
 );
 })
 )}
   </tbody>
  </table>
  </div>
  {/* Footer */}
  {totalPages > 0 && (
    <div className="flex items-center justify-between border-t border-gray-100 bg-white px-6 py-4">
      <p className="text-[13px] font-medium text-gray-500 hidden sm:block">
        Showing <span className="font-bold text-[#1B2A22]">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
        <span className="font-bold text-[#1B2A22]">{Math.min(currentPage * itemsPerPage, sortedTransactions.length)}</span> of{' '}
        <span className="font-bold text-[#1B2A22]">{sortedTransactions.length}</span> results
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
