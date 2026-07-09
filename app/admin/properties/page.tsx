'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Bath, BedDouble, Home, MapPin, Plus, Search, Users, ShieldCheck, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

type Farm = {
 _id: string;
 title: string;
 description?: string;
 location?: string;
 pricePerNight?: number;
 images?: string[];
 amenities?: string[];
 guests?: number;
 bedrooms?: number;
 baths?: number;
 category?: string;
 rating?: number;
};

export default function AdminPropertiesPage() {
 const [farms, setFarms] = useState<Farm[]>([]);
 const [loading, setLoading] = useState(true);
 const [query, setQuery] = useState('');

 useEffect(() => {
 async function loadFarms() {
 try {
 const response = await fetch('/api/farms');
 if (response.ok) {
 const data = await response.json();
 setFarms(data || []);
 } else {
 setFarms([]);
 }
 } catch (error) {
 console.error('Failed to load properties:', error);
 setFarms([]);
 } finally {
 setLoading(false);
 }
 }

 loadFarms();
 }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this property? This cannot be undone.')) return;
    try {
      const response = await fetch(`/api/farms/${id}`, { method: 'DELETE' });
      if (response.ok) {
        toast.success('Property deleted successfully');
        setFarms((prev) => prev.filter((farm) => farm._id !== id));
      } else {
        toast.error('Failed to delete property');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('An error occurred while deleting');
    }
  };

 const filteredFarms = useMemo(() => {
 const normalizedQuery = query.trim().toLowerCase();
 if (!normalizedQuery) return farms;

 return farms.filter((farm) =>
 [farm.title, farm.location, farm.category, ...(farm.amenities || [])]
 .filter(Boolean)
 .join(' ')
 .toLowerCase()
 .includes(normalizedQuery)
 );
 }, [farms, query]);

 const averageRate = farms.length
 ? Math.round(farms.reduce((sum, farm) => sum + (farm.pricePerNight || 0), 0) / farms.length)
 : 0;

 if (loading) {
 return (
 <div className="flex min-h-[60vh] items-center justify-center bg-[#FAF9F6]">
 <div className="h-10 w-10 animate-spin border-t-2 border-[#1B2A22] rounded-full"></div>
 </div>
 );
 }

 return (
 <main className="p-6 md:p-10 bg-[#FAF9F6]">
 <div className="mx-auto max-w-[1280px] space-y-8">
 
 {/* Header Block */}
 <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
 <div>
 <h1 className="font-serif text-3xl font-normal tracking-tight text-[#1B2A22]">
 Properties
 </h1>
 <p className="text-sm font-medium text-[#1B2A22]/60 mt-2">
 Manage Farmhouses & Rates
 </p>
 </div>
 <Link
 href="/admin/properties/create"
 className="flex items-center justify-center gap-2 bg-[#00a877] hover:bg-[#009669] text-white px-5 py-3 text-sm font-medium transition-colors self-start sm:self-auto"
 >
 <Plus className="h-4 w-4"/>
 <span>Add Property</span>
 </Link>
 </div>

 {/* Stats Grid */}
 <div className="grid gap-6 md:grid-cols-3">
 {[
 { label: 'Active Listings', value: farms.length.toString(), color: '#1B2A22' },
 { label: 'Average Nightly Rate', value: `₹${averageRate.toLocaleString('en-IN')}`, color: '#1B2A22' },
 { label: 'Total Capacity', value: farms.reduce((sum, farm) => sum + (farm.guests || 0), 0).toString(), color: '#1B2A22' },
 ].map((stat) => (
 <div key={stat.label} className="bg-white border border-[#1B2A22]/10 p-6">
 <p className="text-sm font-medium text-[#1B2A22]/60 mb-2">{stat.label}</p>
 <p className="font-serif text-3xl"style={{ color: stat.color }}>{stat.value}</p>
 </div>
 ))}
 </div>

 {/* Search Input bar */}
 <div className="flex w-full max-w-md items-center gap-3 bg-white border border-[#1B2A22]/10 px-4 py-3 focus-within:border-[#1B2A22] transition-all">
 <Search className="h-4 w-4 text-[#1B2A22]/40"/>
 <input
 value={query}
 onChange={(event) => setQuery(event.target.value)}
 placeholder="Search farmhouses..."
 className="w-full bg-transparent text-sm font-semibold text-[#1B2A22] outline-none border-none placeholder:text-[#1B2A22]/30"
 />
 </div>

 {/* Listings List Layout */}
 <section className="flex flex-col gap-6">
 {filteredFarms.length === 0 ? (
 <div className="bg-white border border-[#1B2A22]/10 p-10 text-center">
 <p className="text-[#1B2A22]/50 font-serif text-lg">No farmhouses found.</p>
 </div>
 ) : (
 filteredFarms.map((farm) => (
 <article key={farm._id} className="flex flex-col sm:flex-row items-center gap-8 p-4 bg-white border border-[#1B2A22]/10 hover:border-[#1B2A22]/50 transition-colors group">
 {/* Image */}
 <div className="shrink-0 w-full sm:w-72 h-48 overflow-hidden bg-gray-100 relative">
 {farm.images?.[0] ? (
 <img 
 src={farm.images[0]} 
 alt={farm.title} 
 className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
 />
 ) : (
 <div className="flex h-full items-center justify-center bg-[#1B2A22]/5 text-[#1B2A22]/20">
 <Home className="h-8 w-8"/>
 </div>
 )}
 <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 text-sm font-medium text-[#00a877] border border-[#00a877]/20 flex items-center gap-1.5">
 <span className="h-1.5 w-1.5 rounded-full bg-[#00a877]"></span>
 Active
 </div>
 </div>
 
 {/* Content */}
 <div className="flex flex-1 flex-col sm:flex-row sm:items-center justify-between w-full">
 
 <div className="flex flex-col gap-3">
 <div className="flex items-center gap-2 text-sm font-medium text-[#1B2A22]">
 <MapPin className="h-3 w-3"/>
 {farm.location?.startsWith('http') ? (
 <a href={farm.location} target="_blank"rel="noopener noreferrer"className="hover:underline text-[#1B2A22]">
 View on Map
 </a>
 ) : (
 <span>{farm.location || 'Exclusive Location'}</span>
 )}
 </div>
 
 <h3 className="font-serif text-2xl font-normal text-[#1B2A22]">{farm.title}</h3>
 
 <div className="flex items-center gap-6 text-sm font-medium text-[#1B2A22]/60 mt-2">
 <span className="flex items-center gap-1.5">
 <Users className="h-3.5 w-3.5 text-[#1B2A22]/40"/>
 {farm.guests || 0} Guests
 </span>
 <span className="flex items-center gap-1.5">
 <BedDouble className="h-3.5 w-3.5 text-[#1B2A22]/40"/>
 {farm.bedrooms || 0} Beds
 </span>
 <span className="flex items-center gap-1.5 text-[#00a877]">
 <ShieldCheck className="h-3.5 w-3.5 text-[#00a877]"/>
 Verified
 </span>
 </div>
 
 <div className="mt-4">
 <p className="text-xl font-serif text-[#1B2A22]">
 ₹{(farm.pricePerNight || 0).toLocaleString('en-IN')} <span className="text-sm font-medium text-[#1B2A22]/40 font-sans">/ night</span>
 </p>
 </div>
 </div>

 {/* Action Button */}
 <div className="mt-6 sm:mt-0 sm:ml-4 sm:pr-4 flex gap-3">
 <button 
                  onClick={() => handleDelete(farm._id)}
                  className="inline-flex items-center justify-center p-3 text-red-500 hover:bg-red-50 border border-red-100 transition-colors"
                  title="Delete Property"
                >
                  <Trash2 className="h-4 w-4"/>
                </button>
                <Link 
                  href={`/admin/properties/${farm._id}/edit`} 
 className="inline-block border border-[#1B2A22]/20 hover:border-[#1B2A22] hover:text-[#1B2A22] px-6 py-3 text-sm font-medium text-[#1B2A22]/70 transition-colors"
 >
 Edit
 </Link>
 </div>
 
 </div>
 </article>
 ))
 )}
 </section>

 </div>
 </main>
 );
}
