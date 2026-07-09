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
 ArrowRight
} from 'lucide-react';

function StaysList() {
 const searchParams = useSearchParams();
 const initialLocation = searchParams?.get('location') || '';
 const { data: session } = useSession() || {};
 const router = useRouter();

 const [farms, setFarms] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);
 const [favorites, setFavorites] = useState<string[]>([]);

 useEffect(() => {
 async function fetchFarms() {
 try {
 const res = await fetch('/api/farms');
 if (res.ok) {
 const data = await res.json();
 if (data && data.length > 0) {
 const formatted = data.map((farm: any) => {
 const cleanTitle = farm.title || 'Premium Estate';
 const cleanRating = farm.rating || (4.5 + Math.random() * 0.5);
 const cleanAcres = farm.acres || Math.round((farm.pricePerNight / 1000) + (farm.bedrooms || 1));
 return {
 ...farm,
 rating: cleanRating,
 reviewsCount: farm.reviewsCount || Math.round(cleanRating * 30 + (farm.pricePerNight % 100)),
 acres: cleanAcres,
 guests: farm.guests || 6,
 bedrooms: farm.bedrooms || 3,
 baths: farm.baths || 2,
 amenities: farm.amenities || ['WiFi', 'Kitchen']
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

 return (
 <div className="bg-[#FAF9F6] min-h-screen">
 {/* Hero Header */}
 <div className="bg-[#1B2A22] pt-32 pb-20 px-6">
 <div className="max-w-[1280px] mx-auto text-center text-white">
 <span className="text-sm font-medium text-[#1B2A22] mb-4 block">
 Properties
 </span>
 <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-normal leading-tight">
 Our Properties
 </h1>
 <p className="mt-6 text-white/70 max-w-lg mx-auto font-medium text-sm">
 Discover our selection of private properties, designed for ultimate privacy and great experiences.
 </p>
 </div>
 </div>

 <div className="max-w-[1280px] mx-auto px-6 md:px-16 py-20">
 {/* Stays Grid */}
 {loading ? (
 <div className="flex flex-col items-center justify-center py-32 gap-4">
 <div className="h-10 w-10 animate-spin border-t-2 border-[#1B2A22] rounded-full"></div>
 <p className="text-sm font-medium text-[#1B2A22]/60 font-bold">Loading Properties...</p>
 </div>
 ) : farms.length === 0 ? (
 <div className="text-center py-32 border-y border-[#1B2A22]/10 max-w-2xl mx-auto">
 <h3 className="font-serif text-2xl text-[#1B2A22] mb-4">No properties available</h3>
 <p className="text-[#1B2A22]/60 font-medium">Our properties list is currently being updated. Please check back later.</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
 {farms.map((farm) => {
 const isFav = favorites.includes(farm._id);
 return (
 <Link
 key={farm._id}
 href={`/farms/${farm._id}`}
 className="group flex flex-col cursor-pointer bg-white rounded-xl border border-[#eeedf7] hover:shadow-md transition-shadow overflow-hidden"
 >
 
 {/* Photo & Badge Overlay */}
 <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
 <img
 src={farm.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'}
 alt={farm.title}
 className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-105"
 onError={(e) => {
 (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';
 }}
 />

 {/* Featured Badge */}
 <div className="absolute top-4 left-4 bg-[#00a877] text-white px-3 py-1 rounded-full text-sm font-medium">
 Featured
 </div>

 {/* Favorite Button */}
 <button 
 onClick={(e) => toggleFavorite(farm._id, e)}
 className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-2 rounded-full text-[#1B2A22]/50 hover:text-red-500 transition-colors shadow-sm"
 >
 <Heart className={`h-4 w-4 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
 </button>
 </div>

 {/* Estate details */}
 <div className="flex flex-col flex-grow p-5">
 {/* Location */}
 <div className="flex items-center gap-1.5 text-xs text-[#1B2A22]/50 font-medium mb-3">
 <MapPin className="h-3.5 w-3.5"/>
 <span>{farm.location?.startsWith('http') ? 'Map Link Available' : farm.location}</span>
 </div>

 {/* Title */}
 <h3 className="font-serif text-2xl text-[#1B2A22] font-normal mb-4 leading-snug group-hover:text-[#00a877] transition-colors">
 {farm.title}
 </h3>
 
 {/* Amenities Tags */}
 <div className="flex flex-wrap gap-2 mb-5">
 {(farm.amenities?.length ? farm.amenities : ['WiFi', 'Swimming Pool', 'Garden', 'Kitchen', 'Parking']).slice(0, 5).map((amenity: string, index: number) => (
 <span key={index} className="bg-[#fbf8ff] border border-[#eeedf7] text-[#1B2A22]/70 text-sm font-medium font-bold px-2 py-1 rounded-md whitespace-nowrap">
 {amenity}
 </span>
 ))}
 </div>

 {/* Divider */}
 <div className="border-t border-[#eeedf7] my-2"></div>

 {/* Footer: Price & Guests */}
 <div className="flex items-center justify-between mt-auto pt-3">
 <div className="text-[#1B2A22]">
 <span className="text-lg font-bold">₹{(farm.pricePerNight || 3000).toLocaleString('en-IN')}</span>
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
 <p className="text-sm font-medium text-[#1B2A22]/60 font-bold">Loading Properties...</p>
 </div>
 }>
 <StaysList />
 </Suspense>
 );
}
