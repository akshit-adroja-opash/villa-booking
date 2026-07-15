'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Bath, BedDouble, Home, MapPin, Plus, Search, Users, Trash2, ShieldCheck } from 'lucide-react';
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

  const executeDelete = async (id: string) => {
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

  const handleDelete = (id: string) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="text-[13px] font-semibold text-[#1B2A22]">Are you sure you want to delete this property? This cannot be undone.</p>
        <div className="flex gap-2 justify-end mt-1">
          <button 
            onClick={() => toast.dismiss(t.id)}
            className="px-4 py-2 text-[11px] font-bold uppercase tracking-wide text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              toast.dismiss(t.id);
              executeDelete(id);
            }}
            className="px-4 py-2 text-[11px] font-bold uppercase tracking-wide text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    ), { duration: Infinity, id: 'delete-confirm-prop' });
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
 <h1 className="font-serif text-[32px] font-bold text-[#1a1f1c]">
 Farmhouses
 </h1>
 <p className="text-[13px] font-semibold text-gray-400 mt-1">
 Review listings, capacity, amenities, and nightly rates.
 </p>
 </div>
 <Link
 href="/admin/properties/create"
 className="flex items-center justify-center gap-2 bg-[#00a877] hover:bg-[#009669] text-white px-5 py-2.5 rounded-lg text-[13px] font-bold transition-all shadow-sm self-end sm:self-auto"
 >
 <Plus className="h-4 w-4"/>
 <span>New Farmhouse</span>
 </Link>
 </div>

 {/* Stats Grid */}
 <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
 {[
 { label: 'LIVE LISTINGS', value: farms.length.toString() },
 { label: 'AVERAGE NIGHTLY RATE', value: `₹${averageRate.toLocaleString('en-IN')}` },
 { label: 'TOTAL GUEST CAPACITY', value: farms.reduce((sum, farm) => sum + (farm.guests || 0), 0).toString() },
 ].map((stat) => (
 <div key={stat.label} className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 p-6 flex flex-col justify-center min-h-[110px]">
 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">{stat.label}</p>
 <p className="font-sans tracking-tight text-[28px] font-bold text-[#1B2A22]">{stat.value}</p>
 </div>
 ))}
 </div>

 {/* Search Input bar */}
 <div className="flex w-full max-w-md items-center gap-3 bg-white rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 px-4 py-2.5 focus-within:border-gray-200 transition-all">
 <Search className="h-4 w-4 text-gray-400"/>
 <input
 value={query}
 onChange={(event) => setQuery(event.target.value)}
 placeholder="Search properties by name, location..."
 className="w-full bg-transparent text-[13px] font-semibold text-[#1B2A22] outline-none border-none placeholder:text-gray-400"
 />
 </div>

 {/* Listings Grid Layout */}
 <section className="flex flex-col gap-6">
 {filteredFarms.length === 0 ? (
 <div className="bg-white border border-gray-200 p-10 text-center shadow-sm">
 <p className="text-gray-400 font-medium">No farmhouses found.</p>
 </div>
 ) : (
 filteredFarms.map((farm) => (
 <article key={farm._id} className="flex flex-col xl:flex-row bg-white border border-gray-200 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] overflow-hidden rounded-xl">
 {/* Image */}
 <div className="shrink-0 w-full xl:w-[360px] h-64 xl:h-auto overflow-hidden bg-gray-100 relative">
 {farm.images?.[0] ? (
 <img 
 src={farm.images[0]} 
 alt={farm.title} 
 className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-105"
 />
 ) : (
 <div className="absolute inset-0 flex h-full items-center justify-center bg-[#f9fafb] text-gray-300">
 <Home className="h-8 w-8"/>
 </div>
 )}
 <div className="absolute top-4 left-4 bg-white/95 px-3 py-1.5 text-[12px] font-bold text-[#00a877] flex items-center gap-1.5 shadow-sm">
 <span className="h-1.5 w-1.5 rounded-full bg-[#00a877]"></span>
 Active
 </div>
 </div>
 
 {/* Content */}
 <div className="flex flex-col justify-between w-full p-6 md:p-8">
 
 <div>
 <div className="flex items-center gap-2 text-[14px] font-bold text-[#1B2A22]">
 <MapPin className="h-4 w-4"/>
 {farm.location || 'Exclusive Location'}
 </div>
 
 <h3 className="font-sans text-[22px] font-medium text-[#1B2A22] mt-3">{farm.title}</h3>
 
 <div className="flex items-center gap-6 flex-wrap mt-5 text-[13px] font-bold text-gray-400">
 <span className="flex items-center gap-2">
 <Users className="h-4 w-4 text-gray-300"/>
 {farm.guests || 0} Guests
 </span>
 <span className="flex items-center gap-2">
 <BedDouble className="h-4 w-4 text-gray-300"/>
 {farm.bedrooms || 0} Beds
 </span>
 <span className="flex items-center gap-1.5 text-[#00a877]">
 <ShieldCheck className="h-4 w-4"/>
 Verified
 </span>
 </div>
 </div>
 
 <div className="flex items-center justify-between mt-8">
 <p className="text-[22px] font-sans tracking-tight font-bold text-[#1B2A22]">
 ₹{(farm.pricePerNight || 0).toLocaleString('en-IN')} <span className="text-[13px] font-bold text-gray-400 font-sans tracking-wide">/ night</span>
 </p>
 <div className="flex items-center gap-3">
 <button 
 onClick={() => handleDelete(farm._id)}
 className="h-10 w-10 flex items-center justify-center rounded-xl border border-red-100 bg-red-50/50 text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-95"
 title="Delete Property"
 >
 <Trash2 className="h-4 w-4"/>
 </button>
 <Link 
 href={`/admin/properties/${farm._id}/edit`} 
 className="h-10 px-8 inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 hover:border-[#00a877] hover:text-[#00a877] hover:shadow-sm text-[13px] font-bold transition-all active:scale-95"
 >
 Edit
 </Link>
 </div>
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
