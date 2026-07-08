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
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#D4AF37] mb-4 block">
            Portfolio
          </span>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-normal leading-tight">
            The Collection
          </h1>
          <p className="mt-6 text-white/70 max-w-lg mx-auto font-medium text-sm">
            Discover our curated selection of ultra-luxury private estates, designed for ultimate privacy and unforgettable experiences.
          </p>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 md:px-16 py-20">
        {/* Stays Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="h-10 w-10 animate-spin border-t-2 border-[#D4AF37] rounded-full"></div>
            <p className="text-[11px] uppercase tracking-widest text-[#1B2A22]/60 font-bold">Curating Collection...</p>
          </div>
        ) : farms.length === 0 ? (
          <div className="text-center py-32 border-y border-[#1B2A22]/10 max-w-2xl mx-auto">
            <h3 className="font-serif text-2xl text-[#1B2A22] mb-4">No estates available</h3>
            <p className="text-[#1B2A22]/60 font-medium">Our portfolio is currently being updated. Please check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-x-12 gap-y-16">
            {farms.map((farm) => {
              const isFav = favorites.includes(farm._id);
              return (
                <Link
                  key={farm._id}
                  href={`/farms/${farm._id}`}
                  className="group flex flex-col cursor-pointer"
                >
                  
                  {/* Photo & Badge Overlay */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden mb-6 bg-gray-100 border border-[#1B2A22]/5">
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
                      className="absolute top-5 right-5 bg-white/20 backdrop-blur-md p-2.5 rounded-full border border-white/30 text-white hover:bg-white hover:text-red-500 transition-all duration-300"
                    >
                      <Heart className={`h-4.5 w-4.5 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
                    </button>
                  </div>

                  {/* Estate details */}
                  <div className="flex flex-col flex-grow px-2">
                    {/* Location */}
                    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] font-bold text-[#D4AF37] mb-3">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{farm.location}</span>
                    </div>

                    {/* Title & Price */}
                    <div className="flex justify-between items-start gap-4 mb-4">
                      <h3 className="font-serif text-2xl text-[#1B2A22] group-hover:opacity-70 transition-opacity leading-snug">
                        {farm.title}
                      </h3>
                      <div className="text-right shrink-0 mt-1">
                        <span className="block text-lg font-serif text-[#1B2A22]">
                          ₹{(farm.pricePerNight || 3000).toLocaleString('en-IN')}
                        </span>
                        <span className="block text-[10px] uppercase tracking-wider text-[#1B2A22]/50 font-bold">
                          per night
                        </span>
                      </div>
                    </div>
                    
                    {/* Size icons (Beds, Guests, Acres) */}
                    <div className="flex gap-6 pb-5 border-b border-[#1B2A22]/10 mb-5 text-[11px] font-semibold text-[#1B2A22]/70 uppercase tracking-wide">
                      <div className="flex items-center gap-2">
                        <Bed className="h-4 w-4 text-[#D4AF37]" />
                        <span>{farm.bedrooms || 3} beds</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-[#D4AF37]" />
                        <span>{farm.guests || 6} guests</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Compass className="h-4 w-4 text-[#D4AF37]" />
                        <span>{farm.acres || 5} Acres</span>
                      </div>
                    </div>

                    {/* Footer / Action */}
                    <div className="flex items-center justify-between mt-auto text-[11px] uppercase tracking-widest font-bold text-[#1B2A22] group-hover:text-[#D4AF37] transition-colors">
                      <span className="flex items-center gap-1.5">
                        Discover Estate
                      </span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
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
        <div className="h-10 w-10 animate-spin border-t-2 border-[#D4AF37] rounded-full"></div>
        <p className="text-[11px] uppercase tracking-widest text-[#1B2A22]/60 font-bold">Initializing The Collection...</p>
      </div>
    }>
      <StaysList />
    </Suspense>
  );
}