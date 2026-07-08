'use client';
import toast from 'react-hot-toast';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
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
  X,
  CalendarDays,
  CheckCircle2,
  Car,
  Camera
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
    title: 'Sunrise Valley Estate',
    location: 'Solan, Himachal Pradesh',
    pricePerNight: 15000,
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
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
  }
};

const AMENITY_ICONS: Record<string, React.ComponentType<any>> = {
  'WiFi': Wifi,
  'Swimming Pool': Waves,
  'Pool': Waves,
  'Children\'s Swimming Pool': Waves,
  'Kids Swimming Pool': Waves,
  'Kitchen': ChefHat,
  'Hot Tub': Sparkles,
  'Fireplace': Flame,
  'Indoor Fireplace': Flame,
  'Air Conditioning': Snowflake,
  'AC': Snowflake,
  'Garden': Trees,
  'Children\'s Playground': Trees,
  'Gazebo': Compass,
  'Extra Mattress': Bed,
  'Parking': Car,
  'CCTV': Camera,
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
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [guestSelection, setGuestSelection] = useState(0);
  const [showGuestDropdown, setShowGuestDropdown] = useState(false);
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
              'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
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
          setFarm(MOCK_FARMS_DETAILS['1']);
        }
      } catch (err) {
        console.error('Error fetching farm details:', err);
        setFarm(MOCK_FARMS_DETAILS['1']);
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

  const checkInExcludeDates = useMemo(() => {
    const dates: Date[] = [];
    existingBookings.forEach((b: any) => {
      if (b.paymentStatus === 'Failed') return;
      const bStart = new Date(b.startDate);
      const bEnd = new Date(b.endDate);
      let curr = new Date(bStart);
      while (curr < bEnd) {
        dates.push(new Date(curr));
        curr.setDate(curr.getDate() + 1);
      }
    });
    return dates;
  }, [existingBookings]);

  const checkOutExcludeDates = useMemo(() => {
    const dates: Date[] = [];
    existingBookings.forEach((b: any) => {
      if (b.paymentStatus === 'Failed') return;
      const bStart = new Date(b.startDate);
      const bEnd = new Date(b.endDate);
      let curr = new Date(bStart);
      curr.setDate(curr.getDate() + 1);
      while (curr <= bEnd) {
        dates.push(new Date(curr));
        curr.setDate(curr.getDate() + 1);
      }
    });
    return dates;
  }, [existingBookings]);

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
      <div className="flex min-h-screen items-center justify-center bg-[#FAF9F6]">
        <Loader2 className="h-10 w-10 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  if (!farm) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF9F6]">
        <p className="font-serif text-2xl text-[#1B2A22]">Estate not found.</p>
      </div>
    );
  }

  // Calculate pricing breakdown
  const start = startDate;
  const end = endDate;

  const hasValidDates = start && end && !isNaN(start.getTime()) && !isNaN(end.getTime()) && start < end;
  const isInvalidDates = start && end && (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end);

  const hasConflict = startDate && endDate && !isInvalidDates && existingBookings.some((b: any) => {
    if (b.paymentStatus === 'Failed') return false;
    const bStart = new Date(b.startDate).getTime();
    const bEnd = new Date(b.endDate).getTime();
    const sTime = startDate.getTime();
    const eTime = endDate.getTime();
    return sTime < bEnd && eTime > bStart;
  });

  const diffTime = hasValidDates ? Math.abs(end!.getTime() - start!.getTime()) : 0;
  const diffNights = hasValidDates ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) : 0;
  const accommodationTotal = farm.pricePerNight * diffNights;
  const grandTotal = accommodationTotal;

  const priceBreakdown = [
    { label: `₹${farm.pricePerNight.toLocaleString('en-IN')} x ${diffNights} night${diffNights > 1 ? 's' : ''}`, value: accommodationTotal }
  ];

  const handleBooking = async () => {
    if (!session?.user) {
      toast.error('Please sign in to complete your reservation.');
      router.push('/login');
      return;
    }

    if (!startDate || !endDate) {
      toast.error('Please select check-in and checkout dates.');
      return;
    }

    if (guestSelection === 0) {
      toast.error('Please select the number of guests.');
      return;
    }

    if (isInvalidDates) {
      toast.error('Checkout date must be after check-in date.');
      return;
    }

    if (hasConflict) {
      toast.error('This estate is already reserved for the selected dates. Please choose different dates.');
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
          startDate: startDate ? startDate.toISOString() : null,
          endDate: endDate ? endDate.toISOString() : null,
          totalPrice: grandTotal
        })
      });

      if (res.ok) {
        toast.success('Reservation Confirmed Successfully!');
        router.push('/dashboard/bookings');
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || 'Failed to place reservation.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error confirming reservation.');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1B2A22] font-sans antialiased">
      <style dangerouslySetInnerHTML={{__html: `
        .react-datepicker-wrapper { width: 100%; }
        .react-datepicker { font-family: inherit; border: 1px solid rgba(255,255,255,0.1); background-color: #1B2A22; color: white; border-radius: 0; }
        .react-datepicker__header { background-color: #1B2A22; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .react-datepicker__current-month, .react-datepicker-time__header, .react-datepicker-year-header { color: white; font-weight: normal; }
        .react-datepicker__day-name { color: #D4AF37; }
        .react-datepicker__day { color: white; }
        .react-datepicker__day:hover { background-color: rgba(255,255,255,0.1); border-radius: 0; }
        .react-datepicker__day--selected, .react-datepicker__day--in-selecting-range, .react-datepicker__day--in-range { background-color: #D4AF37; color: #1B2A22; border-radius: 0; }
        .react-datepicker__day--keyboard-selected { background-color: rgba(212,175,55,0.3); color: white; }
        .react-datepicker__day--disabled { color: rgba(255,255,255,0.2) !important; text-decoration: line-through; }
      `}} />
      <main className="mx-auto max-w-[1280px] px-6 pt-32 pb-24 md:px-16">
        
        {/* Title & Metadata */}
        <div className="mb-10 text-center max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-[#D4AF37] mb-4">
            <MapPin className="h-3.5 w-3.5" />
            {farm.location?.startsWith('http') ? (
              <a href={farm.location} target="_blank" rel="noopener noreferrer" className="hover:underline text-[#D4AF37]">
                View on Map
              </a>
            ) : (
              <span>{farm.location}</span>
            )}
          </div>
          <h1 className="font-serif text-4xl font-normal text-[#1B2A22] md:text-6xl mb-6">{farm.title}</h1>
        </div>

        {/* Hero Photo Gallery */}
        <div className="relative mb-20 grid h-[500px] grid-cols-1 gap-4 overflow-hidden md:h-[600px] md:grid-cols-4 md:grid-rows-2">
          <div className="relative col-span-1 row-span-1 overflow-hidden md:col-span-3 md:row-span-2">
            <img 
              src={farm.images?.[0]} 
              alt="Main stay view" 
              className="h-full w-full object-cover transition-transform duration-[2s] hover:scale-105"
            />
          </div>
          <div className="hidden overflow-hidden md:block">
            <img 
              src={farm.images?.[1] || farm.images?.[0]} 
              alt="Alternative exterior view" 
              className="h-full w-full object-cover transition-transform duration-[2s] hover:scale-105"
            />
          </div>
          <div className="relative hidden overflow-hidden md:block">
            <img 
              src={farm.images?.[2] || farm.images?.[0]} 
              alt="Interior lounge" 
              className="h-full w-full object-cover transition-transform duration-[2s] hover:scale-105"
            />
            {farm.images && farm.images.length > 3 && (
              <button 
                onClick={() => setShowAllPhotosModal(true)}
                className="absolute bottom-6 right-6 flex items-center space-x-2 bg-white/20 backdrop-blur-md px-6 py-3 text-[11px] uppercase tracking-widest font-bold text-white transition-all hover:bg-white hover:text-[#1B2A22]"
              >
                <Grid className="h-4 w-4" />
                <span>View Gallery</span>
              </button>
            )}
          </div>
        </div>

        {/* Detail Split Column Panel */}
        <div className="flex flex-col gap-16 md:flex-row">
          
          {/* Main Info */}
          <div className="w-full md:w-[60%] md:pr-10">
            
            {/* Highlights Section */}
            <div className="border-b border-[#1B2A22]/10 pb-10 mb-10">
              <h2 className="font-serif text-3xl text-[#1B2A22] mb-6">Enjoy Farm Experience</h2>
              <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-sm font-semibold text-[#1B2A22]/70 uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#D4AF37]" />
                  <span>{farm.guests} guests max</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bed className="h-4 w-4 text-[#D4AF37]" />
                  <span>{farm.bedrooms} bedrooms</span>
                </div>
                <div className="flex items-center gap-2">
                  <Compass className="h-4 w-4 text-[#D4AF37]" />
                  <span>{farm.acres || 5} Acres</span>
                </div>
              </div>
            </div>

            {/* About Home description */}
            <div className="border-b border-[#1B2A22]/10 pb-10 mb-10">
              <h3 className="font-serif text-2xl text-[#1B2A22] mb-6">About Enjoy Farm</h3>
              <p className="text-base leading-loose text-[#1B2A22]/70 font-medium whitespace-pre-line font-serif italic">
                {farm.description}
              </p>
            </div>

            {/* Amenities Grid */}
            <div className="pb-10 mb-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-6 bg-[#00a877] rounded-sm"></div>
                <h3 className="font-sans text-xl font-bold text-[#1B2A22]">Amenities</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {farm.amenities?.map((amenity, index) => {
                  const IconComponent = AMENITY_ICONS[amenity] || CheckCircle2;
                  return (
                    <div key={index} className="flex flex-col items-center justify-center p-5 bg-[#fbf8ff] border border-[#eeedf7] rounded-xl text-center gap-3 hover:shadow-md transition-shadow">
                      <div className="text-[#00a877]">
                        <IconComponent className="h-6 w-6 stroke-[1.5]" />
                      </div>
                      <span className="text-sm font-semibold text-[#1B2A22]/80">{amenity}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Booking / Sticky Card Column */}
          <div className="w-full md:w-[40%]">
            <div className="sticky top-28 bg-white border border-[#1B2A22]/5 p-8 md:p-10">
              
              <div className="mb-8">
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#D4AF37] block mb-2">Reservation</span>
                <span className="font-serif text-3xl font-normal text-[#1B2A22]">
                  ₹{(farm.pricePerNight || 3000).toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-[#1B2A22]/50 font-medium ml-2 uppercase tracking-widest">/ night</span>
              </div>

              {/* Date Inputs Card */}
              <div className={`mb-6 border transition-all duration-200 ${hasConflict ? 'border-red-500/50 bg-red-50/50' : isInvalidDates ? 'border-amber-500/50 bg-amber-50/50' : 'border-[#1B2A22]/10'}`}>
                <div className="flex border-b border-[#1B2A22]/10">
                  <div className="w-1/2 border-r border-[#1B2A22]/10 p-4">
                    <label className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#D4AF37] block mb-2">Check-in</label>
                    <DatePicker
                      selected={startDate}
                      onChange={(date) => setStartDate(date)}
                      selectsStart
                      startDate={startDate || undefined}
                      endDate={endDate || undefined}
                      minDate={new Date()}
                      excludeDates={checkInExcludeDates}
                      placeholderText="Select date"
                      className="text-sm font-semibold text-[#1B2A22] bg-transparent outline-none border-none w-full p-0 cursor-pointer placeholder:text-[#1B2A22]/30"
                    />
                  </div>
                  <div className="w-1/2 p-4">
                    <label className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#D4AF37] block mb-2">Checkout</label>
                    <DatePicker
                      selected={endDate}
                      onChange={(date) => setEndDate(date)}
                      selectsEnd
                      startDate={startDate || undefined}
                      endDate={endDate || undefined}
                      minDate={startDate || new Date()}
                      excludeDates={checkOutExcludeDates}
                      placeholderText="Select date"
                      className="text-sm font-semibold text-[#1B2A22] bg-transparent outline-none border-none w-full p-0 cursor-pointer placeholder:text-[#1B2A22]/30"
                    />
                  </div>
                </div>
                <div 
                  className="p-4 relative outline-none"
                  tabIndex={0}
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget)) {
                      setShowGuestDropdown(false);
                    }
                  }}
                >
                  <label className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#D4AF37] block mb-2">Guests</label>
                  <div 
                    onClick={() => setShowGuestDropdown(!showGuestDropdown)}
                    className="text-sm font-semibold text-[#1B2A22] w-full cursor-pointer flex justify-between items-center"
                  >
                    <span className={guestSelection === 0 ? 'text-[#1B2A22]/30' : ''}>
                      {guestSelection === 0 ? 'Select guests' : `${guestSelection} guest${guestSelection > 1 ? 's' : ''}`}
                    </span>
                    <svg className={`w-4 h-4 text-[#1B2A22]/50 transition-transform duration-200 ${showGuestDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                  
                  {showGuestDropdown && (
                    <div className="absolute top-full left-0 w-full bg-white border border-[#1B2A22]/10 shadow-2xl z-50 max-h-60 overflow-y-auto mt-1">
                      {[...Array(farm.guests || 6)].map((_, i) => (
                        <div 
                          key={i + 1}
                          onClick={() => {
                            setGuestSelection(i + 1);
                            setShowGuestDropdown(false);
                          }}
                          className={`px-4 py-3 text-sm font-semibold cursor-pointer transition-colors ${guestSelection === i + 1 ? 'bg-[#D4AF37] text-white' : 'text-[#1B2A22] hover:bg-[#FAF9F6]'}`}
                        >
                          {i + 1} guest{i > 0 ? 's' : ''}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Alert Banners */}
              {hasConflict && (
                <div className="mb-6 p-4 bg-red-50 text-red-800 text-xs font-semibold flex items-start gap-2 border border-red-200">
                  <span>This estate is already reserved for the selected dates.</span>
                </div>
              )}
              {isInvalidDates && (
                <div className="mb-6 p-4 bg-amber-50 text-amber-800 text-xs font-semibold flex items-start gap-2 border border-amber-200">
                  <span>Checkout date must be after check-in date.</span>
                </div>
              )}

              {/* Booking Actions */}
              <button 
                onClick={handleBooking}
                disabled={bookingLoading || hasConflict || isInvalidDates || !startDate || !endDate || guestSelection === 0}
                className="w-full bg-[#1B2A22] hover:bg-[#00a877] py-5 text-[11px] uppercase tracking-[0.1em] font-bold text-white transition-colors active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed mb-4"
              >
                {bookingLoading ? 'Reserving...' : hasConflict ? 'Dates Unavailable' : 'Request Reservation'}
              </button>
              
              <div className="text-center text-[10px] font-bold text-[#1B2A22]/40 uppercase tracking-widest mb-8">
                <CalendarDays className="h-3 w-3 inline mr-1 mb-0.5" /> Subject to approval
              </div>

              {/* Price Breakdown */}
              {hasValidDates && diffNights > 0 && (
                <>
                  <div className="space-y-4 border-t border-[#1B2A22]/10 pt-6 pb-6 text-xs font-medium text-[#1B2A22]/70 uppercase tracking-wider">
                    {priceBreakdown.map((item, index) => (
                      <div key={index} className="flex justify-between">
                        <span>{item.label}</span>
                        <span className="text-[#1B2A22]">₹{item.value.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-2 flex justify-between font-serif text-2xl font-normal text-[#1B2A22]">
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
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#1B2A22] flex flex-col transition-all duration-300">
          <div className="sticky top-0 z-10 flex items-center justify-between bg-[#1B2A22]/90 backdrop-blur-md px-8 py-6 border-b border-white/10 text-white">
            <div>
              <h2 className="font-serif text-2xl font-normal">{farm.title}</h2>
              <p className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold mt-2">
                {farm.images?.length || 0} Photos
              </p>
            </div>
            <button 
              onClick={() => setShowAllPhotosModal(false)}
              className="p-3 bg-white/5 hover:bg-white/10 text-white transition-colors focus:outline-none"
              aria-label="Close photo gallery"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="max-w-[1280px] w-full mx-auto px-6 py-16 flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {farm.images?.map((imgUrl, index) => (
                <div key={index} className="overflow-hidden aspect-[4/3] bg-black/20 border border-white/5 group relative">
                  <img 
                    src={imgUrl} 
                    alt={`${farm.title} photo ${index + 1}`} 
                    className="h-full w-full object-cover transition-transform duration-[2s] hover:scale-105"
                  />
                  <div className="absolute bottom-6 left-6 bg-[#1B2A22]/80 backdrop-blur-sm text-[#D4AF37] px-4 py-2 text-[10px] uppercase tracking-widest font-bold">
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