'use client';
import toast from 'react-hot-toast';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  MapPin,
  ArrowRight,
  Loader2,
  Check,
  Upload,
  Sparkles,
  Home,
  Building
} from 'lucide-react';
import CustomSelect from '@/components/CustomSelect';

export default function AddPropertyWizardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  // Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [mapLink, setMapLink] = useState('');
  const [propertyType, setPropertyType] = useState('farmhouse');
  const [isActive, setIsActive] = useState(true);

  const [pricePerNight, setPricePerNight] = useState('');
  const [guests, setGuests] = useState('4');
  const [bedrooms, setBedrooms] = useState('2');
  const [acRooms, setAcRooms] = useState('0');
  const [nonAcRooms, setNonAcRooms] = useState('0');
  const [baths, setBaths] = useState('2');
  const [acres, setAcres] = useState('');

  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [extraMattressCount, setExtraMattressCount] = useState<number>(1);
  const [houseRules, setHouseRules] = useState('');
  const [cancellationPolicy, setCancellationPolicy] = useState('');

  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const wizardSteps = [
    { number: 1, label: 'Basics', active: currentStep === 1 },
    { number: 2, label: 'Pricing', active: currentStep === 2 },
    { number: 3, label: 'Amenities', active: currentStep === 3 },
    { number: 4, label: 'Policies', active: currentStep === 4 },
    { number: 5, label: 'Photos', active: currentStep === 5 },
  ];

  const handleAmenityChange = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Use environment variables for Cloudinary
        const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
        const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '';

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
          method: 'POST',
          body: formData,
        });
        if (res.ok) {
          const data = await res.json();
          newUrls.push(data.secure_url);
        } else {
          toast.error(`Failed to upload ${file.name} to Cloudinary.`);
        }
      }
      if (newUrls.length > 0) {
        setImages(prev => [...prev, ...newUrls]);
      }
    } catch (err) {
      console.error(err);
      toast.error('Could not upload image.');
    } finally {
      setUploading(false);
    }
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep === 2) {
      if (Number(acRooms) + Number(nonAcRooms) > Number(bedrooms)) {
        toast.error(`AC and Non-AC bedrooms combined (${Number(acRooms) + Number(nonAcRooms)}) cannot exceed total bedrooms (${bedrooms}).`);
        return;
      }
    }
    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else {
      router.push('/admin/properties');
    }
  };

  const handleSubmit = async () => {
    if (Number(acRooms) + Number(nonAcRooms) > Number(bedrooms)) {
      toast.error(`AC and Non-AC bedrooms combined cannot exceed total bedrooms.`);
      setCurrentStep(2);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/farms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          location,
          mapLink,
          category: propertyType,
          isActive,
          pricePerNight: Number(pricePerNight),
          guests: Number(guests) || 2,
          bedrooms: Number(bedrooms) || 1,
          acRooms: Number(acRooms) || 0,
          nonAcRooms: Number(nonAcRooms) || 0,
          baths: Number(baths),
          acres: acres ? Number(acres) : undefined,
          houseRules: houseRules.split('\n').filter(r => r.trim() !== ''),
          cancellationPolicy,
          amenities: selectedAmenities.map(a => a === 'Extra Mattress' ? `Extra Mattress: ${extraMattressCount}` : a),
          images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1200&q=80'],
        }),
      });

      if (res.ok) {
        toast.success('Farmhouse created successfully!');
        router.push('/admin/properties');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to create farmhouse.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Could not create farmhouse.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 lg:p-16 pb-24 selection:bg-[#1B2A22]/10 selection:text-[#0b513d]">

      <header className="mx-auto w-full max-w-3xl mb-12">
        <div className="mb-4 flex items-center gap-2 text-gray-500 hover:text-[#00a877] transition-colors cursor-pointer" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4" />
          <span className="text-xs font-bold tracking-wider">
            {currentStep > 1 ? 'Previous Step' : 'Back to Farmhouse'}
          </span>
        </div>
        <h2 className="font-serif text-3xl font-normal text-[#1B2A22] mb-2">Add New Farmhouse</h2>
        <p className="text-sm text-gray-500">Provide the details to list a new Farmhouse on the platform.</p>
      </header>

      <div className="mx-auto w-full max-w-3xl rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] bg-white p-6 md:p-10">

        {/* Progress Tracker */}
        <div className="relative mb-12 flex items-center justify-between">
          <div className="absolute top-1/2 left-0 -z-10 h-px w-full -translate-y-1/2 bg-gray-100"></div>
          {wizardSteps.map((step) => (
            <div key={step.number} className="flex flex-col items-center gap-1 sm:gap-2 bg-white px-1 sm:px-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors ${step.active
                ? 'bg-[#00a877] text-white shadow-md ring-4 ring-[#00a877]/20'
                : step.number < currentStep
                  ? 'bg-[#00a877] text-white shadow-sm'
                  : 'bg-gray-50 border-2 border-gray-200 text-gray-400'
                }`}>
                {step.number < currentStep ? <Check className="h-4 w-4 stroke-[3]" /> : step.number}
              </div>
              <span className={`text-xs font-bold transition-colors hidden sm:block ${step.active
                ? 'text-[#00a877]'
                : step.number < currentStep
                  ? 'text-[#00a877]'
                  : 'text-gray-400'
                }`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>

        <form onSubmit={handleNext} className="space-y-8">
          {/* STEP 1: BASICS */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="font-serif text-2xl text-[#1B2A22] pb-4 border-b border-gray-100 mb-8">
                Basic Information
              </h3>

              <div className="space-y-2">
                <label htmlFor="title" className="block text-[13px] font-bold text-[#1B2A22] mb-1.5">
                  Property Title
                </label>
                <input
                  id="title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Whispering Pines Farmhouse"
                  className="w-full rounded-xl border-gray-200 bg-[#f9fafb]  px-4 py-3 text-sm  text-[#1B2A22] placeholder:text-gray-400 outline-none transition-all border focus:border-[#00a877] focus:bg-white"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="block text-[13px] font-bold text-[#1B2A22] mb-1.5">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the unique features and atmosphere of the farm..."
                  className="w-full resize-none rounded-xl border-gray-200 bg-[#f9fafb]  px-4 py-3 text-sm  text-[#1B2A22] placeholder:text-gray-400 outline-none transition-all border focus:border-[#00a877] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="location" className="block text-[13px] font-bold text-[#1B2A22] mb-1.5">
                    Location Name
                  </label>
                  <div className="relative">
                    <span className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400">
                      <MapPin className="h-4 w-4" />
                    </span>
                    <input
                      id="location"
                      type="text"
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Surat, Gujarat"
                      className="w-full rounded-xl border-gray-200 bg-[#f9fafb]  pl-10 pr-4 py-3 text-sm  text-[#1B2A22] placeholder:text-gray-400 outline-none transition-all border focus:border-[#00a877] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="mapLink" className="block text-[13px] font-bold text-[#1B2A22] mb-1.5">
                    Google Maps Link
                  </label>
                  <div className="relative">
                    <span className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400">
                      <MapPin className="h-4 w-4" />
                    </span>
                    <input
                      id="mapLink"
                      type="url"
                      value={mapLink}
                      onChange={(e) => setMapLink(e.target.value)}
                      placeholder="https://maps.app.goo.gl/..."
                      className="w-full rounded-xl border-gray-200 bg-[#f9fafb]  pl-10 pr-4 py-3 text-sm  text-[#1B2A22] placeholder:text-gray-400 outline-none transition-all border focus:border-[#00a877] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="property_type" className="block text-[13px] font-bold text-[#1B2A22] mb-1.5">
                    Property Type
                  </label>
                  <CustomSelect
                    id="property_type"
                    value={propertyType}
                    onChange={(val) => setPropertyType(val)}
                    options={[
                      { value: 'farmhouse', label: 'Farmhouse', description: 'Cozy countryside farmhouse stay', icon: Home },
                      { value: 'villa', label: 'Villa', description: 'Luxurious retreat with premium amenities', icon: Building }
                    ]}
                  />
                </div>
              </div>


            </div>
          )}

          {/* STEP 2: PRICING & CAPACITY */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="font-serif text-2xl text-[#1B2A22] pb-4 border-b border-gray-100 mb-8">
                Pricing & Capacity
              </h3>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="price" className="block text-[13px] font-bold text-[#1B2A22] mb-1.5">
                    Price Per Night (₹)
                  </label>
                  <input
                    id="price"
                    type="number"
                    required
                    value={pricePerNight}
                    onChange={(e) => setPricePerNight(e.target.value)}
                    placeholder="e.g. 1500"
                    className="w-full rounded-lg border-[#bfc9c3]/60 bg-[#fbf8ff] px-4 py-3 text-sm  text-[#1B2A22] placeholder:text-gray-400 outline-none transition-all border focus:border-[#00a877] focus:bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="guests" className="block text-[13px] font-bold text-[#1B2A22] mb-1.5">
                    Max Guests
                  </label>
                  <input
                    id="guests"
                    type="number"
                    required
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    placeholder="e.g. 4"
                    className="w-full rounded-xl border-gray-200 bg-[#f9fafb]  px-4 py-3 text-sm  text-[#1B2A22] placeholder:text-gray-400 outline-none transition-all border focus:border-[#00a877] focus:bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="bedrooms" className="block text-[13px] font-bold text-[#1B2A22] mb-1.5">
                    Bedrooms
                  </label>
                  <input
                    id="bedrooms"
                    type="number"
                    required
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    placeholder="e.g. 2"
                    className="w-full rounded-xl border-gray-200 bg-[#f9fafb]  px-4 py-3 text-sm  text-[#1B2A22] placeholder:text-gray-400 outline-none transition-all border focus:border-[#00a877] focus:bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="acRooms" className="block text-[13px] font-bold text-[#1B2A22] mb-1.5">
                    AC Bedrooms
                  </label>
                  <input
                    id="acRooms"
                    type="number"
                    value={acRooms}
                    onChange={(e) => setAcRooms(e.target.value)}
                    placeholder="e.g. 1"
                    className={`w-full rounded-xl bg-[#f9fafb] px-4 py-3 text-sm text-[#1B2A22] placeholder:text-gray-400 outline-none transition-all border ${Number(acRooms) + Number(nonAcRooms) > Number(bedrooms) ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#00a877] focus:bg-white'}`}
                  />
                  {Number(acRooms) + Number(nonAcRooms) > Number(bedrooms) && (
                    <p className="text-[12px] font-bold text-red-500 mt-1.5 px-1">Must not exceed total bedrooms.</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="nonAcRooms" className="block text-[13px] font-bold text-[#1B2A22] mb-1.5">
                    Non-AC Bedrooms
                  </label>
                  <input
                    id="nonAcRooms"
                    type="number"
                    value={nonAcRooms}
                    onChange={(e) => setNonAcRooms(e.target.value)}
                    placeholder="e.g. 1"
                    className={`w-full rounded-xl bg-[#f9fafb] px-4 py-3 text-sm text-[#1B2A22] placeholder:text-gray-400 outline-none transition-all border ${Number(acRooms) + Number(nonAcRooms) > Number(bedrooms) ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#00a877] focus:bg-white'}`}
                  />
                  {Number(acRooms) + Number(nonAcRooms) > Number(bedrooms) && (
                    <p className="text-[12px] font-bold text-red-500 mt-1.5 px-1">Must not exceed total bedrooms.</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="baths" className="block text-[13px] font-bold text-[#1B2A22] mb-1.5">
                    Bathrooms
                  </label>
                  <input
                    id="baths"
                    type="number"
                    required
                    value={baths}
                    onChange={(e) => setBaths(e.target.value)}
                    placeholder="e.g. 2"
                    className="w-full rounded-xl border-gray-200 bg-[#f9fafb]  px-4 py-3 text-sm  text-[#1B2A22] placeholder:text-gray-400 outline-none transition-all border focus:border-[#00a877] focus:bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="acres" className="block text-[13px] font-bold text-[#1B2A22] mb-1.5">
                    Acres <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    id="acres"
                    type="number"
                    min="0"
                    step="0.1"
                    value={acres}
                    onChange={(e) => setAcres(e.target.value)}
                    placeholder="e.g. 5"
                    className="w-full rounded-xl border-gray-200 bg-[#f9fafb] px-4 py-3 text-sm text-[#1B2A22] placeholder:text-gray-400 outline-none transition-all border focus:border-[#00a877] focus:bg-white"
                  />
                </div>
              </div>


            </div>
          )}

          {/* STEP 3: AMENITIES */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="font-serif text-2xl text-[#1B2A22] pb-4 border-b border-gray-100 mb-8">
                Select Amenities
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {[
                  'Swimming Pool', 'Children\'s Swimming Pool', 'Garden',
                  'Children\'s Playground', 'Gazebo', 'Extra Mattress',
                  'WiFi', 'Air Conditioning', 'CCTV', 'Parking',
                  'Indoor Fireplace', 'Home Theater', 'Outdoor Kitchen', 'Sound System',
                  'Cricket Box', 'Online Food Delivery (Zomato/Swiggy)'
                ].map((amenity) => (
                  <div key={amenity} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#fbf8ff] p-4 rounded-lg border border-[#eeedf7] transition-all hover:bg-[#e3e1ec]/30 min-h-[56px]">
                    <div className="flex items-start gap-3 flex-grow">
                      <div className="relative flex items-center shrink-0 mt-0.5">
                        <input
                          type="checkbox"
                          id={`amenity-${amenity}`}
                          checked={selectedAmenities.includes(amenity)}
                          onChange={() => handleAmenityChange(amenity)}
                          className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-[#bfc9c3]/60 checked:border-[#003527] checked:bg-[#00a877] focus:outline-none transition-colors"
                        />
                        <Check className="absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                      </div>
                      <label htmlFor={`amenity-${amenity}`} className="text-sm font-semibold text-[#1a1b22] cursor-pointer select-none leading-snug">
                        {amenity}
                      </label>
                    </div>
                    {amenity === 'Extra Mattress' && selectedAmenities.includes('Extra Mattress') && (
                      <div className="flex items-center gap-2 shrink-0 pl-8 sm:pl-0">
                        <label className="text-xs font-semibold text-gray-500">Qty:</label>
                        <input
                          type="number"
                          min="1"
                          value={extraMattressCount}
                          onChange={(e) => setExtraMattressCount(Number(e.target.value) || 1)}
                          className="w-16 rounded border-[#bfc9c3]/60 bg-white px-2 py-1 text-sm outline-none focus:border-[#003527]"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>


            </div>
          )}

          {/* STEP 4: POLICIES */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="font-serif text-2xl text-[#1B2A22] pb-4 border-b border-gray-100 mb-8">
                Policies & House Rules
              </h3>

              <div className="space-y-2">
                <label htmlFor="houseRules" className="block text-[13px] font-bold text-[#1B2A22] mb-1.5">
                  House Rules <span className="text-gray-400 font-normal">(One rule per line)</span>
                </label>
                <textarea
                  id="houseRules"
                  rows={5}
                  value={houseRules}
                  onChange={(e) => setHouseRules(e.target.value)}
                  placeholder="e.g.&#10;Check-in: 6 PM | Checkout: 5 PM&#10;No Alcohol Party&#10;No Smoking"
                  className="w-full resize-none rounded-xl border-gray-200 bg-[#f9fafb] px-4 py-3 text-sm text-[#1B2A22] placeholder:text-gray-400 outline-none transition-all border focus:border-[#00a877] focus:bg-white"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="cancellationPolicy" className="block text-[13px] font-bold text-[#1B2A22] mb-1.5">
                  Cancellation Policy
                </label>
                <textarea
                  id="cancellationPolicy"
                  rows={5}
                  value={cancellationPolicy}
                  onChange={(e) => setCancellationPolicy(e.target.value)}
                  placeholder="Describe your cancellation policy..."
                  className="w-full resize-none rounded-xl border-gray-200 bg-[#f9fafb] px-4 py-3 text-sm text-[#1B2A22] placeholder:text-gray-400 outline-none transition-all border focus:border-[#00a877] focus:bg-white"
                />
              </div>
            </div>
          )}

          {/* STEP 5: PHOTOS */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="pb-2 border-b border-[#bfc9c3]/30 flex justify-between items-center mb-6">
                <h3 className="font-serif text-xl text-[#1a1b22]">
                  Property Photos
                </h3>
                <span className="text-xs font-semibold text-gray-400">
                  {images.length} {images.length === 1 ? 'photo' : 'photos'} uploaded
                </span>
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                  {images.map((url, idx) => (
                    <div key={idx} className="relative aspect-[4/3] rounded-xl overflow-hidden border border-[#eeedf7] group">
                      <img src={url} alt={`Property photo ${idx + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                        {idx !== 0 && (
                          <button
                            type="button"
                            onClick={() => setImages(prev => [prev[idx], ...prev.filter((_, i) => i !== idx)])}
                            className="bg-[#00a877] text-white rounded-lg px-3 py-1.5 text-xs font-bold hover:bg-[#009669] transition-colors shadow-sm"
                          >
                            Set as Cover
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                          className="bg-red-600 text-white rounded-lg px-3 py-1.5 text-xs font-bold hover:bg-red-700 transition-colors shadow-sm"
                        >
                          Remove Photo
                        </button>
                      </div>
                      {idx === 0 && (
                        <span className="absolute top-2 left-2 bg-[#00a877] text-white text-sm font-medium font-bold px-2 py-0.5 rounded-full">
                          Cover
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-col items-center justify-center border-2 border-dashed border-[#bfc9c3] rounded-xl p-8 bg-[#fbf8ff] transition-all hover:border-[#003527]">
                {uploading ? (
                  <div className="flex flex-col items-center gap-3 py-8">
                    <Loader2 className="h-10 w-10 animate-spin text-[#00a877]" />
                    <p className="text-sm text-gray-500 font-semibold">Uploading images...</p>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="bg-[#00a877]/10 p-4 rounded-full w-fit mx-auto text-[#00a877]">
                      <Upload className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#1a1b22]">Upload property photos</p>
                      <p className="text-xs text-gray-500 mt-1">Select one or more images (PNG, JPG, JPEG up to 5MB each)</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                      id="upload-file-input"
                    />
                    <label
                      htmlFor="upload-file-input"
                      className="inline-block bg-[#00a877] text-white px-6 py-2.5 rounded-lg text-sm font-semibold cursor-pointer hover:bg-[#009669] transition-colors"
                    >
                      Select Images
                    </label>
                  </div>
                )}
              </div>


            </div>
          )}

          {/* Form Actions Footer */}
          <div className="mt-12 flex justify-end gap-4 border-t border-gray-100 pt-8">
            <button
              type="button"
              onClick={handleBack}
              className="rounded-xl border border-gray-200 px-6 py-3 text-[13px] font-bold text-gray-600 transition-colors hover:bg-gray-50"
            >
              {currentStep > 1 ? 'Back' : 'Cancel'}
            </button>
            {currentStep < 5 ? (
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-[#00a877] px-6 py-3 text-[13px] font-bold text-white transition-colors hover:bg-[#009669]"
              >
                <span>Next Step</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={saving || uploading}
                onClick={handleSubmit}
                className="flex items-center gap-2 rounded-xl bg-[#00a877] px-6 py-3 text-[13px] font-bold text-white transition-colors hover:bg-[#009669] disabled:opacity-70"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Creating Listing...</span>
                  </>
                ) : (
                  <>
                    <span>Publish Property</span>
                    <Sparkles className="h-4 w-4" />
                  </>
                )}
              </button>
            )}
          </div>

          <div className="space-y-2 md:col-span-2 pt-2">
            <label className="flex items-center gap-2 text-[13px] font-bold text-[#1B2A22] cursor-pointer w-max">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4 accent-[#00a877] rounded" />
              <span>Show this farmhouse on the website</span>
            </label>
          </div>

        </form>

      </div>
    </div>
  );
}
