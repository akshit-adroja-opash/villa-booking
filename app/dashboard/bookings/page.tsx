'use client';
import toast from 'react-hot-toast';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Download, HelpCircle, ArrowRight, Heart, MapPin, Star } from 'lucide-react';

interface Farm {
  _id: string;
  title: string;
  images?: string[];
  pricePerNight: number;
  location?: string;
  rating?: number;
  guests?: number;
  bedrooms?: number;
  acRooms?: number;
  nonAcRooms?: number;
  baths?: number;
  category?: string;
  amenities?: string[];
}

interface Booking {
  _id: string;
  farmId: Farm | null;
  startDate: string;
  endDate: string;
  totalPrice: number;
  paymentStatus: 'Paid' | 'Pending';
  adminConfirmed?: boolean;
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
        const toggleData = await res.json();
        if (toggleData.favorites.includes(farmId)) {
          toast.success('Farmhouse saved to your collection!');
        } else {
          toast.success('Farmhouse removed from your collection.');
        }
        // Refresh favorites list
        const resFavs = await fetch(`/api/users/favorites?userId=${userId}`);
        if (resFavs.ok) {
          const data = await resFavs.json();
          setFavorites(data || []);
        }
      } else {
        toast.error('Failed to toggle favorite.');
      }
    } catch (err) {
      toast.error('Failed to update favorites.');
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
 font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
 color: #1B2A22;
 margin: 20px;
 line-height: 1.6;
 background-color: #FAF9F6;
 }
 .container {
 max-width: 1000px;
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
 font-style:;
 color: #1B2A22;
 opacity: 0.7;
 margin-top: 40px;
 border-top: 1px solid rgba(212, 175, 55, 0.3);
 padding-top: 20px;
 }
  @media print { 
    @page { margin: 0; } 
    body { margin: 0; padding: 1.5cm; } 
    .container { border: none; box-shadow: none; padding: 0; margin: 0 auto; max-width: 1000px; } 
    .footer { margin-top: 30px; } 
  }
  .container { border: none; box-shadow: none; padding: 20px; margin: 0 auto; max-width: 1000px; }
  .footer { margin-top: 30px; }
  </style>
  </head>
  <body><div style="position: absolute; top: 0.8cm; right: 0.8cm; text-align: right; font-size: 10px; font-family: sans-serif; color: #1B2A22; opacity: 0.6;">Enjoy Farm Receipt - ${booking._id.slice(-6).toUpperCase()}</div><div class="container">
 <div class="header">
 <div>
 <div class="logo">
 <img src="${window.location.origin}/logo.png" alt="Enjoy Farm Logo" style="height: 40px; width: 40px; object-fit: contain; margin-right: 12px;" />
 ENJOY FARM
 </div>
 <div style="margin-top: 15px; font-size: 13px; color: #1B2A22; opacity: 0.8; line-height: 1.6; font-family: sans-serif;">
 Enjoy Farm Headquarters<br>
 123 Emerald Valley, Countryside District<br>
 GSTIN: 27AABCA1234D1Z5
 </div>
 </div>
 <div class="title">Booking Receipt</div>
 </div>

 <div class="grid">
 <div class="card">
 <div class="label">Guest Details</div>
 <div class="value"style="font-size: 18px; font-weight: normal; color: #1B2A22; margin-bottom: 8px;">
 ${session?.user?.name || 'Guest'}
 </div>
 <div class="value"style="font-family: sans-serif; font-size: 13px; opacity: 0.8; line-height: 1.6;">
 ${session?.user?.email || ''}<br>
 Ph: +91-9876543210
 </div>
 </div>
 <div class="card">
 <div class="label">Booking Details</div>
 <div class="value"style="font-family: sans-serif; font-size: 13px; line-height: 1.8; opacity: 0.8;">
 <strong>Receipt No:</strong> EST-${booking._id.slice(-6).toUpperCase()}<br>
 <strong>Date Issued:</strong> ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}<br>
 <strong>Status:</strong> Confirmed
 </div>
 </div>
 </div>

 <table class="table">
 <thead>
 <tr>
 <th>Farmhouse</th>
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
 <span style="font-family: sans-serif; font-size: 12px; color: #1B2A22; text-transform: uppercase; letter-spacing: 0.1em; display: inline-block; margin-top: 8px;">${farm.location || 'Location'}</span>
 </td>
 <td style="font-family: sans-serif; white-space: nowrap;">${farm.guests || 2} Persons</td>
 <td style="font-family: sans-serif; white-space: nowrap;">${new Date(booking.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
 <td style="font-family: sans-serif; white-space: nowrap;">${new Date(booking.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
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
 <span>Free</span>
 </div>
 <div class="total-box">
 <span class="total-label">Total Price:</span>
 <span class="total-value">₹${booking.totalPrice.toLocaleString('en-IN')}</span>
 </div>
 </div>

 <div class="footer">
 We look forward to welcoming you. If you need any special arrangements before you arrive, <br>
 please contact us at support@enjoyfarm.com.
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
    <div className="min-h-screen bg-[#FAF9F6] text-[#1B2A22] font-sans flex flex-col">

      {/* Welcome Header Section */}
      <section className="pt-40 pb-20 px-6 max-w-[1280px] mx-auto text-center w-full">
        <h1 className="font-serif text-5xl md:text-7xl font-bold text-[#002E1E] tracking-tight mb-4">
          Welcome, <span className="text-[#00a877]">{session?.user?.name ? session.user.name.split(' ')[0] : 'Guest'}</span>
        </h1>
        <p className="text-gray-500 font-medium text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          Manage your upcoming bookings, review your past bookings, and view your saved farmhouses.
        </p>
      </section>

      <main className="flex-grow mx-auto w-full max-w-[1280px] px-6 pb-32">

        {/* Tab Controls */}
        <section className="flex flex-col gap-10">
          <div className="flex justify-center border-b border-[#1B2A22]/10 gap-5 md:gap-10 overflow-x-auto whitespace-nowrap scrollbar-hide">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`text-sm font-medium pb-4 transition-all whitespace-nowrap ${activeTab === 'upcoming'
                ? 'text-[#1B2A22] border-b-2 border-[#00a877]'
                : 'text-[#1B2A22]/40 hover:text-[#1B2A22]/80'
                }`}
            >
              My Bookings
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`text-sm font-medium pb-4 transition-all whitespace-nowrap ${activeTab === 'past'
                ? 'text-[#1B2A22] border-b-2 border-[#00a877]'
                : 'text-[#1B2A22]/40 hover:text-[#1B2A22]/80'
                }`}
            >
              Past Bookings
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`text-sm font-medium pb-4 transition-all whitespace-nowrap ${activeTab === 'saved'
                ? 'text-[#1B2A22] border-b-2 border-[#00a877]'
                : 'text-[#1B2A22]/40 hover:text-[#1B2A22]/80'
                }`}
            >
              Saved Farmhouses
            </button>
          </div>

          {/* Bookings List */}
          <div className="flex flex-col gap-8">
            {activeTab === 'saved' ? (
              favorites.length === 0 ? (
                <div className="text-center py-24 border border-[#1B2A22]/10 bg-white/50 flex flex-col items-center">
                  <p className="text-sm text-[#1B2A22]/60 font-medium mb-8 font-serif">
                    You have not added any farmhouses to your saved list yet.
                  </p>
                  <Link
                    href="/farms"
                    className="group flex items-center justify-center gap-3 bg-[#00a877] text-white px-8 py-4 text-sm font-semibold rounded-xl shadow-lg shadow-[#00a877]/25 hover:bg-[#009669] hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 active:scale-[0.98]"
                  >
                    <span>Find Farmhouses</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {favorites.map((farm) => {
                    const image = farm.images?.[0] || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=600&q=80';
                    return (
                      <Link
                        href={`/farms/${farm._id}`}
                        key={farm._id}
                        className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-[#1B2A22]/5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] transition-all duration-500"
                      >

                        {/* Photo & Badge Overlay */}
                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                          <img
                            src={image}
                            alt={farm.title}
                            className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-105"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';
                            }}
                          />

                          {/* Rating Badge */}
                          <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm text-[12px] font-bold text-[#1B2A22]">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            {farm.rating || 4.5}
                          </div>

                          {/* Favorite Button */}
                          <button
                            onClick={(e) => { e.preventDefault(); handleToggleFavorite(farm._id, e); }}
                            className="absolute top-4 right-4 text-white drop-shadow-md hover:scale-110 transition-transform active:scale-95 cursor-pointer z-10"
                          >
                            <Heart className={`h-6 w-6 fill-red-500 text-red-500`} />
                          </button>
                        </div>

                        {/* Farmhouse details */}
                        <div className="flex flex-col flex-grow p-5">
                          {/* Location */}
                          <div className="flex items-center gap-1.5 text-xs text-[#1B2A22]/50 font-medium mb-3">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>{farm.location?.startsWith('http') ? 'Map Link Available' : farm.location}</span>
                          </div>

                          {/* Title */}
                          <h3 className="font-sans text-[19px] text-[#1B2A22] font-bold mb-4 leading-snug group-hover:text-[#00a877] transition-colors">
                            {farm.title}
                          </h3>

                          {/* Amenities Tags */}
                          <div className="flex flex-wrap gap-2 mb-5">
                            {farm.amenities && farm.amenities.length > 0 ? (
                              farm.amenities.slice(0, 5).map((amenity: string, index: number) => (
                                <span key={index} className="bg-[#fbf8ff] border border-[#eeedf7] text-[#1B2A22]/70 text-xs font-medium px-2 py-0.5 rounded-md whitespace-nowrap">
                                  {amenity}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-gray-400 italic">No amenities listed</span>
                            )}
                          </div>

                          {/* Divider */}
                          <div className="border-t border-[#eeedf7] my-2"></div>

                          {/* Footer: Price & Guests */}
                          <div className="flex items-center justify-between mt-auto pt-3">
                            <div className="text-[#1B2A22]">
                              <span className="text-lg font-bold">
                                {farm.pricePerNight ? `₹${farm.pricePerNight.toLocaleString('en-IN')}` : 'Price N/A'}
                              </span>
                              <span className="text-sm font-medium text-[#1B2A22]/50 font-medium ml-1">/ night</span>
                            </div>
                            <div className="bg-[#fbf8ff] text-[#1B2A22]/70 text-sm font-medium font-bold px-3 py-1.5 rounded-md border border-[#eeedf7]">
                              {farm.guests || 6} guests
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )
            ) : (
              displayedBookings.length === 0 ? (
                <div className="text-center py-24 border border-[#1B2A22]/10 bg-white/50 flex flex-col items-center">
                  <p className="text-sm text-[#1B2A22]/60 font-medium mb-8 font-serif">
                    You do not have any {activeTab} bookings yet.
                  </p>
                  <Link
                    href="/farms"
                    className="group flex items-center justify-center gap-3 bg-[#00a877] text-white px-8 py-4 text-sm font-semibold rounded-xl shadow-lg shadow-[#00a877]/25 hover:bg-[#009669] hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 active:scale-[0.98]"
                  >
                    <span>Find Farmhouses</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
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
                      </div>

                      {/* Booking metadata */}
                      <div className="p-8 flex flex-col justify-between flex-grow">

                        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
                          <div>
                            <h3 className="font-sans text-[19px] text-[#1B2A22] font-bold mb-3 leading-snug group-hover:text-[#00a877] transition-colors">
                              {farm.title}
                            </h3>
                            <p className="text-sm font-medium font-bold text-[#1B2A22]/60 flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-[#1B2A22]" />
                              {formatDateRange(booking.startDate, booking.endDate)}
                            </p>
                          </div>

                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border shadow-sm backdrop-blur-sm transition-all duration-300 ${booking.adminConfirmed
                              ? 'border-emerald-500/20 text-emerald-700 bg-emerald-50/80'
                              : 'border-amber-500/20 text-amber-700 bg-amber-50/80'
                              }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${booking.adminConfirmed
                                ? 'bg-emerald-500 animate-pulse'
                                : 'bg-amber-500 animate-pulse'
                                }`}
                            />
                            {booking.adminConfirmed ? 'Confirmed' : 'Pending'}
                          </span>
                        </div>

                        {/* Footer Actions Row */}
                        <div className="flex flex-col xl:flex-row xl:items-end justify-between border-t border-[#1B2A22]/10 pt-6 gap-6">
                          <div>
                            <p className="text-sm font-semibold text-[#1B2A22]/50 mb-2">
                              Total Amount
                            </p>
                            <p className="text-2xl font-serif text-[#1B2A22]">
                              ₹{booking.totalPrice.toLocaleString('en-IN')}
                            </p>
                          </div>

                          <div className="flex flex-row flex-wrap items-center gap-3 md:gap-4 w-full xl:w-auto">
                            {booking.adminConfirmed && (
                              <button
                                onClick={() => handleDownloadReceipt(booking)}
                                className="flex items-center justify-center gap-2 px-5 py-3 border border-[#1B2A22]/20 rounded-xl text-sm font-semibold text-[#1B2A22] hover:bg-[#00a877]/5 hover:border-[#00a877] hover:text-[#00a877] shadow-sm hover:shadow active:scale-[0.98] transition-all duration-300 flex-1 sm:flex-none"
                              >
                                <Download className="h-4 w-4" />
                                <span>Receipt</span>
                              </button>
                            )}

                            <Link
                              href="/support"
                              className="flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-[#1B2A22]/60 hover:text-[#1B2A22] rounded-xl hover:bg-[#1B2A22]/5 active:scale-[0.98] transition-all duration-300 flex-1 sm:flex-none"
                            >
                              <HelpCircle className="h-4 w-4" />
                              <span>Support</span>
                            </Link>

                            {booking.paymentStatus !== 'Paid' && (
                              <button className="bg-[#1b2a22] hover:bg-[#25392e] text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-md shadow-[#1b2a22]/10 hover:shadow-lg active:scale-[0.98] transition-all duration-300 w-full sm:w-auto">
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

