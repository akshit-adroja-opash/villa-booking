'use client';
import toast from 'react-hot-toast';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
 MapPin, 
 Users, 
 Heart, 
 Bed, 
 Compass, 
 ArrowRight,
 Search,
 ChevronDown,
 SlidersHorizontal,
 Star
} from 'lucide-react';

function StaysList() {
 const searchParams = useSearchParams();
 const initialLocation = searchParams?.get('location') || '';
 const { data: session } = useSession() || {};
 const router = useRouter();

 const [farms, setFarms] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);
 const [favorites, setFavorites] = useState<string[]>([]);
 const [searchQuery, setSearchQuery] = useState('');
 const [sortOption, setSortOption] = useState('Most Popular');
 const [isSortOpen, setIsSortOpen] = useState(false);
 
 const sortOptions = ['Most Popular', 'Price: Low to High', 'Price: High to Low'];

 useEffect(() => {
 async function fetchFarms() {
 try {
 const res = await fetch('/api/farms');
 if (res.ok) {
 const data = await res.json();
 if (data && data.length > 0) {
 const formatted = data.map((farm: any) => {
 const cleanTitle = farm.title || 'Premium Estate';
 const cleanRating = farm.rating === 4.8 && farm._id ? (4.5 + (parseInt(farm._id.slice(-4), 16) % 6) / 10).toFixed(1) : Number(farm.rating || 4.5).toFixed(1);
 const cleanAcres = farm.acres || Math.round((farm.pricePerNight / 1000) + (farm.bedrooms || 1));
 return {
 ...farm,
 rating: cleanRating,
 reviewsCount: farm.reviewsCount || Math.round(Number(cleanRating) * 30 + (farm.pricePerNight % 100)),
 acres: cleanAcres,
 guests: farm.guests || 6,
 bedrooms: farm.bedrooms || 3,
 baths: farm.baths || 2,
 amenities: farm.amenities || []
 };
 });

 setFarms(formatted);
 } else {
 setFarms([]);
 }
 } else {
 setFarms([]);
 }
 } catch (err) {
 console.error('Failed fetching farms from API:', err);
 setFarms([]);
 } finally {
 setLoading(false);
 }
 }
 fetchFarms();
 }, []);

 useEffect(() => {
 async function fetchFavorites() {
 if (session?.user) {
 try {
 const userId = (session.user as any).id;
 const res = await fetch(`/api/users/favorites?userId=${userId}`);
 if (res.ok) {
 const data = await res.json();
 setFavorites(data.map((fav: any) => fav._id));
 }
 } catch (err) {
 console.error('Failed to fetch favorites:', err);
 }
 }
 }
 fetchFavorites();
 }, [session]);

 const toggleFavorite = async (id: string, e: React.MouseEvent) => {
 e.preventDefault();
 e.stopPropagation();
 if (!session?.user) {
 toast.error('Please sign in to save estates to your collection.');
 router.push('/login');
 return;
 }
 try {
 const userId = (session.user as any).id;
 const res = await fetch('/api/users/favorites', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ userId, farmId: id })
 });
 if (res.ok) {
 const data = await res.json();
 setFavorites(data.favorites);
 } else {
 toast.error('Failed to toggle favorite.');
 }
 } catch (err) {
 toast.error('Failed to update favorites.');
 }
 };

 const filteredFarms = farms.filter(farm => {
 if (!searchQuery) return true;
 const term = searchQuery.toLowerCase();
 return farm.title?.toLowerCase().includes(term) || farm.location?.toLowerCase().includes(term);
 }).sort((a, b) => {
 if (sortOption === 'Price: Low to High') {
 return (a.pricePerNight || 0) - (b.pricePerNight || 0);
 } else if (sortOption === 'Price: High to Low') {
 return (b.pricePerNight || 0) - (a.pricePerNight || 0);
 }
 return 0;
 });

 return (
 <div className="bg-[#FAF9F6] min-h-screen">
 
 {/* Hero Section */}
 <section className="pt-40 pb-16 px-6 max-w-[1280px] mx-auto text-center">
 <h1 className="font-serif text-5xl md:text-7xl font-bold text-[#002E1E] tracking-tight mb-4">
 Our <span className="text-[#00a877]">Farmhouses</span>
 </h1>
 <p className="text-gray-500 font-medium text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
 Discover our curated selection of premium farmhouses. Find your perfect escape from the city.
 </p>
 </section>

 <div className="max-w-[1280px] mx-auto px-6 md:px-16 pb-20">
 
 {/* Header & Search */}
 <div className="mb-8">
 <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
 <div className="flex-1 relative flex items-center w-full">
 <Search className="w-5 h-5 text-gray-400 absolute left-4" />
 <input 
 type="text" 
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 placeholder="Search by location, city, or name..." 
 className="w-full h-[52px] pl-12 pr-4 rounded-lg border border-gray-200 focus:outline-none focus:border-[#002E1E]/30 text-sm bg-white" 
 />
 </div>
 <div className="flex items-center gap-4 w-full md:w-auto">
 <div className="relative w-full">
 <button 
 onClick={() => setIsSortOpen(!isSortOpen)}
 className="flex h-[52px] items-center justify-between w-full bg-white border border-gray-200 rounded-xl px-5 text-[14px] font-bold text-[#002E1E] focus:outline-none focus:border-[#00a877] cursor-pointer min-w-[190px] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all hover:border-gray-300 group"
 >
 <span>{sortOption}</span>
 <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${isSortOpen ? 'bg-[#e6f4ea] text-[#00a877]' : 'bg-gray-50 text-gray-500 group-hover:bg-[#e6f4ea] group-hover:text-[#00a877]'}`}>
 <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isSortOpen ? 'rotate-180' : ''}`} />
 </div>
 </button>

 {isSortOpen && (
 <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] py-2 z-50 overflow-hidden">
 {sortOptions.map((option) => (
 <button
 key={option}
 onClick={() => {
 setSortOption(option);
 setIsSortOpen(false);
 }}
 className={`w-full text-left px-5 py-2.5 text-[14px] font-semibold transition-colors ${
 sortOption === option 
 ? 'bg-[#e6f4ea] text-[#00a877]' 
 : 'text-gray-600 hover:bg-gray-50'
 }`}
 >
 {option}
 </button>
 ))}
 </div>
 )}
 
 {/* Overlay to close dropdown when clicking outside */}
 {isSortOpen && (
 <div 
 className="fixed inset-0 z-40" 
 onClick={() => setIsSortOpen(false)}
 ></div>
 )}
 </div>
 </div>
 </div>
 <p className="text-sm text-gray-500 font-medium">{filteredFarms.length} farmhouses found</p>
 </div>

 {/* Stays Grid */}
 {loading ? (
 <div className="flex flex-col items-center justify-center py-32 gap-4">
 <div className="h-10 w-10 animate-spin border-t-2 border-[#1B2A22] rounded-full"></div>
 <p className="text-sm font-medium text-[#1B2A22]/60 font-bold">Loading Farmhouses...</p>
 </div>
 ) : filteredFarms.length === 0 ? (
 <div className="text-center py-32 border-y border-[#1B2A22]/10 max-w-2xl mx-auto">
 <h3 className="font-serif text-2xl text-[#1B2A22] mb-4">No farmhouses available</h3>
 <p className="text-[#1B2A22]/60 font-medium">Try adjusting your search filters to find more properties.</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
 {filteredFarms.map((farm) => {
 const isFav = favorites.includes(farm._id);
 const amenities = farm.amenities || [];
 const displayAmenities = amenities.slice(0, 3);
 const extraAmenities = amenities.length - 3;
 
 return (
 <Link
 key={farm._id}
 href={`/farms/${farm._id}`}
 className="group flex flex-col cursor-pointer bg-white rounded-2xl border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden p-2.5"
 >
 
 {/* Photo & Badge Overlay */}
 <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-gray-100 mb-4">
 <img
 src={farm.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'}
 alt={farm.title}
 className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-105"
 onError={(e) => {
 (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';
 }}
 />

 {/* Rating Badge */}
 <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm text-[12px] font-bold text-[#1B2A22]">
 <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
 {farm.rating || 4.5}
 </div>

 {/* Favorite Button */}
 <button 
 onClick={(e) => toggleFavorite(farm._id, e)}
 className="absolute top-4 right-4 text-white drop-shadow-md hover:scale-110 transition-transform active:scale-95 cursor-pointer z-10"
 >
 <Heart className={`h-6 w-6 ${isFav ? 'fill-red-500 text-red-500' : 'fill-black/20'}`} />
 </button>
 </div>

 {/* Estate details */}
 <div className="flex flex-col flex-grow px-2 pb-2">
 {/* Location */}
 <div className="flex items-center gap-1.5 text-xs font-medium mb-2.5">
 <MapPin className="h-3.5 w-3.5 text-[#00a877] shrink-0"/>
 <span className="text-gray-500 line-clamp-1">
 {farm.mapLink || farm.location?.startsWith('http') ? (
 <button 
 onClick={(e) => {
 e.preventDefault();
 e.stopPropagation();
 window.open(farm.mapLink || farm.location, '_blank', 'noopener,noreferrer');
 }}
 className="hover:text-[#00a877] underline underline-offset-2 transition-colors cursor-pointer text-left"
 >
 {farm.location?.startsWith('http') ? 'View on Map' : farm.location}
 </button>
 ) : (
 farm.location
 )}
 </span>
 </div>

 {/* Title */}
 <h3 className="font-sans text-[19px] text-[#1B2A22] font-bold mb-4 leading-snug group-hover:text-[#00a877] transition-colors">
 {farm.title}
 </h3>
 
 {/* Stats: beds, guests, acres */}
 <div className="flex items-center gap-4 text-[13px] font-medium text-gray-500 mb-5">
 <span className="flex items-center gap-1.5"><Bed className="w-4 h-4" /> {farm.bedrooms || 3} beds</span>
 <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {farm.guests || 6} guests</span>
 <span className="flex items-center gap-1.5"><Compass className="w-4 h-4" /> {farm.acres || 8} Acres</span>
 </div>

 {/* Amenities Tags */}
 <div className="flex flex-wrap gap-2 mb-4">
 {displayAmenities.map((amenity: string, index: number) => (
 <span key={index} className="bg-gray-50 border border-gray-100 text-gray-600 text-[11px] font-medium px-2 py-1 rounded-md whitespace-nowrap">
 {amenity}
 </span>
 ))}
 {extraAmenities > 0 && (
 <span className="bg-gray-50 border border-gray-100 text-gray-600 text-[11px] font-medium px-2 py-1 rounded-md whitespace-nowrap">
 +{extraAmenities}
 </span>
 )}
 </div>

 {/* Divider */}
 <div className="border-t border-gray-100 mt-auto mb-4"></div>

 {/* Footer: Price & Details */}
 <div className="flex items-center justify-between">
 <div className="text-[#002E1E]">
 <span className="text-[18px] font-bold">
 {farm.pricePerNight ? `₹${farm.pricePerNight.toLocaleString('en-IN')}` : 'Price N/A'}
 </span>
 {farm.pricePerNight && <span className="text-[13px] font-medium text-gray-400 ml-0.5">/night</span>}
 </div>
 <span className="text-[13px] font-bold text-[#002E1E] group-hover:underline">
 Details
 </span>
 </div>
 </div>
 </Link>
 );
 })}
 </div>
 )}
 </div>
 </div>
 );
}

export default function FarmsListingPage() {
 return (
 <Suspense fallback={
 <div className="flex flex-col items-center justify-center min-h-screen bg-[#FAF9F6] gap-4">
 <div className="h-10 w-10 animate-spin border-t-2 border-[#1B2A22] rounded-full"></div>
 <p className="text-sm font-medium text-[#1B2A22]/60 font-bold">Loading Farmhouses...</p>
 </div>
 }>
 <StaysList />
 </Suspense>
 );
}
