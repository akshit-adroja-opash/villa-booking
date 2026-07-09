'use client';
import toast from 'react-hot-toast';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Download, HelpCircle, ArrowRight, Heart, MapPin, Users, Bath, Home } from 'lucide-react';

interface Farm {
 _id: string;
 title: string;
 images?: string[];
 pricePerNight: number;
 location?: string;
 rating?: number;
 guests?: number;
 bedrooms?: number;
 baths?: number;
 category?: string;
}

interface Booking {
 _id: string;
 farmId: Farm | null;
 startDate: string;
 endDate: string;
 totalPrice: number;
 paymentStatus: 'Paid' | 'Pending';
}

export default function BookingsDashboardPage() {
 const { data: session, status } = useSession();
 const router = useRouter();

 const [bookings, setBookings] = useState<Booking[]>([]);
 const [favorites, setFavorites] = useState<Farm[]>([]);
 const [loading, setLoading] = useState(true);
 const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'saved'>('upcoming');

 useEffect(() => {
 if (status === 'loading') return;

 if (status === 'unauthenticated') {
 router.push('/login');
 setLoading(false);
 return;
 }

 if (status === 'authenticated' && session?.user) {
 const fetchDashboardData = async () => {
 try {
 const userId = (session.user as any)?.id;

 if (!userId) {
 console.warn('User ID missing in session');
 setLoading(false);
 return;
 }

 // Fetch bookings and favorites in parallel
 const [resBookings, resFavorites] = await Promise.all([
 fetch(`/api/bookings?userId=${userId}`),
 fetch(`/api/users/favorites?userId=${userId}`)
 ]);

 if (resBookings.ok) {
 const data = await resBookings.json();
 setBookings(data || []);
 }

 if (resFavorites.ok) {
 const data = await resFavorites.json();
 setFavorites(data || []);
 }
 } catch (err) {
 console.error('Error fetching dashboard data:', err);
 } finally {
 setLoading(false);
 }
 };

 fetchDashboardData();
 }
 }, [session, status, router]);

 const handleToggleFavorite = async (farmId: string, e: React.MouseEvent) => {
 e.preventDefault();
 e.stopPropagation();
 if (!session?.user) return;
 try {
 const userId = (session.user as any).id;
 const res = await fetch('/api/users/favorites', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ userId, farmId })
 });
 if (res.ok) {
 // Refresh favorites list
 const resFavs = await fetch(`/api/users/favorites?userId=${userId}`);
 if (resFavs.ok) {
 const data = await resFavs.json();
 setFavorites(data || []);
 }
 }
 } catch (err) {
 console.error('Error toggling favorite on dashboard:', err);
 }
 };

 const formatDateRange = (startStr: string, endStr: string) => {
 try {
 const s = new Date(startStr);
 const e = new Date(endStr);

 return `${s.toLocaleDateString('en-US', {
 month: 'short',
 day: 'numeric',
 })} – ${e.toLocaleDateString('en-US', {
 month: 'short',
 day: 'numeric',
 year: 'numeric',
 })}`;
 } catch {
 return `${startStr} - ${endStr}`;
 }
 };

 if (status === 'loading' || loading) {
 return (
 <div className="flex min-h-screen items-center justify-center bg-[#FAF9F6]">
 <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#1B2A22] border-t-transparent"></div>
 </div>
 );
 }

 if (status === 'unauthenticated') {
 return null;
 }

 const handleDownloadReceipt = (booking: Booking) => {
 const farm = booking.farmId;
 if (!farm) return;

 const printWindow = window.open('', '_blank');
 if (!printWindow) {
 toast.error('Please allow popups to download your receipt.');
 return;
 }

 const receiptHtml = `
 <html>
 <head>
 <title>Enjoy Farm Receipt - ${booking._id.slice(-6).toUpperCase()}</title>
 <style>
 body {
 font-family: 'Georgia', serif;
 color: #1B2A22;
 margin: 20px;
 line-height: 1.6;
 background-color: #FAF9F6;
 }
 .container {
 max-width: 800px;
 margin: 0 auto;
 background: white;
 border: 1px solid rgba(27, 42, 34, 0.1);
 padding: 40px;
 box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
 }
 .header {
 display: flex;
 justify-content: space-between;
 align-items: flex-start;
 border-bottom: 1px solid #1B2A22;
 padding-bottom: 30px;
 margin-bottom: 40px;
 }
 .logo {
 font-size: 28px;
 font-weight: normal;
 text-transform: uppercase;
 letter-spacing: 0.1em;
 color: #1B2A22;
 display: flex;
 align-items: center;
 gap: 8px;
 }
 .title {
 font-size: 14px;
 font-family: sans-serif;
 font-weight: bold;
 color: #1B2A22;
 text-transform: uppercase;
 letter-spacing: 0.2em;
 text-align: right;
 }
 .grid {
 display: grid;
 grid-template-columns: 1fr 1fr;
 gap: 30px;
 margin-bottom: 40px;
 }
 .card {
 border-left: 2px solid #1B2A22;
 padding: 0 20px;
 }
 .label {
 font-family: sans-serif;
 font-size: 10px;
 text-transform: uppercase;
 letter-spacing: 0.2em;
 color: #1B2A22;
 opacity: 0.6;
 font-weight: bold;
 margin-bottom: 15px;
 }
 .value {
 font-size: 15px;
 color: #1B2A22;
 }
 .table {
 width: 100%;
 border-collapse: collapse;
 margin-top: 20px;
 margin-bottom: 40px;
 }
 .table th {
 background-color: #1B2A22;
 color: white;
 padding: 16px;
 font-family: sans-serif;
 font-size: 10px;
 text-transform: uppercase;
 letter-spacing: 0.15em;
 text-align: left;
 }
 .table td {
 padding: 20px 16px;
 font-size: 15px;
 border-bottom: 1px solid rgba(27, 42, 34, 0.1);
 color: #1B2A22;
 vertical-align: top;
 }
 .summary-box {
 width: 350px;
 margin-left: auto;
 margin-top: 10px;
 }
 .summary-row {
 display: flex;
 justify-content: space-between;
 margin-bottom: 12px;
 font-size: 15px;
 color: #1B2A22;
 opacity: 0.8;
 }
 .total-box {
 display: flex;
 justify-content: space-between;
 align-items: center;
 margin-top: 20px;
 padding-top: 20px;
 border-top: 1px solid rgba(27, 42, 34, 0.2);
 }
 .total-label {
 font-size: 16px;
 font-weight: normal;
 color: #1B2A22;
 }
 .total-value {
 font-size: 28px;
 font-weight: normal;
 color: #1B2A22;
 }
 .footer {
 text-align: center;
 font-size: 13px;
 font-style: italic;
 color: #1B2A22;
 opacity: 0.7;
 margin-top: 40px;
 border-top: 1px solid rgba(212, 175, 55, 0.3);
 padding-top: 20px;
 }
 @media print {
 body { margin: 0; padding: 20px; }
 .container { border: none; box-shadow: none; padding: 20px; }
 .footer { margin-top: 30px; }
 }
 </style>
 </head>
 <body>
 <div class="container">
 <div class="header">
 <div>
 <div class="logo">ENJOY FARM</div>
 <div style="margin-top: 15px; font-size: 13px; color: #1B2A22; opacity: 0.8; line-height: 1.6; font-family: sans-serif;">
 Enjoy Farm Headquarters<br>
 123 Emerald Valley, Countryside District<br>
 GSTIN: 27AABCA1234D1Z5
 </div>
 </div>
 <div class="title">Reservation Receipt</div>
 </div>

 <div class="grid">
 <div class="card">
 <div class="label">Esteemed Guest</div>
 <div class="value"style="font-size: 18px; font-weight: normal; color: #1B2A22; margin-bottom: 8px;">
 ${session?.user?.name || 'Valued Patron'}
 </div>
 <div class="value"style="font-family: sans-serif; font-size: 13px; opacity: 0.8; line-height: 1.6;">
 ${session?.user?.email || ''}<br>
 Ph: +91-9876543210
 </div>
 </div>
 <div class="card">
 <div class="label">Reservation Details</div>
 <div class="value"style="font-family: sans-serif; font-size: 13px; line-height: 1.8; opacity: 0.8;">
 <strong>Receipt No:</strong> EST-${booking._id.slice(-6).toUpperCase()}<br>
 <strong>Transaction ID:</strong> TXN-${booking._id.slice(0, 8).toUpperCase()}<br>
 <strong>Payment Method:</strong> Secure Online Transfer<br>
 <strong>Date Issued:</strong> ${new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}<br>
 <strong>Status:</strong> Confirmed & Paid
 </div>
 </div>
 </div>

 <table class="table">
 <thead>
 <tr>
 <th>Sanctuary</th>
 <th>Guests</th>
 <th>Check-In</th>
 <th>Check-Out</th>
 <th style="text-align: right;">Amount</th>
 </tr>
 </thead>
 <tbody>
 <tr>
 <td>
 <strong style="color: #1B2A22; font-size: 18px; font-weight: normal;">${farm.title}</strong><br>
 <span style="font-family: sans-serif; font-size: 12px; color: #1B2A22; text-transform: uppercase; letter-spacing: 0.1em; display: inline-block; margin-top: 8px;">${farm.location || 'Exclusive Retreat'}</span>
 </td>
 <td style="font-family: sans-serif;">${farm.guests || 2} Adults</td>
 <td style="font-family: sans-serif;">${new Date(booking.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
 <td style="font-family: sans-serif;">${new Date(booking.endDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
 <td style="text-align: right; font-weight: bold; font-family: sans-serif;">₹${booking.totalPrice.toLocaleString('en-IN')}</td>
 </tr>
 </tbody>
 </table>

 <div class="summary-box">
 <div class="summary-row"style="font-family: sans-serif;">
 <span>Accommodation:</span>
 <span>₹${booking.totalPrice.toLocaleString('en-IN')}</span>
 </div>
 <div class="summary-row"style="font-family: sans-serif;">
 <span>Support Service:</span>
 <span>Complimentary</span>
 </div>
 <div class="total-box">
 <span class="total-label">Total Remitted:</span>
 <span class="total-value">₹${booking.totalPrice.toLocaleString('en-IN')}</span>
 </div>
 </div>

 <div class="footer">
 We look forward to welcoming you. Should you require bespoke arrangements prior to arrival, <br>
 please contact our concierge desk at concierge@theestate.com.
 </div>
 </div>
 <script>
 window.onload = function() {
 window.print();
 setTimeout(function() { window.close(); }, 800);
 }
 </script>
 </body>
 </html>
 `;

 printWindow.document.write(receiptHtml);
 printWindow.document.close();
 };

 // Filter based on selected tab (upcoming vs past stays)
 const displayedBookings = bookings.filter((booking) => {
 if (activeTab === 'upcoming') {
 return new Date(booking.endDate) >= new Date();
 }
 if (activeTab === 'past') {
 return new Date(booking.endDate) < new Date();
 }
 return false; // saved is mock-empty
 });

 return (
 <div className="min-h-screen bg-[#FAF9F6] text-[#1B2A22] font-sans flex flex-col pt-32">
 <main className="flex-grow mx-auto w-full max-w-[1280px] px-6 py-12 md:py-20 md:px-16">
 
 {/* Welcome Header */}
 <header className="mb-16">
 <span className="text-sm font-medium font-bold text-[#1B2A22] block mb-4">
 Bookings Dashboard
 </span>
 <h1 className="font-serif text-4xl md:text-5xl font-normal text-[#1B2A22] mt-3">
 Welcome, {session?.user?.name || 'Guest'}
 </h1>
 <p className="text-sm text-[#1B2A22]/70 font-medium mt-4 max-w-xl font-serif italic">
 Manage your upcoming bookings, review your past bookings, and view your saved properties.
 </p>
 </header>

 {/* Tab Controls */}
 <section className="flex flex-col gap-10">
 <div className="flex border-b border-[#1B2A22]/10 gap-10">
 <button 
 onClick={() => setActiveTab('upcoming')}
 className={`text-sm font-medium pb-4 transition-all ${
 activeTab === 'upcoming' 
 ? 'text-[#1B2A22] border-b-2 border-[#1B2A22]' 
 : 'text-[#1B2A22]/40 hover:text-[#1B2A22]/80'
 }`}
 >
 Upcoming
 </button>
 <button 
 onClick={() => setActiveTab('past')}
 className={`text-sm font-medium pb-4 transition-all ${
 activeTab === 'past' 
 ? 'text-[#1B2A22] border-b-2 border-[#1B2A22]' 
 : 'text-[#1B2A22]/40 hover:text-[#1B2A22]/80'
 }`}
 >
 Past Bookings
 </button>
 <button 
 onClick={() => setActiveTab('saved')}
 className={`text-sm font-medium pb-4 transition-all ${
 activeTab === 'saved' 
 ? 'text-[#1B2A22] border-b-2 border-[#1B2A22]' 
 : 'text-[#1B2A22]/40 hover:text-[#1B2A22]/80'
 }`}
 >
 Saved Properties
 </button>
 </div>

 {/* Bookings List */}
 <div className="flex flex-col gap-8">
 {activeTab === 'saved' ? (
 favorites.length === 0 ? (
 <div className="text-center py-24 border border-[#1B2A22]/10 bg-white/50 flex flex-col items-center">
 <p className="text-sm text-[#1B2A22]/60 font-medium mb-8 font-serif italic">
 You have not added any properties to your saved list yet.
 </p>
 <Link
 href="/farms"
 className="flex items-center justify-center gap-3 bg-[#1B2A22] text-white px-8 py-4 text-sm font-medium hover:bg-[#2c4236] transition-colors"
 >
 <span>Find Properties</span>
 <ArrowRight className="h-3.5 w-3.5"/>
 </Link>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
 {favorites.map((farm) => {
 const image = farm.images?.[0] || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=600&q=80';
 return (
 <div
 key={farm._id}
 className="bg-white border border-[#1B2A22]/10 flex flex-col h-full relative group"
 >
 {/* Image Area */}
 <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
 <img
 src={image}
 alt={farm.title}
 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.5s]"
 />
 {/* Heart Button */}
 <button
 onClick={(e) => handleToggleFavorite(farm._id, e)}
 className="absolute top-4 right-4 p-2.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white hover:text-red-500 transition-all z-10"
 aria-label="Remove from saved stays"
 >
 <Heart className="h-4 w-4 fill-red-500 text-red-500"/>
 </button>
 </div>

 {/* Card Details */}
 <div className="p-6 flex flex-col flex-grow gap-4">
 <div>
 <p className="flex items-center gap-1.5 text-sm font-medium font-bold text-[#1B2A22] mb-2">
 <MapPin className="h-3 w-3"/>
 {farm.location || 'Exclusive Location'}
 </p>
 <h3 className="font-serif text-xl text-[#1B2A22] line-clamp-1 group-hover:opacity-70 transition-opacity">
 {farm.title}
 </h3>
 </div>

 <div className="flex gap-4 text-sm font-medium font-bold text-[#1B2A22]/50 pb-4 border-b border-[#1B2A22]/5">
 <span className="flex items-center gap-1.5">
 <Users className="h-3.5 w-3.5 text-[#1B2A22]"/>
 {farm.guests || 6}
 </span>
 <span className="flex items-center gap-1.5">
 <Home className="h-3.5 w-3.5 text-[#1B2A22]"/>
 {farm.bedrooms || 3}
 </span>
 <span className="flex items-center gap-1.5">
 <Bath className="h-3.5 w-3.5 text-[#1B2A22]"/>
 {farm.baths || 2}
 </span>
 </div>

 <div className="mt-auto flex items-center justify-between pt-2">
 <div>
 <p className="font-serif text-lg text-[#1B2A22]">
 ₹{farm.pricePerNight?.toLocaleString('en-IN')}
 <span className="font-sans text-sm font-medium font-bold text-[#1B2A22]/50 ml-1">/ night</span>
 </p>
 </div>
 <Link
 href={`/farms/${farm._id}`}
 className="text-sm font-medium font-bold text-[#1B2A22] hover:text-[#1B2A22] transition-colors"
 >
 Reserve
 </Link>
 </div>
 </div>
 </div>
 );
 })}
 </div>
 )
 ) : (
 displayedBookings.length === 0 ? (
 <div className="text-center py-24 border border-[#1B2A22]/10 bg-white/50 flex flex-col items-center">
 <p className="text-sm text-[#1B2A22]/60 font-medium mb-8 font-serif italic">
 You do not have any {activeTab} bookings yet.
 </p>
 <Link
 href="/farms"
 className="flex items-center justify-center gap-3 bg-[#1B2A22] text-white px-8 py-4 text-sm font-medium hover:bg-[#2c4236] transition-colors"
 >
 <span>Find Properties</span>
 <ArrowRight className="h-3.5 w-3.5"/>
 </Link>
 </div>
 ) : (
 displayedBookings.map((booking) => {
 const farm = booking.farmId;
 if (!farm) return null;

 const image =
 farm.images && farm.images.length > 0
 ? farm.images[0]
 : 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=600&q=80';

 return (
 <article
 key={booking._id}
 className="border border-[#1B2A22]/10 bg-white flex flex-col md:flex-row group"
 >
 {/* Stay Image */}
 <div className="md:w-[300px] h-56 md:h-auto overflow-hidden relative">
 <img
 src={image}
 alt={farm.title}
 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s]"
 />
 <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md text-white text-sm font-medium px-3 py-1.5 border border-white/20">
 Ref: {booking._id.slice(-6)}
 </div>
 </div>

 {/* Booking metadata */}
 <div className="p-8 flex flex-col justify-between flex-grow">
 
 <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
 <div>
 <h3 className="font-serif text-2xl text-[#1B2A22] mb-3">
 {farm.title}
 </h3>
 <p className="text-sm font-medium font-bold text-[#1B2A22]/60 flex items-center gap-2">
 <Calendar className="h-4 w-4 text-[#1B2A22]"/>
 {formatDateRange(booking.startDate, booking.endDate)}
 </p>
 </div>

 <span
 className={`inline-block px-3 py-1.5 text-sm font-medium border ${
 booking.paymentStatus === 'Paid'
 ? 'border-[#00a877]/20 text-[#00a877] bg-[#e6f4ea]'
 : 'border-[#1B2A22]/50 text-[#1B2A22] bg-[#1B2A22]/5'
 }`}
 >
 {booking.paymentStatus === 'Paid' ? 'Confirmed' : 'Pending'}
 </span>
 </div>

 {/* Footer Actions Row */}
 <div className="flex flex-col sm:flex-row sm:items-end justify-between border-t border-[#1B2A22]/10 pt-6 gap-6">
 <div>
 <p className="text-sm font-medium font-bold text-[#1B2A22]/50 mb-2">
 Total Amount
 </p>
 <p className="text-2xl font-serif text-[#1B2A22]">
 ₹{booking.totalPrice.toLocaleString('en-IN')}
 </p>
 </div>

 <div className="flex flex-wrap gap-4 self-start sm:self-auto">
 <button
 onClick={() => handleDownloadReceipt(booking)}
 disabled={booking.paymentStatus !== 'Paid'}
 className="flex items-center gap-2 px-5 py-3 border border-[#1B2A22] text-sm font-medium text-[#1B2A22] hover:bg-[#1B2A22] hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#1B2A22] transition-colors"
 >
 <Download className="h-3.5 w-3.5"/>
 <span>Receipt</span>
 </button>

 <Link 
 href="/support"
 className="flex items-center gap-2 px-5 py-3 text-sm font-medium text-[#1B2A22]/60 hover:text-[#1B2A22] transition-colors"
 >
 <HelpCircle className="h-3.5 w-3.5"/>
 <span>Support</span>
 </Link>

 {booking.paymentStatus !== 'Paid' && (
 <button className="bg-[#1B2A22] hover:bg-[#c29f31] text-white px-6 py-3 text-sm font-medium transition-colors">
 Make Payment
 </button>
 )}
 </div>
 </div>

 </div>
 </article>
 );
 })
 )
 )}
 </div>
 </section>
 </main>
 </div>
 );
}
