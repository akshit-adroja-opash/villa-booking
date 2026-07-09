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
 Camera,
 ExternalLink,
 Phone,
 MessageCircle,
 Info,
 FileText,
 Ban,
 ChevronLeft,
 ChevronRight
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
 const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
 const [openPolicy, setOpenPolicy] = useState<'rules' | 'cancellation' | null>(null);

 useEffect(() => {
 if (!id) return;

 async function getFarm() {
 setLoading(true);
 try {
 const res = await fetch(`/api/farms/${id}`);
 if (res.ok) {
 const data = await res.json();
 if (!data) throw new Error('Not found');
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
 setFarm(null);
 }
 } catch (err) {
 console.error('Error fetching farm details:', err);
 setFarm(null);
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
    if (showAllPhotosModal || lightboxIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showAllPhotosModal, lightboxIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (lightboxIndex !== null) setLightboxIndex(null);
        else setShowAllPhotosModal(false);
      } else if (e.key === 'ArrowRight' && lightboxIndex !== null) {
        setLightboxIndex((prev) => (prev! + 1) % (farm?.images?.length || 1));
      } else if (e.key === 'ArrowLeft' && lightboxIndex !== null) {
        setLightboxIndex((prev) => (prev! - 1 + (farm?.images?.length || 1)) % (farm?.images?.length || 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, farm?.images?.length]);

 if (loading) {
 return (
 <div className="flex min-h-screen items-center justify-center bg-[#FAF9F6]">
 <Loader2 className="h-10 w-10 animate-spin text-[#1B2A22]"/>
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
 .react-datepicker__day-name { color: #1B2A22; }
 .react-datepicker__day { color: white; }
 .react-datepicker__day:hover { background-color: rgba(255,255,255,0.1); border-radius: 0; }
 .react-datepicker__day--selected, .react-datepicker__day--in-selecting-range, .react-datepicker__day--in-range { background-color: #1B2A22; color: #1B2A22; border-radius: 0; }
 .react-datepicker__day--keyboard-selected { background-color: rgba(212,175,55,0.3); color: white; }
 .react-datepicker__day--disabled { color: rgba(255,255,255,0.2) !important; text-decoration: line-through; }
 `}} />
 <main className="mx-auto max-w-[1280px] px-6 pt-32 pb-24 md:px-16">
 
 {/* Title & Metadata */}
 <div className="mb-10 text-center max-w-4xl mx-auto">
 <div className="flex items-center justify-center gap-2 text-sm font-medium text-[#1B2A22] mb-4">
 <MapPin className="h-3.5 w-3.5"/>
 {farm.location?.startsWith('http') ? (
 <a href={farm.location} target="_blank"rel="noopener noreferrer"className="hover:underline text-[#1B2A22]">
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
  <div className="relative col-span-1 row-span-1 overflow-hidden md:col-span-3 md:row-span-2 cursor-pointer" onClick={() => setLightboxIndex(0)}>
  <img 
  src={farm.images?.[0]} 
  alt="Main stay view"
  className="h-full w-full object-cover transition-transform duration-[2s] hover:scale-105"
  />
  </div>
  <div className="hidden overflow-hidden md:block cursor-pointer" onClick={() => setLightboxIndex(1)}>
  <img 
  src={farm.images?.[1] || farm.images?.[0]} 
  alt="Alternative exterior view"
  className="h-full w-full object-cover transition-transform duration-[2s] hover:scale-105"
  />
  </div>
  <div className="relative hidden overflow-hidden md:block cursor-pointer" onClick={() => setLightboxIndex(2)}>
  <img 
  src={farm.images?.[2] || farm.images?.[0]} 
  alt="Interior lounge"
  className="h-full w-full object-cover transition-transform duration-[2s] hover:scale-105"
  />
 {farm.images && farm.images.length > 3 && (
 <button 
 onClick={() => setShowAllPhotosModal(true)}
 className="absolute bottom-6 right-6 flex items-center space-x-2 bg-white/20 backdrop-blur-md px-6 py-3 text-sm font-medium text-white transition-all hover:bg-white hover:text-[#1B2A22]"
 >
 <Grid className="h-4 w-4"/>
 <span>View All</span>
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
 <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-sm font-semibold text-[#1B2A22]/70">
 <div className="flex items-center gap-2">
 <Users className="h-4 w-4 text-[#1B2A22]"/>
 <span>{farm.guests} guests max</span>
 </div>
 <div className="flex items-center gap-2">
 <Bed className="h-4 w-4 text-[#1B2A22]"/>
 <span>{farm.bedrooms} bedrooms</span>
 </div>
 <div className="flex items-center gap-2">
 <Compass className="h-4 w-4 text-[#1B2A22]"/>
 <span>{farm.acres || 5} Acres</span>
 </div>
 </div>
 </div>

 {/* About Home description */}
 <div className="border-b border-[#1B2A22]/10 pb-10 mb-10">
 <h3 className="font-serif text-2xl text-[#1B2A22] mb-6">About Enjoy Farm</h3>
 <p className="text-base leading-loose text-[#1B2A22]/70 font-medium whitespace-pre-line font-serif">
 {farm.description}
 </p>
 </div>

 {/* Amenities Grid */}
 <div className="pb-10 mb-10">
 <div className="flex items-center gap-3 mb-6">
 <div className="w-1.5 h-6 bg-[#00a877] rounded-sm"></div>
 <h3 className="font-sans text-xl font-bold text-[#1B2A22]">Amenities</h3>
 </div>
 <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
 {farm.amenities?.map((amenity, index) => {
 const IconComponent = AMENITY_ICONS[amenity] || CheckCircle2;
 return (
 <div key={index} className="flex flex-col items-center justify-center p-4 bg-[#fbf8ff] border border-[#eeedf7] rounded-xl text-center gap-2 hover:shadow-md transition-shadow">
 <div className="text-[#00a877]">
 <IconComponent className="h-5 w-5 stroke-[1.5]"/>
 </div>
 <span className="text-xs font-semibold text-[#1B2A22]/80">{amenity}</span>
 </div>
 );
 })}
 </div>
 </div>

  {/* Policies Accordion */}
  <div className="border border-[#eeedf7] rounded-xl p-6 bg-white mb-10 mt-10 shadow-sm">
    <div className="flex items-center gap-3 mb-6">
      <div className="w-1 h-6 bg-[#00a877] rounded-sm"></div>
      <h3 className="font-sans text-xl font-bold text-[#1B2A22]">Policies</h3>
    </div>
    
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <button 
      onClick={() => setOpenPolicy(openPolicy === 'rules' ? null : 'rules')}
      className={`flex items-center gap-3 p-4 rounded-xl border transition-colors ${openPolicy === 'rules' ? 'border-[#00a877] bg-[#fbf8ff]' : 'border-[#eeedf7] hover:bg-slate-50'}`}
      >
        <FileText className={`h-5 w-5 ${openPolicy === 'rules' ? 'text-[#00a877]' : 'text-[#1B2A22]/60'}`}/>
        <span className={`font-bold ${openPolicy === 'rules' ? 'text-[#00a877]' : 'text-[#1B2A22]'}`}>House Rules</span>
      </button>
      
      <button 
      onClick={() => setOpenPolicy(openPolicy === 'cancellation' ? null : 'cancellation')}
      className={`flex items-center gap-3 p-4 rounded-xl border transition-colors ${openPolicy === 'cancellation' ? 'border-red-500 bg-red-50/30' : 'border-[#eeedf7] hover:bg-slate-50'}`}
      >
        <Ban className={`h-5 w-5 ${openPolicy === 'cancellation' ? 'text-red-500' : 'text-[#1B2A22]/60'}`}/>
        <span className={`font-bold ${openPolicy === 'cancellation' ? 'text-red-500' : 'text-[#1B2A22]'}`}>Cancellation Policy</span>
      </button>
    </div>
    
    {/* Expanded Content */}
    {openPolicy === 'rules' && (
    <div className="mt-6 pt-6 border-t border-[#eeedf7] animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1.5 h-5 bg-[#1B2A22] rounded-sm"></div>
        <h4 className="font-sans text-lg font-bold text-[#1B2A22]">House Rules</h4>
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
        'No Alcohol Party',
        'No Smoking',
        'Self Cooking',
        'Self Cleaning',
        'Staircase only',
        'No Pets',
        'No Luggage Responsibility',
        'Non-veg not allowed'
        ].map((rule, idx) => (
        <li key={idx} className="flex items-center gap-3 bg-[#fbf8ff] border border-[#eeedf7] p-4 rounded-xl">
          <div className="text-[#1B2A22]/40">
            <CheckCircle2 className="h-5 w-5"/>
          </div>
          <span className="text-sm font-semibold text-[#1B2A22]/80">{rule}</span>
        </li>
        ))}
      </ul>
    </div>
    )}
    
    {openPolicy === 'cancellation' && (
    <div className="mt-6 pt-6 border-t border-[#eeedf7] animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1.5 h-5 bg-red-500 rounded-sm"></div>
        <h4 className="font-sans text-lg font-bold text-[#1B2A22]">Cancellation Policy</h4>
      </div>
      <ul className="space-y-3">
        {[
        { label:"Within 20 mins of booking", value:"10% convenience fee will be applied."},
        { label:"15 days+ before check-in", value:"20% of the booking amount will be charged."},
        { label:"Less than 15 days before", value:"100% of the booking amount will be charged."},
        { label:"After check-in time", value:"No cancellation allowed."},
        { label:"Refund Processing", value:"Processed within 7 working days."}
        ].map((policy, idx) => (
        <li key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-red-50/30 border border-red-100 rounded-xl gap-2 hover:bg-red-50/80 transition-colors">
          <span className="text-sm font-bold text-red-950">{policy.label}</span>
          <span className="text-sm font-medium text-red-900/80">{policy.value}</span>
        </li>
        ))}
      </ul>
    </div>
    )}
  </div>

 {/* Location */}
 <div className="pb-10 mb-10 border-t border-[#1B2A22]/10 pt-10">
 <div className="border border-[#eeedf7] rounded-xl p-6 bg-white">
 <div className="flex items-center gap-3 mb-6">
 <div className="w-1.5 h-6 bg-[#00a877] rounded-sm"></div>
 <h3 className="font-sans text-xl font-bold text-[#1B2A22]">Location</h3>
 </div>
 
 <div className="relative w-full h-[350px] rounded-lg overflow-hidden bg-[#fbf8ff]">
 <iframe
 title="Property Location Map"
 width="100%"
 height="100%"
 style={{ border: 0 }}
 loading="lazy"
 allowFullScreen
 referrerPolicy="no-referrer-when-downgrade"
 src={`https://maps.google.com/maps?q=${encodeURIComponent(farm.location || 'Gujarat, India')}&t=k&z=15&ie=UTF8&iwloc=&output=embed`}
 ></iframe>
 
 <a
 href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(farm.location || 'Gujarat, India')}`}
 target="_blank"
 rel="noopener noreferrer"
 className="absolute top-4 left-4 bg-white text-blue-600 px-4 py-2 text-sm font-semibold shadow-md hover:bg-slate-50 transition-colors flex items-center gap-2 rounded-sm"
 >
 Open in Maps
 <ExternalLink className="w-4 h-4"/>
 </a>
 </div>
 </div>
 </div>
 </div>

 {/* Booking / Sticky Card Column */}
 <div className="w-full md:w-[40%]">
 <div className="sticky top-28">
 <div className="bg-white border border-[#1B2A22]/5 p-8 md:p-10">
 
 <div className="mb-8">
 <span className="text-sm font-medium text-[#1B2A22] block mb-2">Reservation</span>
 <span className="font-serif text-3xl font-normal text-[#1B2A22]">
 ₹{(farm.pricePerNight || 3000).toLocaleString('en-IN')}
 </span>
 <span className="text-xs text-[#1B2A22]/50 font-medium ml-2">/ night</span>
 </div>

 {/* Date Inputs Card */}
 <div className={`mb-6 border transition-all duration-200 ${hasConflict ? 'border-red-500/50 bg-red-50/50' : isInvalidDates ? 'border-amber-500/50 bg-amber-50/50' : 'border-[#1B2A22]/10'}`}>
 <div className="flex border-b border-[#1B2A22]/10">
 <div className="w-1/2 border-r border-[#1B2A22]/10 p-4">
 <label className="text-sm font-medium text-[#1B2A22] block mb-2">Check-in</label>
 <DatePicker
 selected={startDate}
 onChange={(date: Date | null) => setStartDate(date)}
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
 <label className="text-sm font-medium text-[#1B2A22] block mb-2">Checkout</label>
 <DatePicker
 selected={endDate}
 onChange={(date: Date | null) => setEndDate(date)}
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
 <label className="text-sm font-medium text-[#1B2A22] block mb-2">Guests</label>
 <div 
 onClick={() => setShowGuestDropdown(!showGuestDropdown)}
 className="text-sm font-semibold text-[#1B2A22] w-full cursor-pointer flex justify-between items-center"
 >
 <span className={guestSelection === 0 ? 'text-[#1B2A22]/30' : ''}>
 {guestSelection === 0 ? 'Select guests' : `${guestSelection} guest${guestSelection > 1 ? 's' : ''}`}
 </span>
 <svg className={`w-4 h-4 text-[#1B2A22]/50 transition-transform duration-200 ${showGuestDropdown ? 'rotate-180' : ''}`} fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth="2"d="M19 9l-7 7-7-7"></path></svg>
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
 className={`px-4 py-3 text-sm font-semibold cursor-pointer transition-colors ${guestSelection === i + 1 ? 'bg-[#1B2A22] text-white' : 'text-[#1B2A22] hover:bg-[#FAF9F6]'}`}
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

 {/* Security Deposit Banner */}
 <div className="mb-6 p-4 bg-[#fff9f0] border border-[#f5a623] rounded-xl flex gap-3 items-start">
 <div className="mt-0.5">
 <Info className="h-5 w-5 text-[#f5a623]"/>
 </div>
 <div>
 <div className="flex flex-wrap items-center gap-2 mb-1.5">
 <span className="text-[13px] font-bold text-[#1B2A22]">₹5000 Security Deposit</span>
 <span className="bg-[#f5a623] text-white text-sm font-medium font-bold px-2.5 py-0.5 rounded-full">Pay at Check-in</span>
 </div>
 <p className="text-xs font-semibold text-[#1B2A22]/70">Refunded by host if no damage</p>
 </div>
 </div>

 {/* Booking Actions */}
 <button 
 onClick={handleBooking}
 disabled={bookingLoading || hasConflict || isInvalidDates || !startDate || !endDate || guestSelection === 0}
 className="w-full bg-[#1B2A22] hover:bg-[#00a877] py-5 text-sm font-medium text-white transition-colors active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed mb-4"
 >
 {bookingLoading ? 'Reserving...' : hasConflict ? 'Dates Unavailable' : 'Request Reservation'}
 </button>
 
 <div className="text-center text-sm font-medium font-bold text-[#1B2A22]/40 mb-8">
 <CalendarDays className="h-3 w-3 inline mr-1 mb-0.5"/> Subject to approval
 </div>

 {/* Price Breakdown */}
 {hasValidDates && diffNights > 0 && (
 <>
 <div className="space-y-4 border-t border-[#1B2A22]/10 pt-6 pb-6 text-xs font-medium text-[#1B2A22]/70 tracking-wider">
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

 {/* Need Help Section */}
 <div className="mt-8">
 <h4 className="font-sans text-sm font-bold text-[#1B2A22] mb-4">Need Help?</h4>
 <div className="space-y-3">
 <a href="tel:+918780493615"className="flex items-center gap-4 w-full p-4 bg-white border border-[#eeedf7] rounded-xl hover:border-[#00a877] transition-colors group hover:shadow-sm">
 <Phone className="h-5 w-5 text-[#00a877] group-hover:scale-110 transition-transform"/>
 <span className="text-sm font-semibold text-[#1B2A22]">Call us: +91 8780493615</span>
 </a>
 <a href="https://wa.me/918780493615"target="_blank"rel="noopener noreferrer"className="flex items-center gap-4 w-full p-4 bg-white border border-[#eeedf7] rounded-xl hover:border-[#00a877] transition-colors group hover:shadow-sm">
 <MessageCircle className="h-5 w-5 text-[#00a877] group-hover:scale-110 transition-transform"/>
 <span className="text-sm font-semibold text-[#1B2A22]">WhatsApp Support</span>
 </a>
 </div>
 </div>

 </div>
 </div>

 </div>
 </main>

 {/* Full-screen Photo Gallery Modal */}
 {showAllPhotosModal && (
 <div className="fixed inset-0 z-50 overflow-y-auto bg-[#1B2A22] flex flex-col transition-all duration-300">
 <div className="sticky top-0 z-10 flex items-center justify-between bg-[#1B2A22]/95 backdrop-blur-md px-6 py-4 border-b border-white/10 text-white">
 <h2 className="font-sans text-sm font-semibold tracking-widest uppercase">{farm.title}</h2>
 <button 
 onClick={() => setShowAllPhotosModal(false)}
 className="p-2 bg-white/5 hover:bg-white/10 text-white transition-colors focus:outline-none"
 aria-label="Close photo gallery"
 >
 <X className="h-5 w-5"/>
 </button>
 </div>

 <div className="max-w-[1280px] w-full mx-auto px-6 py-16 flex-1">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
 {farm.images?.map((imgUrl, index) => (
 <div key={index} className="overflow-hidden aspect-[4/3] bg-black/20 border border-white/5 group relative cursor-pointer" onClick={() => setLightboxIndex(index)}>
 <img 
 src={imgUrl} 
 alt={`${farm.title} photo ${index + 1}`} 
 className="h-full w-full object-cover transition-transform duration-[2s] hover:scale-105"
 />
 <div className="absolute bottom-6 left-6 bg-[#1B2A22]/80 backdrop-blur-sm text-[#1B2A22] px-4 py-2 text-sm font-medium">
 {index + 1} / {farm.images.length}
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 )}

 {/* Fullscreen Lightbox */}
 {lightboxIndex !== null && farm.images && farm.images.length > 0 && (
  <div className="fixed inset-0 z-[60] bg-black/95 flex flex-col transition-all duration-300">
    <div className="absolute top-0 right-0 z-[70] p-6">
      <button 
      onClick={() => setLightboxIndex(null)}
      className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors focus:outline-none backdrop-blur-md"
      aria-label="Close lightbox"
      >
        <X className="h-6 w-6"/>
      </button>
    </div>
    
    <div className="absolute top-1/2 left-6 z-[70] -translate-y-1/2">
      <button 
      onClick={(e) => { e.stopPropagation(); setLightboxIndex((prev) => (prev! - 1 + farm.images!.length) % farm.images!.length); }}
      className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors focus:outline-none backdrop-blur-md"
      aria-label="Previous photo"
      >
        <ChevronLeft className="h-8 w-8"/>
      </button>
    </div>

    <div className="absolute top-1/2 right-6 z-[70] -translate-y-1/2">
      <button 
      onClick={(e) => { e.stopPropagation(); setLightboxIndex((prev) => (prev! + 1) % farm.images!.length); }}
      className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors focus:outline-none backdrop-blur-md"
      aria-label="Next photo"
      >
        <ChevronRight className="h-8 w-8"/>
      </button>
    </div>

    <div className="flex-1 w-full h-full flex items-center justify-center p-4 md:p-12" onClick={() => setLightboxIndex(null)}>
      <img 
      src={farm.images[lightboxIndex]} 
      alt={`${farm.title} photo ${lightboxIndex + 1}`} 
      className="max-w-full max-h-full object-contain select-none"
      onClick={(e) => e.stopPropagation()}
      />
    </div>

    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium bg-black/50 px-4 py-2 rounded-full backdrop-blur-md">
      {lightboxIndex + 1} / {farm.images.length}
    </div>
  </div>
  )}

 </div>
 );
}
