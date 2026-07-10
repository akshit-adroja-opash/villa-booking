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
 ChevronRight,
 ChevronDown
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
 'Beach Access': Compass,
 'Cricket Box': CheckCircle2,
 'Online Food Delivery (Zomato/Swiggy)': ChefHat
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
 .react-datepicker-popper { z-index: 9999 !important; }
 .react-datepicker { font-family: inherit; border: 1px solid #f3f4f6; background-color: white; color: #002E1E; border-radius: 16px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1); overflow: hidden; }
 .react-datepicker__header { background-color: white; border-bottom: 1px solid #f3f4f6; padding-top: 16px; }
 .react-datepicker__current-month, .react-datepicker-time__header, .react-datepicker-year-header { color: #002E1E; font-weight: 800; font-size: 14px; }
 .react-datepicker__day-name { color: #9ca3af; font-weight: 700; font-size: 12px; margin: 4px; }
 .react-datepicker__day { color: #4b5563; font-weight: 600; margin: 4px; border-radius: 8px; transition: all 0.2s; }
 .react-datepicker__day:hover { background-color: #f3f4f6; color: #002E1E; }
 .react-datepicker__day--selected, .react-datepicker__day--in-selecting-range, .react-datepicker__day--in-range { background-color: #002E1E; color: white; font-weight: 700; }
 .react-datepicker__day--keyboard-selected { background-color: #e6f4ea; color: #002E1E; }
 .react-datepicker__day--disabled { color: #d1d5db !important; text-decoration: line-through; cursor: not-allowed; hover:bg-transparent; }
 .react-datepicker-popper[data-placement^="bottom"] .react-datepicker__triangle::before { border-bottom-color: #f3f4f6; }
 .react-datepicker-popper[data-placement^="bottom"] .react-datepicker__triangle::after { border-bottom-color: white; }
 `}} />
 <main className="mx-auto max-w-[1280px] px-6 pt-32 pb-24 md:px-16">
 
 {/* Title & Metadata */}
 <div className="mb-8 max-w-4xl">
 <h1 className="font-serif text-3xl font-bold text-[#002E1E] md:text-5xl leading-tight mb-4">{farm.title}</h1>
 <div className="flex items-center gap-2 text-[14px] font-medium text-[#002E1E]">
 <MapPin className="h-4 w-4 text-[#00a877]"/>
 {farm.location?.startsWith('http') ? (
 <a href={farm.location} target="_blank" rel="noopener noreferrer" className="hover:underline">
 View on Map
 </a>
 ) : (
 <span>{farm.location}</span>
 )}
 </div>
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
 <div className="flex flex-col gap-16 md:flex-row mt-12">
 
 {/* Main Info */}
 <div className="w-full md:w-[60%] md:pr-10">
 
 {/* Highlights Section */}
 <div className="mb-8">
 <h2 className="font-serif text-[26px] font-bold text-[#002E1E] mb-4">Entire Farmhouse hosted by AgriStay</h2>
 <div className="flex items-center flex-wrap gap-2 text-[14px] text-gray-600 font-bold">
 <span className="flex items-center gap-1.5"><Users className="h-4 w-4 text-gray-400"/> {farm.guests} guests</span>
 <span className="text-gray-300 mx-1">·</span>
 <span className="flex items-center gap-1.5"><Bed className="h-4 w-4 text-gray-400"/> {farm.bedrooms} bedrooms</span>
 <span className="text-gray-300 mx-1">·</span>
 <span className="flex items-center gap-1.5"><Compass className="h-4 w-4 text-gray-400"/> {farm.acres || 8} Acres</span>
 </div>
 </div>

 <div className="border-t border-gray-100 my-8"></div>

 {/* About Home description */}
 <div className="mb-8">
 <h3 className="font-serif text-[22px] font-bold text-[#002E1E] mb-4">About this farmhouse stay</h3>
 <p className="text-[14px] font-medium text-gray-600 leading-relaxed whitespace-pre-line">
 {farm.description}
 </p>
 </div>

 <div className="border-t border-gray-100 my-8"></div>

 {/* Amenities Grid */}
 <div className="mb-8">
 <h3 className="font-serif text-[22px] font-bold text-[#002E1E] mb-6">What this farmhouse offers</h3>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
 {farm.amenities?.map((amenity, index) => {
 const IconComponent = AMENITY_ICONS[amenity] || CheckCircle2;
 return (
 <div key={index} className="flex items-center gap-4">
 <div className="bg-[#e6f4ea] p-2.5 rounded-full text-[#002E1E]">
 <IconComponent className="h-5 w-5 stroke-[1.5]"/>
 </div>
 <span className="text-[14px] font-bold text-gray-700">{amenity}</span>
 </div>
 );
 })}
 </div>
 </div>

 {/* Policies Accordion */}
 <div className="border border-gray-100 rounded-xl p-6 bg-white mb-10 mt-12 shadow-sm">
 <div className="flex items-center gap-3 mb-6">
 <div className="w-1 h-6 bg-[#002E1E] rounded-sm"></div>
 <h3 className="font-sans text-xl font-bold text-[#002E1E]">Policies</h3>
 </div>
 
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <button 
 onClick={() => setOpenPolicy(openPolicy === 'rules' ? null : 'rules')}
 className={`flex items-center gap-3 p-4 rounded-xl border transition-colors ${openPolicy === 'rules' ? 'border-[#002E1E] bg-gray-50' : 'border-gray-100 hover:bg-slate-50'}`}
 >
 <FileText className={`h-5 w-5 ${openPolicy === 'rules' ? 'text-[#002E1E]' : 'text-gray-500'}`}/>
 <span className={`font-bold ${openPolicy === 'rules' ? 'text-[#002E1E]' : 'text-gray-700'}`}>House Rules</span>
 </button>
 
 <button 
 onClick={() => setOpenPolicy(openPolicy === 'cancellation' ? null : 'cancellation')}
 className={`flex items-center gap-3 p-4 rounded-xl border transition-colors ${openPolicy === 'cancellation' ? 'border-red-500 bg-red-50/30' : 'border-gray-100 hover:bg-slate-50'}`}
 >
 <Ban className={`h-5 w-5 ${openPolicy === 'cancellation' ? 'text-red-500' : 'text-gray-500'}`}/>
 <span className={`font-bold ${openPolicy === 'cancellation' ? 'text-red-500' : 'text-gray-700'}`}>Cancellation Policy</span>
 </button>
 </div>
 
 {/* Expanded Content */}
 {openPolicy === 'rules' && (
 <div className="mt-6 pt-6 border-t border-gray-100 animate-fade-in">
 <div className="flex items-center gap-3 mb-6">
 <div className="w-1.5 h-5 bg-[#002E1E] rounded-sm"></div>
 <h4 className="font-sans text-lg font-bold text-[#002E1E]">House Rules</h4>
 </div>
 <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 {[
 'Check-in: 6 PM | Checkout: 5 PM',
 'No Alcohol Party',
 'No Smoking',
 'Self Cooking',
 'Self Cleaning',
 'Staircase only',
 'No Pets',
 'No Luggage Responsibility',
 'Non-veg not allowed'
 ].map((rule, idx) => (
 <li key={idx} className="flex items-center gap-3 bg-gray-50 border border-gray-100 p-4 rounded-xl">
 <div className="text-[#002E1E]/40">
 <CheckCircle2 className="h-5 w-5"/>
 </div>
 <span className="text-sm font-bold text-gray-700">{rule}</span>
 </li>
 ))}
 </ul>
 </div>
 )}
 
 {openPolicy === 'cancellation' && (
 <div className="mt-6 pt-6 border-t border-gray-100 animate-fade-in">
 <div className="flex items-center gap-3 mb-6">
 <div className="w-1.5 h-5 bg-red-500 rounded-sm"></div>
 <h4 className="font-sans text-lg font-bold text-[#002E1E]">Cancellation Policy</h4>
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
 <div className="pb-10 mb-10 border-t border-gray-100 pt-10">
 <div className="border border-gray-100 rounded-xl p-6 bg-white shadow-sm">
 <div className="flex items-center gap-3 mb-6">
 <div className="w-1.5 h-6 bg-[#002E1E] rounded-sm"></div>
 <h3 className="font-sans text-xl font-bold text-[#002E1E]">Location</h3>
 </div>
 
 <div className="relative w-full h-[350px] rounded-lg overflow-hidden bg-gray-50">
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
 <div className="bg-white border border-gray-100 rounded-3xl p-7 shadow-sm">
 
 <div className="mb-6 flex items-baseline gap-2">
 <span className="font-sans tracking-tight text-3xl font-bold text-[#002E1E]">
 ₹{(farm.pricePerNight || 3000).toLocaleString('en-IN')}
 </span>
 <span className="text-[13px] font-bold text-gray-500">/ night</span>
 </div>

 {/* Date Inputs Card */}
 <div className={`mb-6 border rounded-xl transition-all duration-200 ${hasConflict ? 'border-red-500/50 bg-red-50/50' : isInvalidDates ? 'border-amber-500/50 bg-amber-50/50' : 'border-gray-200'}`}>
 <div className="flex border-b border-gray-200">
 <div className="w-1/2 border-r border-gray-200 p-3 relative">
 <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1 tracking-wider">Check-in</label>
 <DatePicker
 selected={startDate}
 onChange={(date: Date | null) => setStartDate(date)}
 selectsStart
 startDate={startDate || undefined}
 endDate={endDate || undefined}
 minDate={new Date()}
 excludeDates={checkInExcludeDates}
 placeholderText="dd-mm-yyyy"
 className="text-[13px] font-bold text-[#002E1E] bg-transparent outline-none border-none w-full p-0 cursor-pointer placeholder:text-gray-400"
 />
 <CalendarDays className="h-3.5 w-3.5 text-[#002E1E] absolute right-3 bottom-3.5 pointer-events-none" />
 </div>
 <div className="w-1/2 p-3 relative">
 <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1 tracking-wider">Checkout</label>
 <DatePicker
 selected={endDate}
 onChange={(date: Date | null) => setEndDate(date)}
 selectsEnd
 startDate={startDate || undefined}
 endDate={endDate || undefined}
 minDate={startDate || new Date()}
 excludeDates={checkOutExcludeDates}
 placeholderText="dd-mm-yyyy"
 className="text-[13px] font-bold text-[#002E1E] bg-transparent outline-none border-none w-full p-0 cursor-pointer placeholder:text-gray-400"
 />
 <CalendarDays className="h-3.5 w-3.5 text-[#002E1E] absolute right-3 bottom-3.5 pointer-events-none" />
 </div>
 </div>
 <div 
 className="p-3 relative cursor-pointer"
 tabIndex={0}
 onBlur={(e) => {
 if (!e.currentTarget.contains(e.relatedTarget)) {
 setShowGuestDropdown(false);
 }
 }}
 >
 <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1 tracking-wider">Guests Limit</label>
 <div 
 onClick={() => setShowGuestDropdown(!showGuestDropdown)}
 className="text-[13px] font-bold text-[#002E1E] w-full flex justify-between items-center"
 >
 <span>
 {guestSelection === 0 ? 'Select guests' : `${guestSelection} guest${guestSelection > 1 ? 's' : ''}`}
 </span>
 <ChevronDown className={`w-4 h-4 text-[#002E1E] transition-transform duration-200 ${showGuestDropdown ? 'rotate-180' : ''}`} />
 </div>
 
 {showGuestDropdown && (
 <div className="absolute top-full left-0 w-full bg-white border border-gray-100 shadow-xl z-50 max-h-60 overflow-y-auto mt-2 rounded-xl">
 {[...Array(farm.guests || 6)].map((_, i) => (
 <div 
 key={i + 1}
 onClick={() => {
 setGuestSelection(i + 1);
 setShowGuestDropdown(false);
 }}
 className={`px-4 py-3 text-[13px] font-bold cursor-pointer transition-colors ${guestSelection === i + 1 ? 'bg-[#e6f4ea] text-[#002E1E]' : 'text-[#002E1E] hover:bg-gray-50'}`}
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
 <div className="mb-6 p-4 bg-red-50 text-red-800 text-xs font-bold flex items-start gap-2 border border-red-200 rounded-xl">
 <span>This estate is already reserved for the selected dates.</span>
 </div>
 )}
 {isInvalidDates && (
 <div className="mb-6 p-4 bg-amber-50 text-amber-800 text-xs font-bold flex items-start gap-2 border border-amber-200 rounded-xl">
 <span>Checkout date must be after check-in date.</span>
 </div>
 )}

 {/* Security Deposit Notice */}
 <div className="mb-6 bg-[#fffaf0] border border-[#f5a623]/60 rounded-xl p-4 flex gap-3">
 <div className="shrink-0 pt-0.5">
 <Info className="w-[18px] h-[18px] fill-[#f5a623] text-white" />
 </div>
 <div className="flex flex-col">
 <div className="flex items-center gap-2 mb-1 flex-wrap">
 <span className="font-bold text-[#333333] text-[14px]">₹5000 Security Deposit</span>
 <span className="bg-[#f5a623] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">Pay at Check-in</span>
 </div>
 <span className="text-[13px] text-gray-500 font-medium">Refunded by host if no damage</span>
 </div>
 </div>

 {/* Booking Actions */}
 <button 
 onClick={handleBooking}
 disabled={bookingLoading || hasConflict || isInvalidDates || !startDate || !endDate || guestSelection === 0}
 className="w-full bg-[#829e92] hover:bg-[#6c867a] py-3.5 rounded-[10px] text-[15px] font-bold text-white transition-colors active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed mb-4"
 >
 {bookingLoading ? 'Reserving...' : hasConflict ? 'Dates Unavailable' : 'Book Your Stay'}
 </button>
 
 <div className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-6">
 No payment charged yet
 </div>

 {/* Price Breakdown */}
 {hasValidDates && diffNights > 0 && (
 <>
 <div className="space-y-4 border-t border-gray-100 pt-6 pb-6 text-xs font-bold text-gray-500 tracking-wider">
 {priceBreakdown.map((item, index) => (
 <div key={index} className="flex justify-between">
 <span>{item.label}</span>
 <span className="text-[#002E1E]">₹{item.value.toLocaleString('en-IN')}</span>
 </div>
 ))}
 </div>

 <div className="mt-2 flex justify-between font-sans tracking-tight text-2xl font-bold text-[#002E1E]">
 <span>Total</span>
 <span>₹{grandTotal.toLocaleString('en-IN')}</span>
 </div>
 </>
 )}

 {/* Need Help Section */}
 <div className="mt-8 border-t border-gray-100 pt-6">
 <h4 className="font-sans text-[13px] font-bold text-[#002E1E] mb-4 uppercase tracking-wider">Need Help?</h4>
 <div className="space-y-3">
 <a href="tel:+918780493615"className="flex items-center gap-4 w-full p-4 bg-white border border-gray-100 rounded-xl hover:border-[#002E1E] transition-colors group hover:shadow-sm">
 <Phone className="h-5 w-5 text-[#829e92] group-hover:scale-110 transition-transform"/>
 <span className="text-[13px] font-bold text-gray-700">Call us: +91 8780493615</span>
 </a>
 <a href="https://wa.me/918780493615"target="_blank"rel="noopener noreferrer"className="flex items-center gap-4 w-full p-4 bg-white border border-gray-100 rounded-xl hover:border-[#002E1E] transition-colors group hover:shadow-sm">
 <MessageCircle className="h-5 w-5 text-[#829e92] group-hover:scale-110 transition-transform"/>
 <span className="text-[13px] font-bold text-gray-700">WhatsApp Support</span>
 </a>
 </div>
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
