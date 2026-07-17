import re

filename = 'app/dashboard/bookings/page.tsx'

with open(filename, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add Star import
if 'Star' not in content:
    content = content.replace('Calendar, Download, HelpCircle, ArrowRight, Heart, MapPin, Users, Bath, Home', 'Calendar, Download, HelpCircle, ArrowRight, Heart, MapPin, Users, Bath, Home, Star')

# 2. Replace the old card design with the new detailed one
old_card = """ <div
 key={farm._id}
 className="bg-white border border-[#1B2A22]/10 flex flex-col h-full relative group"
 >
 {/* Image Area */}
 <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
 <img
 src={image}
 alt={farm.title}
 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.5s]"
 />
 {/* Heart Button */}
 <button
 onClick={(e) => handleToggleFavorite(farm._id, e)}
 className="absolute top-4 right-4 p-2.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white hover:text-red-500 transition-all z-10"
 aria-label="Remove from saved stays"
 >
 <Heart className="h-4 w-4 fill-red-500 text-red-500"/>
 </button>
 </div>

 {/* Card Details */}
 <div className="p-6 flex flex-col flex-grow gap-4">
 <div>
 <p className="flex items-center gap-1.5 text-sm font-medium font-bold text-[#1B2A22] mb-2">
 <MapPin className="h-3 w-3"/>
 {farm.location || 'Exclusive Location'}
 </p>
 <h3 className="font-serif text-xl text-[#1B2A22] line-clamp-1 group-hover:opacity-70 transition-opacity">
 {farm.title}
 </h3>
 </div>

 <div className="flex gap-4 text-sm font-medium font-bold text-[#1B2A22]/50 pb-4 border-b border-[#1B2A22]/5">
 <span className="flex items-center gap-1.5">
 <Users className="h-3.5 w-3.5 text-[#1B2A22]"/>
 {farm.guests || 6}
 </span>
 <span className="flex items-center gap-1.5">
 <Home className="h-3.5 w-3.5 text-[#1B2A22]"/>
 {farm.bedrooms || 3}
 </span>
 <span className="flex items-center gap-1.5">
 <Bath className="h-3.5 w-3.5 text-[#1B2A22]"/>
 {farm.baths || 2}
 </span>
 </div>

 <div className="mt-auto flex items-center justify-between pt-2">
 <div>
 <p className="font-serif text-lg text-[#1B2A22]">
 ₹{farm.pricePerNight?.toLocaleString('en-IN')}
 <span className="font-sans text-sm font-medium font-bold text-[#1B2A22]/50 ml-1">/ night</span>
 </p>
 </div>
 <Link
 href={`/farms/${farm._id}`}
 className="text-sm font-medium font-bold text-[#1B2A22] hover:text-[#1B2A22] transition-colors"
 >
 Reserve
 </Link>
 </div>
 </div>
 </div>"""

new_card = """ <Link 
 href={`/farms/${farm._id}`}
 key={farm._id}
 className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-[#1B2A22]/5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] transition-all duration-500"
 >
 
 {/* Photo & Badge Overlay */}
 <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
 <img
 src={image}
 alt={farm.title}
 className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-105"
 onError={(e) => {
 (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';
 }}
 />

 {/* Rating Badge */}
 <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm text-[12px] font-bold text-[#1B2A22]">
 <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
 {farm.rating || 4.5}
 </div>

 {/* Favorite Button */}
 <button 
 onClick={(e) => { e.preventDefault(); handleToggleFavorite(farm._id, e); }}
 className="absolute top-4 right-4 text-white drop-shadow-md hover:scale-110 transition-transform active:scale-95 cursor-pointer z-10"
 >
 <Heart className={`h-6 w-6 fill-red-500 text-red-500`} />
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
 <h3 className="font-sans text-[19px] text-[#1B2A22] font-bold mb-4 leading-snug group-hover:text-[#00a877] transition-colors">
 {farm.title}
 </h3>
 
 {/* Amenities Tags (mock if not present in Farm interface) */}
 <div className="flex flex-wrap gap-2 mb-5">
 {farm.category ? (
     <span className="bg-[#fbf8ff] border border-[#eeedf7] text-[#1B2A22]/70 text-xs font-medium px-2 py-0.5 rounded-md whitespace-nowrap">
       {farm.category}
     </span>
 ) : (
   <span className="text-xs text-gray-400 italic">No amenities listed</span>
 )}
 </div>

 {/* Divider */}
 <div className="border-t border-[#eeedf7] my-2"></div>

 {/* Footer: Price & Guests */}
 <div className="flex items-center justify-between mt-auto pt-3">
 <div className="text-[#1B2A22]">
 <span className="text-lg font-bold">
 {farm.pricePerNight ? `₹${farm.pricePerNight.toLocaleString('en-IN')}` : 'Price N/A'}
 </span>
 <span className="text-sm font-medium text-[#1B2A22]/50 font-medium ml-1">/ night</span>
 </div>
 <div className="bg-[#fbf8ff] text-[#1B2A22]/70 text-sm font-medium font-bold px-3 py-1.5 rounded-md border border-[#eeedf7]">
 {farm.guests || 6} guests
 </div>
 </div>
 </div>
 </Link>"""

content = content.replace(old_card, new_card)

with open(filename, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done updating saved card design")
