'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  MapPin, 
  Grid, 
  Wifi, 
  Snowflake, 
  Flame, 
  Trees, 
  ChefHat, 
  Waves, 
  ShieldCheck, 
  Loader2,
  Compass,
  Sparkles,
  Users,
  Bed,
  X
} from 'lucide-react';

interface FarmDetails {
  _id?: string;
  id?: string;
  title: string;
  location: string;
  pricePerNight: number;
  description: string;
  images: string[];
  amenities: string[];
  guests: number;
  bedrooms: number;
  baths: number;
  rating: number;
  reviewsCount?: number;
  acres?: number;
}

const MOCK_FARMS_DETAILS: Record<string, FarmDetails> = {
  '1': {
    id: '1',
    title: 'Sunrise Valley Farm',
    location: 'Solan, Himachal Pradesh',
    pricePerNight: 3500,
    images: [
      'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1543872084-c7bd3822856f?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=600&q=80'
    ],
    description: 'A quiet valley getaway surrounded by lush hills. Traditional architecture meets contemporary amenities. Enjoy organic farm-to-table meals, bonfire nights under stars, and private guided trails.',
    amenities: ['WiFi', 'Swimming Pool', 'Garden', 'Kitchen', 'Parking'],
    rating: 4.8,
    reviewsCount: 124,
    guests: 12,
    bedrooms: 4,
    baths: 4,
    acres: 5
  },
  '2': {
    id: '2',
    title: 'Hilltop Haven',
    location: 'Manali, Himachal Pradesh',
    pricePerNight: 5500,
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1543872084-c7bd3822856f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80'
    ],
    description: 'Luxury snow-capped peaks cottage featuring an indoor fireplace, heated pool, spacious wood-paneled bedrooms, and local trekking guides. Breathtaking panoramas guaranteed.',
    amenities: ['WiFi', 'Hot Tub', 'Fireplace', 'Mountain View', 'Kitchen'],
    rating: 4.9,
    reviewsCount: 203,
    guests: 16,
    bedrooms: 6,
    baths: 5,
    acres: 8
  },
  '3': {
    id: '3',
    title: 'Coastal Retreat',
    location: 'Goa, Goa',
    pricePerNight: 6000,
    images: [
      'https://images.unsplash.com/photo-1540206395-68808572332f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1543872084-c7bd3822856f?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=600&q=80'
    ],
    description: 'A modern coastal sanctuary just steps from pristine beaches. Private decks, landscaped palm gardens, and beach access pathways offer absolute seclusion.',
    amenities: ['WiFi', 'Beach Access', 'Swimming Pool', 'Ocean View', 'AC'],
    rating: 4.5,
    reviewsCount: 67,
    guests: 14,
    bedrooms: 5,
    baths: 4,
    acres: 4
  }
};

const AMENITY_ICONS: Record<string, React.ComponentType<any>> = {
  'WiFi': Wifi,
  'Swimming Pool': Waves,
  'Kitchen': ChefHat,
  'Hot Tub': Sparkles,
  'Fireplace': Flame,
  'Air Conditioning': Snowflake,
  'AC': Snowflake,
  'Garden': Trees,
  'Tea Tasting': Compass,
  'Plantation Walk': Trees,
  'Yoga Deck': Sparkles,
  'River View': Waves,
  'Fruit Picking': Trees,
  'Beach Access': Compass
};

export default function FarmDetailPage() {
  const { id } = useParams() || {};
  const { data: session } = useSession() || {};
  const router = useRouter();

  const [farm, setFarm] = useState<FarmDetails | null>(null);
  const [loading, setLoading] = useState(true);

  // Booking states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [guestSelection, setGuestSelection] = useState(0);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [existingBookings, setExistingBookings] = useState<any[]>([]);
  const [showAllPhotosModal, setShowAllPhotosModal] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function getFarm() {
      setLoading(true);
      try {
        const res = await fetch(`/api/farms/${id}`);
        if (res.ok) {
          const data = await res.json();
          const cleanRating = data.rating || 4.7;
          const cleanAcres = data.acres || Math.round((data.pricePerNight / 1000) + (data.bedrooms || 1));
          
          setFarm({
            _id: data._id,
            title: data.title,
            location: data.location,
            pricePerNight: data.pricePerNight,
            description: data.description,
            images: data.images && data.images.length > 0 ? data.images : [
              'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1200&q=80'
            ],
            amenities: data.amenities && data.amenities.length > 0 ? data.amenities : ['WiFi', 'Pool'],
            guests: data.guests || 6,
            bedrooms: data.bedrooms || 3,
            baths: data.baths || 2,
            rating: cleanRating,
            reviewsCount: data.reviewsCount || Math.round(cleanRating * 30 + (data.pricePerNight % 100)),
            acres: cleanAcres
          });
        } else {
          // Fallback to MOCK
          if (MOCK_FARMS_DETAILS[id as string]) {
            setFarm(MOCK_FARMS_DETAILS[id as string]);
          } else {
            // Find in mock list or default
            setFarm(MOCK_FARMS_DETAILS['1']);
          }
        }
      } catch (err) {
        console.error('Error fetching farm details:', err);
        if (MOCK_FARMS_DETAILS[id as string]) {
          setFarm(MOCK_FARMS_DETAILS[id as string]);
        } else {
          setFarm(MOCK_FARMS_DETAILS['1']);
        }
      } finally {
        setLoading(false);
      }
    }

    getFarm();
  }, [id]);

  useEffect(() => {
    if (!farm) return;

    async function fetchFarmBookings() {
      try {
        const farmId = farm?._id || (farm as any)?.id;
        if (!farmId) return;
        const res = await fetch(`/api/bookings?farmId=${farmId}`);
        if (res.ok) {
          const data = await res.json();
          setExistingBookings(data || []);
        }
      } catch (err) {
        console.error('Error fetching bookings for this farm:', err);
      }
    }

    fetchFarmBookings();
  }, [farm]);

  useEffect(() => {
    if (showAllPhotosModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showAllPhotosModal]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowAllPhotosModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fdfbf7]">
        <Loader2 className="h-10 w-10 animate-spin text-[#003527]" />
      </div>
    );
  }

  if (!farm) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fdfbf7]">
        <p className="text-lg font-semibold text-[#003527]">Retreat stay not found.</p>
      </div>
    );
  }

  // Calculate pricing breakdown
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;

  const hasValidDates = start && end && !isNaN(start.getTime()) && !isNaN(end.getTime()) && start < end;
  const isInvalidDates = start && end && (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end);

  const hasConflict = startDate && endDate && !isInvalidDates && existingBookings.some((b: any) => {
    if (b.paymentStatus === 'Failed') return false;
    const bStart = new Date(b.startDate).getTime();
    const bEnd = new Date(b.endDate).getTime();
    const sTime = new Date(startDate).getTime();
    const eTime = new Date(endDate).getTime();
    return sTime < bEnd && eTime > bStart;
  });

  const diffTime = hasValidDates ? Math.abs(end!.getTime() - start!.getTime()) : 0;
  const diffNights = hasValidDates ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) : 0;
  const accommodationTotal = farm.pricePerNight * diffNights;
  const cleaningFee = diffNights > 0 ? Math.round(accommodationTotal * 0.05) : 0;
  const serviceFee = diffNights > 0 ? Math.round(accommodationTotal * 0.08) : 0;
  const grandTotal = accommodationTotal + cleaningFee + serviceFee;

  const priceBreakdown = [
    { label: `₹${farm.pricePerNight.toLocaleString('en-IN')} x ${diffNights} night${diffNights > 1 ? 's' : ''}`, value: accommodationTotal },
    { label: 'Sanitary & Cleaning fee', value: cleaningFee },
    { label: 'Service & Booking fee', value: serviceFee }
  ];

  const handleBooking = async () => {
    if (!session?.user) {
      alert('Please sign in to complete your booking.');
      router.push('/login');
      return;
    }

    if (!startDate || !endDate) {
      alert('Please select check-in and checkout dates.');
      return;
    }

    if (guestSelection === 0) {
      alert('Please select the number of guests.');
      return;
    }

    if (isInvalidDates) {
      alert('Checkout date must be after check-in date.');
      return;
    }

    if (hasConflict) {
      alert('This farmhouse is already booked for the selected dates. Please choose different dates.');
      return;
    }

    setBookingLoading(true);
    try {
      let finalFarmId = farm._id || farm.id;

      // Register mock farms on the fly if needed
      if (['1', '2', '3'].includes(finalFarmId as string)) {
        const checkRes = await fetch(`/api/farms`);
        if (checkRes.ok) {
          const list = await checkRes.json();
          const existing = list.find((item: any) => item.title === farm.title);
          if (existing) {
            finalFarmId = existing._id;
          } else {
            const createRes = await fetch('/api/farms', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                title: farm.title,
                description: farm.description,
                location: farm.location,
                pricePerNight: farm.pricePerNight,
                images: farm.images,
                amenities: farm.amenities,
                guests: farm.guests,
                bedrooms: farm.bedrooms,
                baths: farm.baths,
                rating: farm.rating
              })
            });
            if (createRes.ok) {
              const newFarm = await createRes.json();
              finalFarmId = newFarm._id;
            }
          }
        }
      }

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: (session.user as any).id,
          farmId: finalFarmId,
          startDate,
          endDate,
          totalPrice: grandTotal
        })
      });

      if (res.ok) {
        alert('Booking Confirmed Successfully!');
        router.push('/dashboard/bookings');
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to place booking.');
      }
    } catch (err) {
      console.error(err);
      alert('Error confirming booking.');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-[#1a1b22] font-sans antialiased">
      <main className="mx-auto max-w-[1280px] px-6 pt-[100px] pb-24 md:px-16">
        
        {/* Title & Metadata */}
        <div className="my-8">
          <h1 className="font-serif text-3xl font-semibold text-[#003527] md:text-5xl mb-2">{farm.title}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <MapPin className="h-4 w-4 text-[#10b981]" />
              <span className="font-medium">{farm.location}</span>
            </div>
        </div>

        {/* Bento Grid Photo Gallery */}
        <div className="relative mb-16 grid h-[400px] grid-cols-1 gap-4 overflow-hidden rounded-2xl md:h-[520px] md:grid-cols-4 md:grid-rows-2">
          <div className="relative col-span-1 row-span-1 overflow-hidden md:col-span-2 md:row-span-2">
            <img 
              src={farm.images?.[0]} 
              alt="Main stay view" 
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-102"
            />
          </div>
          <div className="hidden overflow-hidden md:block">
            <img 
              src={farm.images?.[1] || farm.images?.[0]} 
              alt="Alternative exterior view" 
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>
          <div className="hidden overflow-hidden md:block">
            <img 
              src={farm.images?.[2] || farm.images?.[0]} 
              alt="Interior lounge" 
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>
          <div className="relative hidden overflow-hidden md:block md:col-span-2">
            <img 
              src={farm.images?.[3] || farm.images?.[0]} 
              alt="Scenery gardens" 
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
            />
            {farm.images && farm.images.length > 4 && (
              <button 
                onClick={() => setShowAllPhotosModal(true)}
                className="absolute bottom-4 right-4 flex items-center space-x-2 rounded-xl border border-[#bfc9c3] bg-white px-4 py-2 text-sm font-bold text-[#003527] shadow-sm transition-colors hover:bg-gray-50"
              >
                <Grid className="h-4 w-4" />
                <span>Show all photos</span>
              </button>
            )}
          </div>
        </div>

        {/* Detail Split Column Panel */}
        <div className="flex flex-col gap-12 md:flex-row">
          
          {/* Main Info */}
          <div className="w-full md:w-[65%] md:pr-8">
            
            {/* Host Section */}
            <div className="border-b border-[#bfc9c3]/30 pb-8 mb-8">
              <h2 className="font-serif text-2xl text-[#003527] mb-2">Entire Farmhouse hosted by AgriStay</h2>
              <div className="flex items-center gap-4 text-sm font-semibold text-[#404944]">
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span>{farm.guests} guests</span>
                </div>
                <span>·</span>
                <div className="flex items-center gap-1.5">
                  <Bed className="h-4 w-4 text-gray-400" />
                  <span>{farm.bedrooms} bedrooms</span>
                </div>
                <span>·</span>
                <div className="flex items-center gap-1.5">
                  <Compass className="h-4 w-4 text-gray-400" />
                  <span>{farm.acres || 5} Acres</span>
                </div>
              </div>
            </div>

            {/* About Home description */}
            <div className="border-b border-[#bfc9c3]/30 pb-8 mb-8">
              <h3 className="font-serif text-xl text-[#003527] mb-4">About this farmhouse stay</h3>
              <p className="text-sm leading-relaxed text-gray-600 font-medium whitespace-pre-line">
                {farm.description}
              </p>
            </div>

            {/* Amenities Grid */}
            <div className="border-b border-[#bfc9c3]/30 pb-8 mb-8">
              <h3 className="font-serif text-xl text-[#003527] mb-6">What this farmhouse offers</h3>
              <div className="grid grid-cols-1 gap-y-4 gap-x-8 sm:grid-cols-2">
                {farm.amenities?.map((amenity, index) => {
                  const IconComponent = AMENITY_ICONS[amenity] || ShieldCheck;
                  return (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-full bg-[#e6f4ea] flex items-center justify-center text-[#003527]">
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <span className="text-sm font-semibold text-[#404944]">{amenity}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Booking / Sticky Card Column */}
          <div className="w-full md:w-[35%]">
            <div className="sticky top-[120px] rounded-2xl border border-[#bfc9c3]/30 bg-white p-6 shadow-[0_8px_30px_rgba(6,78,59,0.04)] hover-lift">
              
              {/* Price Tag Header */}
              <div className="mb-6 flex items-end justify-between">
                <div>
                  <span className="font-serif text-2xl font-bold text-[#003527] md:text-3xl">
                    ₹{(farm.pricePerNight || 3000).toLocaleString('en-IN')}
                  </span>
                  <span className="text-sm text-gray-500"> / night</span>
                </div>
              </div>

              {/* Date Inputs Card */}
              <div className={`mb-4 overflow-hidden rounded-xl border transition-all duration-200 ${hasConflict ? 'border-red-500 bg-red-50/20' : isInvalidDates ? 'border-amber-500 bg-amber-50/20' : 'border-[#bfc9c3]/40'}`}>
                <div className="flex border-b border-[#bfc9c3]/40">
                  <div className="w-1/2 border-r border-[#bfc9c3]/40 p-3 hover:bg-gray-50 transition-colors">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#404944] block mb-1">Check-in</label>
                    <input 
                      type="date" 
                      value={startDate} 
                      onChange={(e) => setStartDate(e.target.value)}
                      className="text-sm font-semibold text-[#003527] bg-transparent outline-none border-none w-full p-0" 
                    />
                  </div>
                  <div className="w-1/2 p-3 hover:bg-gray-50 transition-colors">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#404944] block mb-1">Checkout</label>
                    <input 
                      type="date" 
                      value={endDate} 
                      onChange={(e) => setEndDate(e.target.value)}
                      className="text-sm font-semibold text-[#003527] bg-transparent outline-none border-none w-full p-0" 
                    />
                  </div>
                </div>
                <div className="p-3 hover:bg-gray-50 transition-colors">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#404944] block mb-1">Guests limit</label>
                  <select 
                    value={guestSelection}
                    onChange={(e) => setGuestSelection(Number(e.target.value))}
                    className="text-sm font-semibold text-[#003527] bg-transparent border-none outline-none w-full p-0 cursor-pointer"
                  >
                    <option value={0} disabled>Select guests</option>
                    {[...Array(farm.guests || 6)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1} guest{i > 0 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Alert Banners */}
              {hasConflict && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold flex items-start gap-2 border border-red-200">
                  <span>⚠️ This farmhouse is already booked for the selected dates. Please choose different dates.</span>
                </div>
              )}
              {isInvalidDates && (
                <div className="mb-4 p-3 rounded-xl bg-amber-50 text-amber-700 text-xs font-semibold flex items-start gap-2 border border-amber-200">
                  <span>⚠️ Checkout date must be after check-in date.</span>
                </div>
              )}

              {/* Booking Actions */}
              <button 
                onClick={handleBooking}
                disabled={bookingLoading || hasConflict || isInvalidDates || !startDate || !endDate || guestSelection === 0}
                className="w-full rounded-xl bg-[#003527] hover:bg-[#064e3b] py-4 text-sm font-bold text-white shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bookingLoading ? 'Reserving...' : hasConflict ? 'Dates Already Booked' : 'Book Your Stay'}
              </button>
              <p className="mt-3 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                No payment charged yet
              </p>

              {/* Price Breakdown */}
              {hasValidDates && diffNights > 0 && (
                <>
                  <div className="mt-6 space-y-4 border-b border-[#bfc9c3]/20 pb-6 text-sm font-medium text-gray-500">
                    {priceBreakdown.map((item, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="underline cursor-pointer">{item.label}</span>
                        <span className="text-[#1a1b22]">₹{item.value.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>

                  {/* Final price */}
                  <div className="mt-6 flex justify-between font-serif text-lg font-bold text-[#003527]">
                    <span>Total</span>
                    <span>₹{grandTotal.toLocaleString('en-IN')}</span>
                  </div>
                </>
              )}

            </div>
          </div>

        </div>
      </main>
      {/* Full-screen Photo Gallery Modal */}
      {showAllPhotosModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-95 backdrop-blur-md flex flex-col transition-all duration-300">
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between bg-black/60 backdrop-blur-md px-6 py-4 border-b border-white/10 text-white">
            <div>
              <h2 className="font-serif text-lg md:text-xl font-bold">{farm.title}</h2>
              <p className="text-xs text-gray-400 font-medium mt-0.5">
                {farm.images?.length || 0} photo{farm.images?.length && farm.images.length > 1 ? 's' : ''}
              </p>
            </div>
            <button 
              onClick={() => setShowAllPhotosModal(false)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors focus:outline-none"
              aria-label="Close photo gallery"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Grid Container */}
          <div className="max-w-[1000px] w-full mx-auto px-6 py-12 flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {farm.images?.map((imgUrl, index) => (
                <div key={index} className="overflow-hidden rounded-2xl aspect-[4/3] bg-neutral-900 border border-white/5 group relative shadow-md">
                  <img 
                    src={imgUrl} 
                    alt={`${farm.title} photo ${index + 1}`} 
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold border border-white/10">
                    {index + 1} / {farm.images.length}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}