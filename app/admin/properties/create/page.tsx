'use client';

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
  Sparkles
} from 'lucide-react';

export default function AddPropertyWizardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  
  // Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('farmhouse');
  
  const [pricePerNight, setPricePerNight] = useState('');
  const [guests, setGuests] = useState('4');
  const [bedrooms, setBedrooms] = useState('2');
  const [baths, setBaths] = useState('2');
  
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const wizardSteps = [
    { number: 1, label: 'Basics', active: currentStep === 1 },
    { number: 2, label: 'Pricing', active: currentStep === 2 },
    { number: 3, label: 'Amenities', active: currentStep === 3 },
    { number: 4, label: 'Photos', active: currentStep === 4 },
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
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        if (res.ok) {
          const data = await res.json();
          newUrls.push(data.url);
        } else {
          alert(`Failed to upload ${file.name}. Please try again.`);
        }
      }
      if (newUrls.length > 0) {
        setImages(prev => [...prev, ...newUrls]);
      }
    } catch (err) {
      console.error(err);
      alert('Error uploading image.');
    } finally {
      setUploading(false);
    }
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else {
      router.push('/admin/dashboard');
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/farms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          location,
          category: propertyType,
          pricePerNight: Number(pricePerNight),
          guests: Number(guests),
          bedrooms: Number(bedrooms),
          baths: Number(baths),
          amenities: selectedAmenities,
          images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1200&q=80'],
        }),
      });

      if (res.ok) {
        alert('Property created successfully!');
        router.push('/admin/dashboard');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to create property.');
      }
    } catch (err) {
      console.error(err);
      alert('Error creating property.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-16 pb-24 selection:bg-[#064e3b]/10 selection:text-[#0b513d]">
        
        <header className="mx-auto max-w-3xl mb-12">
          <div className="mb-4 flex items-center gap-2 text-[#404944] cursor-pointer" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wider">
              {currentStep > 1 ? 'Previous Step' : 'Back to Dashboard'}
            </span>
          </div>
          <h2 className="font-serif text-3xl font-normal text-[#003527] mb-2">Add New Property</h2>
          <p className="text-sm text-[#404944]">Provide the details to list a new estate on the platform.</p>
        </header>

        <div className="mx-auto max-w-3xl rounded-xl border border-[#eeedf7] bg-white p-6 shadow-[0_4px_24px_-4px_rgba(6,78,59,0.05),0_12px_48px_-12px_rgba(6,78,59,0.08)] md:p-10">
          
          {/* Progress Tracker */}
          <div className="relative mb-12 flex items-center justify-between">
            <div className="absolute top-1/2 left-0 -z-10 h-px w-full -translate-y-1/2 bg-[#bfc9c3]/50"></div>
            {wizardSteps.map((step) => (
              <div key={step.number} className="flex flex-col items-center gap-2 bg-white px-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                  step.active 
                    ? 'bg-[#003527] text-white font-semibold' 
                    : step.number < currentStep 
                    ? 'bg-[#064e3b] text-white' 
                    : 'bg-[#fbf8ff] border border-[#bfc9c3]/50 text-[#707974]'
                }`}>
                  {step.number < currentStep ? <Check className="h-4 w-4" /> : step.number}
                </div>
                <span className={`text-xs font-semibold ${step.active ? 'text-[#003527]' : 'text-[#707974]'}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          <form onSubmit={handleNext} className="space-y-8">
            {/* STEP 1: BASICS */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h3 className="font-serif text-xl text-[#1a1b22] pb-2 border-b border-[#bfc9c3]/30 mb-6">
                  Basic Information
                </h3>

                <div className="space-y-2">
                  <label htmlFor="title" className="block text-xs font-bold uppercase tracking-wider text-[#1a1b22]">
                    Property Title
                  </label>
                  <input 
                    id="title"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Whispering Pines Farmhouse"
                    className="w-full rounded-lg border-[#bfc9c3]/60 bg-[#fbf8ff] px-4 py-3 text-sm text-[#1a1b22] placeholder-[#404944]/50 outline-none transition-colors border focus:border-[#003527] focus:ring-1 focus:ring-[#003527]"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className="block text-xs font-bold uppercase tracking-wider text-[#1a1b22]">
                    Description
                  </label>
                  <textarea 
                    id="description"
                    rows={4}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the unique features and atmosphere of the estate..."
                    className="w-full resize-none rounded-lg border-[#bfc9c3]/60 bg-[#fbf8ff] px-4 py-3 text-sm text-[#1a1b22] placeholder-[#404944]/50 outline-none transition-colors border focus:border-[#003527] focus:ring-1 focus:ring-[#003527]"
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="location" className="block text-xs font-bold uppercase tracking-wider text-[#1a1b22]">
                      Location
                    </label>
                    <div className="relative">
                      <span className="absolute top-1/2 left-3 -translate-y-1/2 text-[#707974]">
                        <MapPin className="h-4 w-4" />
                      </span>
                      <input 
                        id="location"
                        type="text"
                        required
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="City, Region"
                        className="w-full rounded-lg border-[#bfc9c3]/60 bg-[#fbf8ff] pl-10 pr-4 py-3 text-sm text-[#1a1b22] placeholder-[#404944]/50 outline-none transition-colors border focus:border-[#003527] focus:ring-1 focus:ring-[#003527]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="property_type" className="block text-xs font-bold uppercase tracking-wider text-[#1a1b22]">
                      Property Type
                    </label>
                    <select 
                      id="property_type"
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                      className="w-full rounded-lg border-[#bfc9c3]/60 bg-[#fbf8ff] px-4 py-3 text-sm text-[#1a1b22] outline-none transition-colors border focus:border-[#003527] focus:ring-1 focus:ring-[#003527]"
                    >
                      <option value="farmhouse">Farmhouse</option>
                      <option value="cabin">Cabin</option>
                      <option value="estate">Estate</option>
                      <option value="villa">Villa</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: PRICING & CAPACITY */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h3 className="font-serif text-xl text-[#1a1b22] pb-2 border-b border-[#bfc9c3]/30 mb-6">
                  Pricing & Capacity
                </h3>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="price" className="block text-xs font-bold uppercase tracking-wider text-[#1a1b22]">
                      Price Per Night (₹)
                    </label>
                    <input 
                      id="price"
                      type="number"
                      required
                      value={pricePerNight}
                      onChange={(e) => setPricePerNight(e.target.value)}
                      placeholder="e.g. 1500"
                      className="w-full rounded-lg border-[#bfc9c3]/60 bg-[#fbf8ff] px-4 py-3 text-sm text-[#1a1b22] placeholder-[#404944]/50 outline-none transition-colors border focus:border-[#003527] focus:ring-1 focus:ring-[#003527]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="guests" className="block text-xs font-bold uppercase tracking-wider text-[#1a1b22]">
                      Max Guests
                    </label>
                    <input 
                      id="guests"
                      type="number"
                      required
                      value={guests}
                      onChange={(e) => setGuests(e.target.value)}
                      placeholder="e.g. 4"
                      className="w-full rounded-lg border-[#bfc9c3]/60 bg-[#fbf8ff] px-4 py-3 text-sm text-[#1a1b22] placeholder-[#404944]/50 outline-none transition-colors border focus:border-[#003527] focus:ring-1 focus:ring-[#003527]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="bedrooms" className="block text-xs font-bold uppercase tracking-wider text-[#1a1b22]">
                      Bedrooms
                    </label>
                    <input 
                      id="bedrooms"
                      type="number"
                      required
                      value={bedrooms}
                      onChange={(e) => setBedrooms(e.target.value)}
                      placeholder="e.g. 2"
                      className="w-full rounded-lg border-[#bfc9c3]/60 bg-[#fbf8ff] px-4 py-3 text-sm text-[#1a1b22] placeholder-[#404944]/50 outline-none transition-colors border focus:border-[#003527] focus:ring-1 focus:ring-[#003527]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="baths" className="block text-xs font-bold uppercase tracking-wider text-[#1a1b22]">
                      Bathrooms
                    </label>
                    <input 
                      id="baths"
                      type="number"
                      required
                      value={baths}
                      onChange={(e) => setBaths(e.target.value)}
                      placeholder="e.g. 2"
                      className="w-full rounded-lg border-[#bfc9c3]/60 bg-[#fbf8ff] px-4 py-3 text-sm text-[#1a1b22] placeholder-[#404944]/50 outline-none transition-colors border focus:border-[#003527] focus:ring-1 focus:ring-[#003527]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: AMENITIES */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h3 className="font-serif text-xl text-[#1a1b22] pb-2 border-b border-[#bfc9c3]/30 mb-6">
                  Select Amenities
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['Pool', 'Private Chef', 'High-Speed WiFi', 'Indoor Fireplace', 'Air Conditioning', 'Vineyard Views'].map((amenity) => (
                    <div key={amenity} className="flex items-center gap-3 bg-[#fbf8ff] p-4 rounded-lg border border-[#eeedf7] transition-all hover:bg-[#e3e1ec]/30">
                      <div className="relative flex items-center">
                        <input 
                          type="checkbox" 
                          id={`amenity-${amenity}`}
                          checked={selectedAmenities.includes(amenity)}
                          onChange={() => handleAmenityChange(amenity)}
                          className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-[#bfc9c3]/60 checked:border-[#003527] checked:bg-[#003527] focus:outline-none transition-colors"
                        />
                        <Check className="absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                      </div>
                      <label htmlFor={`amenity-${amenity}`} className="text-sm font-semibold text-[#1a1b22] cursor-pointer select-none">
                        {amenity}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 4: PHOTOS */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="pb-2 border-b border-[#bfc9c3]/30 flex justify-between items-center mb-6">
                  <h3 className="font-serif text-xl text-[#1a1b22]">
                    Property Photos
                  </h3>
                  <span className="text-xs font-semibold text-[#707974]">
                    {images.length} {images.length === 1 ? 'photo' : 'photos'} uploaded
                  </span>
                </div>

                {images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                    {images.map((url, idx) => (
                      <div key={idx} className="relative aspect-[4/3] rounded-xl overflow-hidden border border-[#eeedf7] group shadow-sm">
                        <img src={url} alt={`Property photo ${idx + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button 
                            type="button"
                            onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                            className="bg-red-600 text-white rounded-lg px-2.5 py-1 text-xs font-bold hover:bg-red-700 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                        {idx === 0 && (
                          <span className="absolute top-2 left-2 bg-[#003527] text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
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
                      <Loader2 className="h-10 w-10 animate-spin text-[#003527]" />
                      <p className="text-sm text-[#404944] font-semibold">Uploading images...</p>
                    </div>
                  ) : (
                    <div className="text-center space-y-4">
                      <div className="bg-[#003527]/10 p-4 rounded-full w-fit mx-auto text-[#003527]">
                        <Upload className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#1a1b22]">Upload property photos</p>
                        <p className="text-xs text-[#404944] mt-1">Select one or more images (PNG, JPG, JPEG up to 5MB each)</p>
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
                        className="inline-block bg-[#003527] text-white px-6 py-2.5 rounded-lg text-sm font-semibold cursor-pointer hover:bg-[#0b513d] transition-colors"
                      >
                        Select Images
                      </label>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Form Actions Footer */}
            <div className="mt-12 flex justify-end gap-4 border-t border-[#bfc9c3]/30 pt-8">
              <button 
                type="button"
                onClick={handleBack}
                className="rounded-lg border border-[#003527] px-6 py-3 text-sm font-semibold text-[#003527] transition-colors hover:bg-[#e3e1ec]/30"
              >
                {currentStep > 1 ? 'Back' : 'Cancel'}
              </button>
              {currentStep < 4 ? (
                <button 
                  type="submit"
                  className="flex items-center gap-2 rounded-lg bg-[#003527] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0b513d]"
                >
                  <span>Next Step</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button 
                  type="button"
                  disabled={saving || uploading}
                  onClick={handleSubmit}
                  className="flex items-center gap-2 rounded-lg bg-[#003527] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0b513d] disabled:opacity-70"
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
          </form>

        </div>
    </div>
  );
}