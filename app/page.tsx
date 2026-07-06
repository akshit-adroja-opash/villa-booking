'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  MapPin, 
  Users, 
  Star, 
  Heart, 
  ArrowRight,
  ShieldCheck,
  PhoneCall,
  Clock,
  CircleDollarSign,
  CalendarCheck2,
  Smile,
  Compass,
  ArrowUpRight
} from 'lucide-react';

export default function Home() {
  const { data: session } = useSession() || {};
  const router = useRouter();
  const [farms, setFarms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLocation, setSearchLocation] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === 2 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function fetchFarms() {
      try {
        const res = await fetch('/api/farms');
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            const formattedFarms = data.map((farm: any) => ({
              ...farm,
              rating: farm.rating || 4.5 + Math.random() * 0.5,
              guests: farm.guests || 6,
              bedrooms: farm.bedrooms || 3,
              baths: farm.baths || 2,
              category: farm.category || 'farmhouse',
              amenities: farm.amenities || ['WiFi', 'Kitchen']
            }));
            setFarms(formattedFarms);
          } else {
            setFarms([]);
          }
        } else {
          setFarms([]);
        }
      } catch (err) {
        console.error('Failed to fetch from API:', err);
        setFarms([]);
      } finally {
        setLoading(false);
      }
    }
    fetchFarms();
  }, []);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch('/api/reviews');
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setReviews(data);
          } else {
            // Fallback for an empty database
            setReviews([
              {
                name: 'Priya Sharma',
                role: 'Family Vacation',
                text: 'Our stay was absolutely memorable. The farmhouse was exactly as described, and the direct support from the owners was wonderful!',
                img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
                rating: 5
              },
              {
                name: 'Rajesh Kumar',
                role: 'Weekend Getaway',
                text: 'A beautifully maintained private estate. Booking directly with them was seamless, and the on-site staff made sure everything was perfect.',
                img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
                rating: 5
              },
              {
                name: 'Ankit Verma',
                role: 'Corporate Retreat',
                text: "We hosted our team retreat here. The privacy, premium amenities, and excellent hospitality make their properties our top choice.",
                img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
                rating: 5
              }
            ]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch reviews:', err);
      }
    }
    fetchReviews();
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchLocation.trim()) {
      router.push(`/farms?location=${encodeURIComponent(searchLocation.trim())}`);
    } else {
      router.push('/farms');
    }
  };

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

  return (
    <div className="bg-[#fdfbf7] text-[#1a1b22] pt-16">
      
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[580px] flex items-center justify-center bg-[#f4f2fd]/50 overflow-hidden">
        <div 
          className="absolute inset-0 z-0 flex transition-transform duration-1000 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {[
            "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1920&q=80",
            "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=1920&q=80",
            "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1920&q=80"
          ].map((src, idx) => (
            <div key={idx} className="min-w-full h-full relative">
              <img
                alt={`Scenic farmhouse background ${idx + 1}`}
                className="w-full h-full object-cover brightness-[0.85]"
                src={src}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent"></div>
            </div>
          ))}
        </div>

        {/* Carousel Indicators */}
        <div className="absolute bottom-10 left-0 right-0 z-20 flex justify-center gap-3">
          {[0, 1, 2].map((idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 ${currentSlide === idx ? 'w-8 bg-white' : 'w-2.5 bg-white/50'}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Featured Farmhouses Section */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-16 py-20">
        <div className="mb-10 flex justify-between items-end">
          <div>
            <h2 className="font-serif text-3xl font-semibold text-[#003527]">Our Properties</h2>
            <p className="text-sm text-[#404944] mt-1.5 font-medium">Discover our exclusive collection of private farmhouses.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#003527] border-t-transparent"></div>
            <p className="text-sm text-[#404944] font-semibold">Loading stays...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {farms.slice(0, 5).map((farm) => {
              const isFav = favorites.includes(farm._id);
              return (
                <Link
                  key={farm._id}
                  href={`/farms/${farm._id}`}
                  className="bg-white rounded-2xl overflow-hidden border border-[#bfc9c3]/15 shadow-sm hover-lift group cursor-pointer flex flex-col h-full"
                >
                  {/* Image & Badges */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                    <img
                      src={farm.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'}
                      alt={farm.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    
                    {/* Featured Tag */}
                    <div className="absolute top-4 left-4 bg-[#10b981] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
                      Featured
                    </div>

                    {/* Favorite Heart Button */}
                    <button 
                      onClick={(e) => toggleFavorite(farm._id, e)}
                      className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full border border-gray-100 shadow-sm text-gray-500 hover:text-red-500 transition-colors"
                    >
                      <Heart className={`h-4 w-4 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
                    </button>

                  </div>

                  {/* Info details */}
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 mb-2">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      <span>{farm.location}</span>
                    </div>

                    <h3 className="font-serif text-lg font-semibold text-[#1a1b22] group-hover:text-[#003527] transition-colors mb-2">
                      {farm.title}
                    </h3>
                    
                    {/* Amenities tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {farm.amenities?.map((amenity: string, idx: number) => (
                        <span key={idx} className="text-[10px] font-bold text-[#404944] bg-[#e3e1ec]/30 px-2 py-0.5 rounded border border-[#bfc9c3]/20">
                          {amenity}
                        </span>
                      ))}
                    </div>

                    {/* Price & guest count */}
                    <div className="flex items-center justify-between pt-4 border-t border-[#bfc9c3]/15 mt-auto">
                      <div>
                        <span className="text-lg font-bold text-[#003527]">
                          ₹{(farm.pricePerNight || 3000).toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-gray-500 font-normal"> / night</span>
                      </div>
                      <span className="text-[11px] font-semibold text-[#404944] bg-[#bfc9c3]/10 px-2.5 py-1 rounded-md">
                        {farm.guests || 6} guests
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>





      {/* Testimonials */}
      <section className="bg-[#f7f5ef] border-t border-[#bfc9c3]/20 py-20">
        <div className="max-w-[1280px] mx-auto px-6 md:px-16">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="font-serif text-3xl font-semibold text-[#003527]">What Our Guests Say</h2>
            <p className="text-sm text-[#404944] mt-2 font-medium">Real reviews from real guests.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.slice(0, 3).map((test, idx) => (
              <div key={test._id || idx} className="bg-white rounded-2xl p-8 border border-[#bfc9c3]/15 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex gap-0.5 text-yellow-500 mb-4">
                    {[...Array(test.rating || 5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-500" />
                    ))}
                  </div>
                  <p className="text-sm text-[#404944] leading-relaxed italic font-medium">
                    "{test.text}"
                  </p>
                </div>

                <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-100">
                  <img src={test.img} alt={test.name} className="h-10 w-10 rounded-full object-cover" />
                  <div>
                    <h4 className="text-sm font-bold text-[#1a1b22]">{test.name}</h4>
                    <p className="text-[10px] text-gray-500 font-semibold">{test.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-16 py-20">
        <div className="bg-[#003527] text-white rounded-3xl p-10 md:p-16 relative overflow-hidden text-center flex flex-col items-center gap-6 shadow-lg shadow-[#064e3b]/10">
          <div className="absolute inset-0 z-0">
            <div className="absolute top-[-50%] left-[-20%] w-[800px] h-[800px] rounded-full bg-[#064e3b] opacity-20 blur-3xl"></div>
            <div className="absolute bottom-[-50%] right-[-20%] w-[800px] h-[800px] rounded-full bg-[#10b981]/20 opacity-20 blur-3xl"></div>
          </div>

          <div className="relative z-10 flex flex-col items-center gap-4">
            <h2 className="font-serif text-3xl font-normal leading-tight max-w-xl">
              Ready for Your Farmhouse Adventure?
            </h2>
            <p className="text-sm text-emerald-200 max-w-md font-medium">
              Experience ultimate luxury and privacy. Book your stay at our exclusive farmhouses today.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <Link 
                href="/farms" 
                className="bg-white text-[#003527] hover:bg-emerald-50 px-8 py-3.5 rounded-full font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                <span>Book Your Stay</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <a 
                href="tel:+919876543210"
                className="bg-transparent border border-white/30 hover:border-white/60 text-white px-8 py-3.5 rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <PhoneCall className="h-4 w-4" />
                <span>+91 98765 43210</span>
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
