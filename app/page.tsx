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
  const [reviews, setReviews] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroImages = [
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1920&q=80", // Luxury Estate
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1920&q=80", // Mansion interior
    "https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=1920&q=80"  // Estate landscape
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === heroImages.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(timer);
  }, []);

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
                name: 'Eleanor Vance',
                role: 'Private Retreat',
                text: 'An absolute sanctuary. The attention to detail and the sheer privacy of the estate exceeded all our expectations.',
                rating: 5
              },
              {
                name: 'Julian Blackwood',
                role: 'Executive Gathering',
                text: 'The most refined experience we have had outside the city. Impeccable service and breathtaking grounds.',
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
        <div 
          className="absolute inset-0 z-0 flex transition-transform duration-[1500ms] ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {heroImages.map((src, idx) => (
            <div key={idx} className="min-w-full h-full relative">
              <img
                alt={`Estate View ${idx + 1}`}
                className="w-full h-full object-cover brightness-[0.6] scale-105"
                style={{
                  transform: currentSlide === idx ? 'scale(1)' : 'scale(1.05)',
                  transition: 'transform 6s ease-out'
                }}
                src={src}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1B2A22]/80 via-transparent to-transparent"></div>
            </div>
          ))}
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center mt-20">
          <span className="text-[11px] uppercase tracking-[0.3em] font-bold text-[#D4AF37] mb-6 animate-fade-in">
            Exclusive Properties
          </span>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-normal text-white leading-tight mb-8 drop-shadow-lg">
            Luxury Stays
          </h1>
          <p className="text-white/80 text-sm md:text-base font-medium max-w-lg mb-10 leading-relaxed">
            Discover our collection of private properties, where luxury meets absolute tranquility.
          </p>
          <Link 
            href="/farms" 
            className="group relative px-8 py-4 bg-white text-[#1B2A22] text-[11px] uppercase tracking-widest font-bold overflow-hidden transition-all hover:bg-[#D4AF37] hover:text-white"
          >
            <span className="relative z-10 flex items-center gap-2">
              View Properties <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        </div>

        {/* Carousel Indicators */}
        <div className="absolute bottom-12 left-0 right-0 z-20 flex justify-center gap-4">
          {heroImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-[1px] transition-all duration-500 ${currentSlide === idx ? 'w-12 bg-[#D4AF37]' : 'w-6 bg-white/40 hover:bg-white/70'}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Intro Section */}
      <section className="py-24 md:py-32 px-6 md:px-16 max-w-[1000px] mx-auto text-center">
        <h2 className="font-serif text-3xl md:text-5xl text-[#1B2A22] leading-tight mb-8">
          A New Standard of <br/> Living
        </h2>
        <p className="text-[#1B2A22]/70 text-lg md:text-xl font-serif max-w-2xl mx-auto leading-relaxed">
          The Estate provides a singular vision of hospitality. We manage our own exclusive properties designed for a great experience.
        </p>
      </section>

      {/* The Collection (Editorial Layout) */}
      <section className="py-20 bg-white">
        <div className="max-w-[1280px] mx-auto px-6 md:px-16">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#D4AF37] mb-3 block">
                Properties
              </span>
              <h2 className="font-serif text-4xl text-[#1B2A22]">Our Properties</h2>
            </div>
            <Link href="/farms" className="text-[11px] uppercase tracking-widest font-bold text-[#1B2A22] flex items-center gap-2 hover:text-[#D4AF37] transition-colors border-b border-[#1B2A22] hover:border-[#D4AF37] pb-1">
              View All Properties <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <div className="h-10 w-10 animate-spin border-t-2 border-[#D4AF37] rounded-full"></div>
              <p className="text-[11px] uppercase tracking-widest text-[#1B2A22]/60 font-bold">Loading Properties...</p>
            </div>
          ) : (
            <div className="space-y-24 md:space-y-32">
              {farms.slice(0, 3).map((farm, index) => {
                const isEven = index % 2 === 0;
                const isFav = favorites.includes(farm._id);
                return (
                  <div key={farm._id} className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} gap-10 md:gap-20 items-center group`}>
                    
                    {/* Image Block */}
                    <div className="w-full md:w-3/5 relative aspect-[4/3] md:aspect-[3/2] overflow-hidden bg-gray-100">
                      <Link href={`/farms/${farm._id}`}>
                        <img
                          src={farm.images?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'}
                          alt={farm.title}
                          className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-105"
                        />
                      </Link>
                      <button 
                        onClick={(e) => toggleFavorite(farm._id, e)}
                        className="absolute top-6 right-6 bg-white/10 backdrop-blur-md p-3 rounded-full border border-white/20 text-white hover:bg-white hover:text-red-500 transition-all duration-300"
                      >
                        <Heart className={`h-5 w-5 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
                      </button>
                    </div>

                    {/* Content Block */}
                    <div className="w-full md:w-2/5 flex flex-col justify-center">
                      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-[#D4AF37] mb-4">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{farm.location || 'Exclusive Location'}</span>
                      </div>
                      
                      <Link href={`/farms/${farm._id}`}>
                        <h3 className="font-serif text-3xl md:text-4xl text-[#1B2A22] leading-tight mb-6 hover:opacity-80 transition-opacity">
                          {farm.title}
                        </h3>
                      </Link>
                      
                      <div className="flex gap-6 mb-8 text-[#1B2A22]/70 text-sm font-medium">
                        <span className="flex items-center gap-2"><Wind className="h-4 w-4 text-[#D4AF37]"/> {farm.guests || 6} Guests</span>
                        <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#00a877]"/> Private</span>
                      </div>

                      <p className="text-[#1B2A22]/60 leading-relaxed mb-10 font-serif text-lg italic border-l-2 border-[#D4AF37]/30 pl-6">
                        "A masterclass in design and tranquility, offering an escape unlike any other."
                      </p>

                      <div className="flex items-center justify-between pt-8 border-t border-[#1B2A22]/10">
                        <div>
                          <span className="text-[10px] uppercase tracking-widest text-[#1B2A22]/50 font-bold block mb-1">Reserve</span>
                          <span className="text-xl font-serif text-[#1B2A22]">₹{(farm.pricePerNight || 3000).toLocaleString('en-IN')} <span className="text-sm font-sans text-[#1B2A22]/60">/ night</span></span>
                        </div>
                        <Link 
                          href={`/farms/${farm._id}`}
                          className="h-12 w-12 rounded-full border border-[#1B2A22] flex items-center justify-center text-[#1B2A22] hover:bg-[#1B2A22] hover:text-white transition-colors"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </Link>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Experience / Services */}
      <section className="py-24 bg-[#1B2A22] text-white">
        <div className="max-w-[1280px] mx-auto px-6 md:px-16 text-center">
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#D4AF37] mb-4 block">
            Services
          </span>
          <h2 className="font-serif text-3xl md:text-5xl mb-16">Special Services</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <div className="flex flex-col items-center">
              <div className="h-16 w-16 rounded-full border border-[#D4AF37]/30 flex items-center justify-center mb-6 text-[#D4AF37]">
                <Coffee className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-xl mb-3">Private Culinary</h3>
              <p className="text-white/60 text-sm leading-relaxed max-w-xs font-medium">Personalized menus crafted by renowned private chefs using organic, locally-sourced ingredients.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-16 w-16 rounded-full border border-[#00a877]/30 flex items-center justify-center mb-6 text-[#00a877]">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-xl mb-3">Absolute Discretion</h3>
              <p className="text-white/60 text-sm leading-relaxed max-w-xs font-medium">Enjoy your retreat with the assurance of complete privacy and dedicated, unobtrusive security.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-16 w-16 rounded-full border border-[#D4AF37]/30 flex items-center justify-center mb-6 text-[#D4AF37]">
                <Wind className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-xl mb-3">Curated Wellness</h3>
              <p className="text-white/60 text-sm leading-relaxed max-w-xs font-medium">In-estate spa treatments, private yoga sessions, and immersive nature experiences tailored to you.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Minimalist Testimonials */}
      <section className="py-32 bg-[#FAF9F6]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-serif text-3xl text-[#1B2A22] mb-16">Reviews</h2>
          <div className="relative">
            <div className="text-6xl font-serif text-[#D4AF37]/20 absolute -top-8 left-0 right-0">"</div>
            {reviews.length > 0 && (
              <div className="relative z-10 px-8">
                <p className="font-serif text-2xl md:text-3xl text-[#1B2A22] leading-relaxed mb-8 italic">
                  {reviews[0].text}
                </p>
                <h4 className="text-[11px] uppercase tracking-widest font-bold text-[#1B2A22]">{reviews[0].name}</h4>
                <p className="text-[#1B2A22]/50 text-xs mt-1 font-serif italic">{reviews[0].role}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-0">
        <div className="bg-white border-t border-[#1B2A22]/10 py-32 px-6 relative overflow-hidden text-center flex flex-col items-center gap-8">
          <div className="absolute inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at center, #1B2A22 0%, transparent 70%)' }}></div>
          
          <div className="relative z-10">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#00a877] mb-6 block">
              Contact Us
            </span>
            <h2 className="font-serif text-4xl md:text-5xl text-[#1B2A22] font-normal leading-tight mb-6">
              Begin Your Journey
            </h2>
            <p className="text-[#1B2A22]/70 font-serif italic text-lg max-w-md mx-auto mb-10">
              Speak with our support team to arrange your private viewing or secure your booking.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link 
                href="/farms" 
                className="bg-[#1B2A22] text-white hover:bg-[#00a877] px-10 py-4 text-[11px] uppercase tracking-widest font-bold transition-colors"
              >
                View Properties
              </Link>
              <Link 
                href="/support"
                className="bg-transparent border border-[#1B2A22]/30 hover:border-[#1B2A22] text-[#1B2A22] px-10 py-4 text-[11px] uppercase tracking-widest font-bold transition-colors"
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
