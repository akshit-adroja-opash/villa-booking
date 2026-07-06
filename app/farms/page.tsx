'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  Search, 
  MapPin, 
  Users, 
  Heart, 
  Bed, 
  Compass, 
  SlidersHorizontal,
  ChevronDown,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';


const ALL_AMENITIES = [
  'WiFi', 'Swimming Pool', 'Garden', 'Kitchen', 'Parking',
  'Hot Tub', 'Fireplace', 'Beach Access', 'Tea Tasting',
  'Plantation Walk', 'Yoga Deck', 'River View', 'Fruit Picking'
];

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
              const cleanTitle = farm.title || 'Premium Farmhouse';
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
      alert('Please sign in to save farmhouses to your favorites.');
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
        const errorData = await res.json();
        alert(errorData.error || 'Failed to toggle favorite.');
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      alert('Failed to update favorites.');
    }
  };

  // Simplified list for single-owner portfolio
  const currentFarms = farms;

  return (
    <div className="max-w-[1280px] mx-auto px-6 md:px-16 pt-28 pb-16">
      
      {/* Title */}
      <h1 className="font-serif text-3xl font-semibold text-[#003527] mb-10">
        Our Properties
      </h1>

      {/* Stays Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#003527] border-t-transparent"></div>
          <p className="text-sm text-[#404944] font-semibold">Loading properties...</p>
        </div>
      ) : currentFarms.length === 0 ? (
        <div className="text-center py-20 bg-white border border-[#bfc9c3]/15 rounded-2xl p-8 max-w-md mx-auto shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No properties available</h3>
          <p className="text-secondary text-sm mb-6">We couldn't load the properties right now.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentFarms.map((farm) => {
              const isFav = favorites.includes(farm._id);
              return (
                <Link
                  key={farm._id}
                  href={`/farms/${farm._id}`}
                  className="bg-white rounded-2xl overflow-hidden border border-[#bfc9c3]/15 shadow-sm hover-lift group cursor-pointer flex flex-col h-full"
                >
                  
                  {/* Photo & Badge Overlay */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                    <img
                      src={farm.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'}
                      alt={farm.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* Favorite Button */}
                    <button 
                      onClick={(e) => toggleFavorite(farm._id, e)}
                      className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full border border-gray-100 shadow-sm text-gray-500 hover:text-red-500 transition-colors"
                    >
                      <Heart className={`h-4 w-4 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
                    </button>


                  </div>

                  {/* Staying info details */}
                  <div className="p-6 flex flex-col flex-grow">
                    
                    {/* Location */}
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 mb-2">
                      <MapPin className="h-3.5 w-3.5 text-[#10b981]" />
                      <span>{farm.location}</span>
                    </div>

                    {/* Title */}
                    <h3 className="font-serif text-lg font-semibold text-[#1a1b22] group-hover:text-[#003527] transition-colors mb-3">
                      {farm.title}
                    </h3>
                    
                    {/* Size icons (Beds, Guests, Acres) */}
                    <div className="grid grid-cols-3 gap-2 py-3 border-y border-[#bfc9c3]/15 mb-4 text-xs font-semibold text-[#404944]">
                      <div className="flex items-center gap-1.5">
                        <Bed className="h-4 w-4 text-gray-400" />
                        <span>{farm.bedrooms || 3} beds</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>{farm.guests || 6} guests</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Compass className="h-4 w-4 text-gray-400" />
                        <span>{farm.acres || 5} Acres</span>
                      </div>
                    </div>

                    {/* Amenities Tag badges */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {farm.amenities?.slice(0, 3).map((amenity: string, idx: number) => (
                        <span key={idx} className="text-[10px] font-bold text-[#404944] bg-[#e3e1ec]/30 px-2 py-0.5 rounded border border-[#bfc9c3]/20">
                          {amenity}
                        </span>
                      ))}
                      {farm.amenities?.length > 3 && (
                        <span className="text-[10px] font-bold text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                          +{farm.amenities.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Price and Action */}
                    <div className="flex items-center justify-between pt-3 border-t border-[#bfc9c3]/15 mt-auto">
                      <div>
                        <span className="text-lg font-bold text-[#003527]">
                          ₹{(farm.pricePerNight || 3000).toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-gray-500 font-normal">/night</span>
                      </div>
                      <span className="text-xs font-bold text-[#003527] group-hover:underline flex items-center gap-1">
                        Details
                      </span>
                    </div>

                  </div>
                </Link>
              );
            })}
          </div>

        </>
      )}

    </div>
  );
}

export default function FarmsListingPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-40 gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#003527] border-t-transparent"></div>
        <p className="text-sm text-[#404944] font-semibold">Initializing retreats search...</p>
      </div>
    }>
      <StaysList />
    </Suspense>
  );
}