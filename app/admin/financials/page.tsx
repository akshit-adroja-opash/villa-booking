'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { CreditCard, Download, IndianRupee, ReceiptText, WalletCards } from 'lucide-react';
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
};

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

 const paidBookings = bookings.filter((booking) => booking.paymentStatus === 'Paid' || booking.paymentStatus?.toLowerCase() === 'confirmed');
 const pendingBookings = bookings.filter((booking) => booking.paymentStatus !== 'Paid' && booking.paymentStatus?.toLowerCase() !== 'confirmed');
 const grossRevenue = paidBookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
 const pendingRevenue = pendingBookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
 const platformFees = Math.round(grossRevenue * 0.08);
 const netPayout = grossRevenue - platformFees;

 const handleExport = () => {
    try {
      const headers = ['Date', 'Farmhouse', 'Guest', 'Amount', 'Status', 'Booking ID'];
      const csvRows = [];
      csvRows.push(headers.join(','));

      bookings.forEach((b) => {
        const date = new Date(b.startDate).toLocaleDateString('en-IN');
        const farm = b.farmId?.title ? `"${b.farmId.title}"` : 'N/A';
        const guest = b.userId?.name ? `"${b.userId.name}"` : 'N/A';
        const amount = b.totalPrice;
        const status = b.paymentStatus || 'Pending';
        const bookingId = b._id;
        csvRows.push([date, farm, guest, amount, status, bookingId].join(','));
      });

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

  const sortedTransactions = useMemo(() => {
    return [...bookings].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  }, [bookings]);

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
 <div className="mx-auto max-w-[1280px] space-y-8">
 
 {/* Title Block */}
 <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
 <div>
 <h1 className="font-serif text-[32px] font-bold text-[#1a1f1c]">
 Financials
 </h1>
 <p className="text-[13px] font-semibold text-gray-400 mt-1">
 Revenue, pending payments, fees, and transaction activity.
 </p>
 </div>
 <button onClick={handleExport} className="flex items-center justify-center gap-2 bg-[#00a877] hover:bg-[#009669] text-white px-5 py-2.5 rounded-lg text-[13px] font-bold transition-all shadow-sm self-end sm:self-auto">
 <Download className="h-4 w-4"/>
 <span>Export Report</span>
 </button>
 </div>

 {/* 4 Stats Grid */}
 <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
 {[
 { label: 'GROSS REVENUE', value: `₹${grossRevenue.toLocaleString('en-IN')}`, icon: IndianRupee },
 { label: 'PENDING REVENUE', value: `₹${pendingRevenue.toLocaleString('en-IN')}`, icon: WalletCards },
 { label: 'PLATFORM FEES', value: `₹${platformFees.toLocaleString('en-IN')}`, icon: ReceiptText },
 { label: 'NET PAYOUT', value: `₹${netPayout.toLocaleString('en-IN')}`, icon: CreditCard },
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
 <div className="p-6 md:p-8 border-b border-gray-100">
 <h3 className="font-serif text-[22px] font-bold text-[#1B2A22]">Recent Transactions</h3>
 <p className="text-[13px] font-semibold text-gray-400 mt-1">Latest booking payments from guests.</p>
 </div>

 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse min-w-[850px]">
 <thead>
 <tr className="bg-[#fafafa] text-[10px] uppercase tracking-wider font-bold text-gray-500 border-b border-gray-100">
 <th className="px-8 py-5">Guest</th>
 <th className="px-6 py-5">Property</th>
 <th className="px-6 py-5">Order ID</th>
 <th className="px-6 py-5">Status</th>
 <th className="px-8 py-5 text-right">Amount</th>
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
 const status = booking.paymentStatus?.toLowerCase() || 'pending';
 const isPaid = status === 'paid' || status === 'confirmed';

 return (
 <tr key={booking._id} className="hover:bg-[#fafafa] transition-colors">
 <td className="px-8 py-5">
 <p className="font-bold text-[#1B2A22] text-[14px]">{booking.userId?.name || 'Guest'}</p>
 <p className="text-[11px] font-bold text-gray-400 mt-0.5">{booking.userId?.email || 'No email'}</p>
 </td>
 <td className="px-6 py-5 font-bold text-[#1B2A22] text-[14px]">{booking.farmId?.title || 'Property'}</td>
 <td className="px-6 py-5 text-gray-400 font-medium">{booking.razorpayOrderId || `order_${booking._id.slice(-10)}`}</td>
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
 </div>

 </div>
 </main>
 );
}
