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

 const paidBookings = bookings.filter((booking) => booking.paymentStatus === 'Paid');
 const pendingBookings = bookings.filter((booking) => booking.paymentStatus !== 'Paid');
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

 const recentTransactions = useMemo(() => {
 return [...bookings]
 .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
 .slice(0, 8);
 }, [bookings]);

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
 Revenue
 </h1>
 <p className="mt-2 text-sm font-medium text-[#1B2A22]/60">
 Revenue, pending payments & transaction activity
 </p>
 </div>
 <button onClick={handleExport} className="flex items-center justify-center gap-2 bg-[#00a877] hover:bg-[#009669] text-white px-5 py-3 text-sm font-medium transition-colors self-start sm:self-auto">
 <Download className="h-4 w-4"/>
 <span>Export Report</span>
 </button>
 </div>

 {/* 4 Stats Grid */}
 <div className="grid gap-6 md:grid-cols-4">
 {[
 { label: 'Gross Revenue', value: `₹${grossRevenue.toLocaleString('en-IN')}`, icon: IndianRupee },
 { label: 'Pending Revenue', value: `₹${pendingRevenue.toLocaleString('en-IN')}`, icon: WalletCards },
 { label: 'Platform Fees', value: `₹${platformFees.toLocaleString('en-IN')}`, icon: ReceiptText },
 { label: 'Net Payout', value: `₹${netPayout.toLocaleString('en-IN')}`, icon: CreditCard },
 ].map((stat) => (
 <div key={stat.label} className="bg-white border border-[#1B2A22]/10 p-6">
 <div className="flex items-start justify-between">
 <div>
 <p className="text-sm font-medium text-[#1B2A22]/60 mb-2">{stat.label}</p>
 <p className="font-serif text-2xl text-[#1B2A22]">{stat.value}</p>
 </div>
 <div className="bg-[#1B2A22]/10 p-2 text-[#1B2A22]">
 <stat.icon className="h-5 w-5"/>
 </div>
 </div>
 </div>
 ))}
 </div>

 {/* Transaction History Section */}
 <section className="bg-white border border-[#1B2A22]/10">
 <div className="p-6 border-b border-[#1B2A22]/10">
 <h3 className="font-serif text-xl font-normal text-[#1B2A22]">Recent Transactions</h3>
 <p className="text-sm font-medium text-[#1B2A22]/50 font-bold mt-2">Latest booking payments from guests</p>
 </div>

 <div className="overflow-x-auto">
 <table className="w-full min-w-[820px] text-left border-collapse">
 <thead>
 <tr className="border-b border-[#1B2A22]/10 bg-[#FAF9F6] text-sm font-medium font-bold text-[#1B2A22]/50">
 <th className="px-6 py-5">Guest</th>
 <th className="px-6 py-5">Property</th>
 <th className="px-6 py-5">Order ID</th>
 <th className="px-6 py-5">Status</th>
 <th className="px-6 py-5 text-right">Amount</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-[#1B2A22]/5 text-[13px] font-semibold text-[#1B2A22]">
 {recentTransactions.map((booking) => (
 <tr key={booking._id} className="hover:bg-[#FAF9F6]/50 transition-colors">
 <td className="px-6 py-5">
 <p className="font-serif text-base text-[#1B2A22]">{booking.userId?.name || 'Guest'}</p>
 <p className="text-sm font-medium text-[#1B2A22]/50 mt-0.5">{booking.userId?.email || 'No email'}</p>
 </td>
 <td className="px-6 py-5 text-[#1B2A22]/70 font-serif text-base">{booking.farmId?.title || 'Property'}</td>
 <td className="px-6 py-5 text-sm font-medium text-[#1B2A22]/40">{booking.razorpayOrderId || booking._id.slice(-10)}</td>
 <td className="px-6 py-5">
 <span className={`inline-block px-3 py-1 text-sm font-medium border ${
 booking.paymentStatus === 'Paid'
 ? 'bg-[#e6f4ea] text-[#00a877] border-[#00a877]/20'
 : 'bg-transparent text-[#1B2A22] border-[#1B2A22]'
 }`}>
 {booking.paymentStatus === 'Paid' ? 'Paid' : 'Pending'}
 </span>
 </td>
 <td className="px-6 py-5 text-right font-serif text-lg text-[#1B2A22]">₹{(booking.totalPrice || 0).toLocaleString('en-IN')}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </section>

 </div>
 </main>
 );
}
