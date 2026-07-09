'use client';
import toast from 'react-hot-toast';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
 ArrowRight,
 Heart,
 Star,
 MapPin,
 ChevronRight,
 PhoneCall,
 ArrowUpRight,
 Wind,
 Coffee,
 ShieldCheck
} from 'lucide-react';

export default function Home() {
 const { data: session } = useSession() || {};
 const router = useRouter();
 const [farms, setFarms] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);
 const [favorites, setFavorites] = useState<string[]>([]);
 const [currentSlide, setCurrentSlide] = useState(0);

 const heroImages = farms.length > 0 
 ? farms.filter(f => f.images && f.images.length > 0).map(f => f.images[0]).slice(0, 5)
 : [
 "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1920&q=80",
 "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1920&q=80",
 "https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=1920&q=80"
 ];

 useEffect(() => {
 const timer = setInterval(() => {
 setCurrentSlide((prev) => (prev >= heroImages.length - 1 ? 0 : prev + 1));
 }, 6000);
 return () => clearInterval(timer);
 }, [heroImages.length]);

 useEffect(() => {
 async function fetchFarms() {
 try {
 const res = await fetch('/api/farms');
 if (res.ok) {
 const data = await res.json();
 if (data && data.length > 0) {
 setFarms(data);
 }
 }
 } catch (err) {
 console.error('Failed to fetch from API:', err);
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
 <div className="bg-[#FAF9F6] text-[#1B2A22] min-h-screen">
 
 {/* Hero Section */}
 <section className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden">
  <div className="absolute inset-0 z-0">
    {heroImages.map((src, idx) => (
      <div 
        key={idx} 
        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${currentSlide === idx ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
      >
        <img
          alt={`Estate View ${idx + 1}`}
          className={`w-full h-full object-cover brightness-[0.6] transition-transform duration-[6000ms] ease-out ${currentSlide === idx ? 'scale-100' : 'scale-105'}`}
          src={src}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1B2A22]/80 via-transparent to-transparent"></div>
      </div>
    ))}
  </div>

 {/* Hero Content */}
 <div className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center mt-20">
 <span className="text-sm font-medium tracking-[0.3em] font-bold text-[#1B2A22] mb-6 animate-fade-in">
 Exclusive Farmhouses
 </span>
 <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-normal text-white leading-tight mb-8 drop-shadow-lg">
 Explore Best Farmhouse
 </h1>
 <p className="text-white/80 text-sm md:text-base font-medium max-w-lg mb-10 leading-relaxed">
 Discover our collection of private farmhouses, where luxury meets absolute tranquility.
 </p>
 <Link 
 href="/farms"
 className="group relative px-8 py-4 bg-white text-[#1B2A22] text-sm font-medium overflow-hidden transition-all hover:bg-[#1B2A22] hover:text-white"
 >
 <span className="relative z-10 flex items-center gap-2">
 View Farmhouses <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1"/>
 </span>
 </Link>
 </div>

 {/* Carousel Indicators */}
 <div className="absolute bottom-12 left-0 right-0 z-20 flex justify-center gap-4">
 {heroImages.map((_, idx) => (
 <button
 key={idx}
 onClick={() => setCurrentSlide(idx)}
 className={`h-[1px] transition-all duration-500 ${currentSlide === idx ? 'w-12 bg-[#1B2A22]' : 'w-6 bg-white/40 hover:bg-white/70'}`}
 aria-label={`Go to slide ${idx + 1}`}
 />
 ))}
 </div>
 </section>

 {/* The Collection (Editorial Layout) */}
 <section className="py-20 bg-white">
 <div className="max-w-[1280px] mx-auto px-6 md:px-16">
 <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
 <div>
 <span className="text-sm font-medium text-[#1B2A22] mb-3 block">
 Farmhouses
 </span>
 <h2 className="font-serif text-4xl text-[#1B2A22]">Our Farmhouses</h2>
 </div>
 <Link href="/farms"className="text-sm font-medium text-[#1B2A22] flex items-center gap-2 hover:text-[#1B2A22] transition-colors border-b border-[#1B2A22] hover:border-[#1B2A22] pb-1">
 View All Farmhouses <ArrowRight className="h-3 w-3"/>
 </Link>
 </div>

 {loading ? (
 <div className="flex flex-col items-center justify-center py-32 gap-4">
 <div className="h-10 w-10 animate-spin border-t-2 border-[#1B2A22] rounded-full"></div>
 <p className="text-sm font-medium text-[#1B2A22]/60 font-bold">Loading Farmhouses...</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
 {farms.slice(0, 3).map((farm) => {
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
 <span key={index} className="bg-[#fbf8ff] border border-[#eeedf7] text-[#1B2A22]/70 text-xs font-medium px-2 py-0.5 rounded-md whitespace-nowrap">
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
 </section>

 {/* Footer CTA */}
 <section className="py-0">
 <div className="bg-white border-t border-[#1B2A22]/10 py-32 px-6 relative overflow-hidden text-center flex flex-col items-center gap-8">
 <div className="absolute inset-0 z-0 opacity-[0.03]"style={{ backgroundImage: 'radial-gradient(circle at center, #1B2A22 0%, transparent 70%)' }}></div>
 
 <div className="relative z-10">
 <span className="text-sm font-medium text-[#00a877] mb-6 block">
 Contact Us
 </span>
 <h2 className="font-serif text-4xl md:text-5xl text-[#1B2A22] font-normal leading-tight mb-6">
 Begin Your Journey
 </h2>
 <p className="text-[#1B2A22]/70 font-serif text-lg max-w-md mx-auto mb-10">
 Speak with our support team to arrange your private viewing or secure your booking.
 </p>

 <div className="flex flex-col sm:flex-row gap-6 justify-center">
 <Link 
 href="/farms"
 className="bg-[#1B2A22] text-white hover:bg-[#00a877] px-10 py-4 text-sm font-medium transition-colors"
 >
 View Farmhouses
 </Link>
 <Link 
 href="/contact"
 className="bg-transparent border border-[#1B2A22]/30 hover:border-[#1B2A22] text-[#1B2A22] px-10 py-4 text-sm font-medium transition-colors"
 >
 Contact Support
 </Link>
 </div>
 </div>
 </div>
 </section>

 </div>
 );
}
