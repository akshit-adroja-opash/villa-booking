'use client';

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
      <div className="flex min-h-screen items-center justify-center bg-[#fdfbf7]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#00a877] border-t-transparent"></div>
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
      alert('Please allow popups to download your receipt.');
      return;
    }

    const receiptHtml = `
      <html>
        <head>
          <title>AgriStay Receipt - ${booking._id.slice(-6).toUpperCase()}</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              color: #1a1b22;
              margin: 40px;
              line-height: 1.6;
              background-color: #fdfbf7;
            }
            .container {
              max-width: 700px;
              margin: 0 auto;
              background: white;
              border: 1px solid #bfc9c3;
              border-radius: 16px;
              padding: 40px;
              box-shadow: 0 4px 12px rgba(6, 78, 59, 0.05);
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 2px solid #00a877;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #003527;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .title {
              font-size: 18px;
              font-weight: bold;
              color: #707974;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
            .grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 30px;
            }
            .card {
              border: 1px solid rgba(191, 201, 195, 0.4);
              border-radius: 12px;
              padding: 20px;
              background-color: #fcfbfa;
            }
            .label {
              font-size: 10px;
              text-transform: uppercase;
              letter-spacing: 0.1em;
              color: #707974;
              font-weight: bold;
              margin-bottom: 6px;
            }
            .value {
              font-size: 14px;
              font-weight: 600;
              color: #1a1b22;
            }
            .table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
              margin-bottom: 30px;
            }
            .table th {
              background-color: #e6f4ea;
              color: #0f766e;
              padding: 12px 16px;
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              text-align: left;
              border-bottom: 1px solid rgba(167, 243, 208, 0.5);
            }
            .table td {
              padding: 16px;
              font-size: 14px;
              border-bottom: 1px solid rgba(191, 201, 195, 0.25);
              color: #404944;
              font-weight: 500;
            }
            .total-box {
              display: flex;
              justify-content: flex-end;
              align-items: center;
              gap: 15px;
              margin-top: 20px;
              padding-top: 20px;
              border-top: 1px solid rgba(191, 201, 195, 0.4);
            }
            .total-label {
              font-size: 14px;
              font-weight: bold;
              color: #707974;
            }
            .total-value {
              font-size: 24px;
              font-weight: bold;
              color: #003527;
            }
            .footer {
              text-align: center;
              font-size: 12px;
              color: #707974;
              margin-top: 40px;
              border-top: 1px solid rgba(191, 201, 195, 0.3);
              padding-top: 20px;
              font-weight: 500;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🏡 AgriStay</div>
              <div class="title">Official Receipt</div>
            </div>

            <div class="grid">
              <div class="card">
                <div class="label">Billed To</div>
                <div class="value" style="font-size: 16px; font-weight: 700; color: #003527; margin-bottom: 4px;">
                  ${session?.user?.name || 'Valued Guest'}
                </div>
                <div class="value" style="font-weight: 500; color: #707974;">
                  ${session?.user?.email || ''}
                </div>
              </div>
              <div class="card">
                <div class="label">Booking details</div>
                <div class="value"><strong>Invoice No:</strong> AGR-${booking._id.slice(-6).toUpperCase()}</div>
                <div class="value"><strong>Status:</strong> Paid / Confirmed</div>
                <div class="value"><strong>Date Issued:</strong> ${new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
              </div>
            </div>

            <table class="table">
              <thead>
                <tr>
                  <th>Stay Description</th>
                  <th>Check-In</th>
                  <th>Check-Out</th>
                  <th style="text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>${farm.title}</strong><br><span style="font-size: 11px; color: #707974;">Farmhouse Eco-Stay Retreat</span></td>
                  <td>${new Date(booking.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td>${new Date(booking.endDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td style="text-align: right; font-weight: bold; color: #1a1b22;">₹${booking.totalPrice.toLocaleString('en-IN')}</td>
                </tr>
              </tbody>
            </table>

            <div class="total-box">
              <span class="total-label">Total Amount Paid:</span>
              <span class="total-value">₹${booking.totalPrice.toLocaleString('en-IN')}</span>
            </div>

            <div class="footer">
              Thank you for choosing AgriStay. Your booking supports local eco-tourism and sustainable farming.<br>
              Need assistance? Email us at hello@agristay.com or call our hotline.
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
    <div className="min-h-screen bg-[#fdfbf7] text-[#1a1b22] font-sans flex flex-col pt-20">
      <main className="flex-grow mx-auto w-full max-w-[1280px] px-6 py-12 md:py-20 md:px-16">
        
        {/* Welcome Header */}
        <header className="mb-12">
          <span className="text-[10px] font-bold text-[#00a877] bg-[#e6f4ea] px-2.5 py-1 rounded-full uppercase tracking-wider">
            Guest Area
          </span>
          <h1 className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-[#1a1b22] mt-3">
            Welcome back, {session?.user?.name || 'Guest'}
          </h1>
          <p className="text-sm text-[#707974] font-medium mt-2 max-w-xl">
            Manage your upcoming retreats, payments, and review past journeys.
          </p>
        </header>

        {/* Tab Controls */}
        <section className="flex flex-col gap-8">
          <div className="flex border-b border-[#bfc9c3]/20 gap-8">
            <button 
              onClick={() => setActiveTab('upcoming')}
              className={`text-sm font-bold pb-4 transition-all ${
                activeTab === 'upcoming' 
                  ? 'text-[#00a877] border-b-2 border-[#00a877]' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Upcoming Stays
            </button>
            <button 
              onClick={() => setActiveTab('past')}
              className={`text-sm font-bold pb-4 transition-all ${
                activeTab === 'past' 
                  ? 'text-[#00a877] border-b-2 border-[#00a877]' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Past Trips
            </button>
            <button 
              onClick={() => setActiveTab('saved')}
              className={`text-sm font-bold pb-4 transition-all ${
                activeTab === 'saved' 
                  ? 'text-[#00a877] border-b-2 border-[#00a877]' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Saved / Favorites
            </button>
          </div>

          {/* Bookings List */}
          <div className="flex flex-col gap-6 mt-2">
            {activeTab === 'saved' ? (
              favorites.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-[#bfc9c3]/40 rounded-2xl bg-white shadow-sm flex flex-col items-center">
                  <p className="text-sm text-[#707974] font-semibold mb-6">
                    You do not have any saved farmhouses yet.
                  </p>
                  <Link
                    href="/farms"
                    className="flex items-center justify-center gap-2 bg-[#00a877] hover:bg-[#009669] text-white px-6 py-3.5 rounded-xl text-sm font-bold shadow-md shadow-[#00a877]/10 transition-all active:scale-[0.98]"
                  >
                    <span>Explore Farmhouses</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {favorites.map((farm) => {
                    const image = farm.images?.[0] || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=600&q=80';
                    return (
                      <div
                        key={farm._id}
                        className="bg-white rounded-2xl overflow-hidden border border-[#bfc9c3]/20 shadow-sm hover:shadow-md transition-all flex flex-col h-full relative group"
                      >
                        {/* Image Area */}
                        <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                          <img
                            src={image}
                            alt={farm.title}
                            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                          />
                          {/* Heart Button */}
                          <button
                            onClick={(e) => handleToggleFavorite(farm._id, e)}
                            className="absolute top-4 right-4 p-2.5 rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:bg-white transition-colors z-10"
                            aria-label="Remove from saved stays"
                          >
                            <Heart className="h-4.5 w-4.5 fill-red-500 text-red-500" />
                          </button>
                          {/* Category */}
                          {farm.category && (
                            <span className="absolute bottom-4 left-4 inline-block px-2.5 py-0.5 text-[10px] font-bold bg-[#003527]/80 backdrop-blur-sm text-white rounded-full uppercase tracking-wider">
                              {farm.category}
                            </span>
                          )}
                        </div>

                        {/* Card Details */}
                        <div className="p-6 flex flex-col flex-grow gap-4">
                          <div>
                            <div className="flex justify-between items-start gap-2">
                              <h3 className="font-serif text-xl font-bold text-[#1a1b22] line-clamp-1">
                                {farm.title}
                              </h3>
                            </div>
                            <p className="mt-1 flex items-center gap-1 text-xs font-bold text-gray-400 uppercase tracking-wide">
                              <MapPin className="h-3.5 w-3.5 text-[#00a877]" />
                              {farm.location || 'Location unavailable'}
                            </p>
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-[11px] font-bold text-gray-500">
                            <span className="flex items-center justify-center gap-1 rounded-xl bg-gray-50 px-2 py-2">
                              <Users className="h-4 w-4 text-gray-400" />
                              {farm.guests || 6} guests
                            </span>
                            <span className="flex items-center justify-center gap-1 rounded-xl bg-gray-50 px-2 py-2">
                              <Home className="h-4 w-4 text-gray-400" />
                              {farm.bedrooms || 3} beds
                            </span>
                            <span className="flex items-center justify-center gap-1 rounded-xl bg-gray-50 px-2 py-2">
                              <Bath className="h-4 w-4 text-gray-400" />
                              {farm.baths || 2} baths
                            </span>
                          </div>

                          <div className="mt-auto pt-4 border-t border-[#bfc9c3]/15 flex items-center justify-between gap-4">
                            <div>
                              <p className="font-serif text-lg font-bold text-[#003527]">
                                ₹{farm.pricePerNight?.toLocaleString('en-IN')}
                                <span className="font-sans text-xs font-semibold text-gray-400"> / night</span>
                              </p>
                            </div>
                            <Link
                              href={`/farms/${farm._id}`}
                              className="rounded-xl border border-[#00a877] px-4 py-2 text-xs font-bold text-[#00a877] hover:bg-[#e6f4ea]/30 transition-colors"
                            >
                              View Detail
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
                <div className="text-center py-16 border border-dashed border-[#bfc9c3]/40 rounded-2xl bg-white shadow-sm flex flex-col items-center">
                  <p className="text-sm text-[#707974] font-semibold mb-6">
                    You do not have any {activeTab} bookings yet.
                  </p>
                  <Link
                    href="/farms"
                    className="flex items-center justify-center gap-2 bg-[#00a877] hover:bg-[#009669] text-white px-6 py-3.5 rounded-xl text-sm font-bold shadow-md shadow-[#00a877]/10 transition-all active:scale-[0.98]"
                  >
                    <span>Explore Farmhouses</span>
                    <ArrowRight className="h-4 w-4" />
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
                      className="rounded-2xl border border-[#bfc9c3]/20 bg-white flex flex-col md:flex-row overflow-hidden shadow-sm shadow-[#064e3b]/3 hover:shadow-md transition-all"
                    >
                      {/* Stay Image */}
                      <div className="md:w-[240px] h-48 md:h-auto overflow-hidden">
                        <img
                          src={image}
                          alt={farm.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                      </div>

                      {/* Booking metadata */}
                      <div className="p-6 flex flex-col justify-between flex-grow gap-6">
                        
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <span className="inline-block px-2.5 py-0.5 text-[9px] font-bold bg-[#e6f4ea] text-[#0f766e] border border-[#a7f3d0]/30 rounded-full lowercase mb-2">
                              Stay ID: {booking._id.slice(-6)}
                            </span>
                            <h3 className="font-serif text-xl font-bold text-[#1a1b22]">
                              {farm.title}
                            </h3>
                            <p className="text-xs font-bold text-gray-500 mt-2 flex items-center gap-1.5">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              {formatDateRange(booking.startDate, booking.endDate)}
                            </p>
                          </div>

                          <span
                            className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full lowercase ${
                              booking.paymentStatus === 'Paid'
                                ? 'bg-[#e6f4ea] text-[#0f766e]'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {booking.paymentStatus === 'Paid' ? 'confirmed' : 'pending'}
                          </span>
                        </div>

                        {/* Footer Actions Row */}
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-t border-[#bfc9c3]/15 pt-4 gap-4">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#707974]">
                              Total Payment
                            </p>
                            <p className="text-2xl font-serif font-bold text-[#003527] mt-0.5">
                              ₹{booking.totalPrice.toLocaleString('en-IN')}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2.5 self-start sm:self-auto">
                            <button
                              onClick={() => handleDownloadReceipt(booking)}
                              disabled={booking.paymentStatus !== 'Paid'}
                              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                            >
                              <Download className="h-3.5 w-3.5" />
                              <span>Receipt</span>
                            </button>

                            <Link 
                              href="/support"
                              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <HelpCircle className="h-3.5 w-3.5" />
                              <span>Support</span>
                            </Link>

                            {booking.paymentStatus !== 'Paid' && (
                              <button className="bg-[#00a877] hover:bg-[#009669] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-[#00a877]/10 transition-colors">
                                Pay Now
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