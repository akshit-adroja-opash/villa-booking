'use client';
import toast from 'react-hot-toast';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Camera,
  Loader2
} from 'lucide-react';

export default function SettingsPage() {
  const { data: session, update } = useSession() || {};
  const role = (session?.user as any)?.role || 'customer';

  // Toggle View/Edit modes
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile data states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [image, setImage] = useState('');

  // Temporary buffer for edits
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editLocation, setEditLocation] = useState('');

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/users/profile');
        if (res.ok) {
          const data = await res.json();
          setName(data.name || '');
          setEmail(data.email || '');
          setPhone(data.phone || '');
          setLocation(data.location || '');
          setImage(data.image || '');

          setEditName(data.name || '');
          setEditEmail(data.email || '');
          setEditPhone(data.phone || '');
          setEditLocation(data.location || '');
        }
      } catch (err) {
        console.error('Failed to load profile details:', err);
      } finally {
        setLoading(false);
      }
    }
    if (session) {
      loadProfile();
    } else {
      setLoading(false);
    }
  }, [session]);

  const handleEditClick = () => {
    setEditName(name);
    setEditEmail(email);
    setEditPhone(phone);
    setEditLocation(location);
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          email: editEmail,
          phone: editPhone,
          location: editLocation,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setName(updated.name);
        setEmail(updated.email);
        setPhone(updated.phone || '');
        setLocation(updated.location || '');
        setIsEditing(false);
        if (update) {
          await update({
            name: updated.name,
            email: updated.email,
            image: updated.image || image
          });
        }
        toast.success('Profile changes saved successfully!');
      } else {
        const errData = await res.json();
        toast.error(errData.error || 'Failed to save changes.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error connecting to database to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setSaving(true);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      
      const profileRes = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: data.url }),
      });

      if (profileRes.ok) {
        setImage(data.url);
        if (update) {
          await update({
            image: data.url
          });
        }
        toast.success('Profile picture updated successfully!');
      } else {
        toast.error('Failed to update profile picture URL in database.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error uploading image.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin border-t-2 border-[#D4AF37] rounded-full text-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1B2A22] font-sans antialiased">
      <main className="max-w-[760px] mx-auto px-6 pt-24 pb-24">
        
        {/* Title */}
        <div className="mb-10">
          <h1 className="font-serif text-4xl font-normal text-[#1B2A22]">
            My Settings
          </h1>
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#1B2A22]/60 mt-2">
            Manage your personal profile
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white border border-[#1B2A22]/10 p-10 relative">
          {saving && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin border-t-2 border-[#D4AF37] rounded-full text-transparent" />
            </div>
          )}
          
          {/* Avatar Header info */}
          <div className="flex items-center gap-6 mb-12">
            <div className="relative shrink-0">
              {image ? (
                <div className="h-24 w-24 border border-[#1B2A22]/10 overflow-hidden bg-[#FAF9F6]">
                  <img src={image} alt={name} className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="h-24 w-24 bg-[#1B2A22] text-[#D4AF37] flex items-center justify-center font-serif text-4xl">
                  {name ? name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <input
                type="file"
                id="avatar-input"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
              <button 
                type="button"
                onClick={() => document.getElementById('avatar-input')?.click()}
                className="absolute -bottom-3 -right-3 h-8 w-8 bg-white border border-[#1B2A22]/10 flex items-center justify-center hover:bg-[#00a877] hover:border-[#00a877] hover:text-white text-[#1B2A22] transition-colors cursor-pointer shadow-sm"
              >
                <Camera className="h-3 w-3" />
              </button>
            </div>

            <div className="space-y-2">
              <h2 className="font-serif text-3xl font-normal text-[#1B2A22]">{name || 'Guest User'}</h2>
              <div className="flex items-center gap-3">
                <span className={`inline-block px-3 py-1 text-[9px] font-bold uppercase tracking-widest border ${
                  role === 'admin' 
                    ? 'bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/30'
                    : role === 'owner'
                      ? 'bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/30'
                      : 'bg-[#e6f4ea] text-[#00a877] border-[#00a877]/20'
                }`}>
                  {role}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-[#1B2A22]/40 font-bold">
                  Member since 2024
                </span>
              </div>
            </div>
          </div>

          {/* View Mode or Edit Mode */}
          {!isEditing ? (
            <div className="space-y-6">
              
              {/* Info Items */}
              <div className="grid gap-6">
                <div className="flex items-center gap-5 border-b border-[#1B2A22]/10 pb-6">
                  <div className="flex h-10 w-10 items-center justify-center bg-[#FAF9F6] border border-[#1B2A22]/10 text-[#1B2A22]/50 shrink-0">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-[#1B2A22]/50 font-bold mb-1">Email Address</p>
                    <p className="font-serif text-lg text-[#1B2A22]">{email || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-5 border-b border-[#1B2A22]/10 pb-6">
                  <div className="flex h-10 w-10 items-center justify-center bg-[#FAF9F6] border border-[#1B2A22]/10 text-[#1B2A22]/50 shrink-0">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-[#1B2A22]/50 font-bold mb-1">Phone Number</p>
                    <p className="font-serif text-lg text-[#1B2A22]">{phone || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-5 border-b border-[#1B2A22]/10 pb-6">
                  <div className="flex h-10 w-10 items-center justify-center bg-[#FAF9F6] border border-[#1B2A22]/10 text-[#1B2A22]/50 shrink-0">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-[#1B2A22]/50 font-bold mb-1">Location</p>
                    <p className="font-serif text-lg text-[#1B2A22]">{location || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleEditClick}
                  className="inline-block border border-[#1B2A22] bg-transparent hover:bg-[#1B2A22] hover:text-[#D4AF37] px-8 py-3 text-[10px] font-bold uppercase tracking-widest text-[#1B2A22] transition-colors"
                >
                  Edit Details
                </button>
              </div>

            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-6 pt-4 border-t border-[#1B2A22]/10">
              
              {/* Full Name */}
              <div className="space-y-2">
                <label className="block text-[9px] font-bold text-[#1B2A22]/70 uppercase tracking-widest">
                  Full Name
                </label>
                <div className="relative flex items-center bg-[#FAF9F6] border border-[#1B2A22]/10 focus-within:border-[#D4AF37] transition-all">
                  <User className="absolute left-4 h-4 w-4 text-[#1B2A22]/40" />
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full h-12 pl-12 pr-4 bg-transparent text-sm font-semibold text-[#1B2A22] outline-none border-none"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-[9px] font-bold text-[#1B2A22]/70 uppercase tracking-widest">
                  Email
                </label>
                <div className="relative flex items-center bg-[#FAF9F6] border border-[#1B2A22]/10 focus-within:border-[#D4AF37] transition-all">
                  <Mail className="absolute left-4 h-4 w-4 text-[#1B2A22]/40" />
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full h-12 pl-12 pr-4 bg-transparent text-sm font-semibold text-[#1B2A22] outline-none border-none"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="block text-[9px] font-bold text-[#1B2A22]/70 uppercase tracking-widest">
                  Phone
                </label>
                <div className="relative flex items-center bg-[#FAF9F6] border border-[#1B2A22]/10 focus-within:border-[#D4AF37] transition-all">
                  <Phone className="absolute left-4 h-4 w-4 text-[#1B2A22]/40" />
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full h-12 pl-12 pr-4 bg-transparent text-sm font-semibold text-[#1B2A22] outline-none border-none"
                    placeholder="+91"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="block text-[9px] font-bold text-[#1B2A22]/70 uppercase tracking-widest">
                  Location
                </label>
                <div className="relative flex items-center bg-[#FAF9F6] border border-[#1B2A22]/10 focus-within:border-[#D4AF37] transition-all">
                  <MapPin className="absolute left-4 h-4 w-4 text-[#1B2A22]/40" />
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="w-full h-12 pl-12 pr-4 bg-transparent text-sm font-semibold text-[#1B2A22] outline-none border-none"
                    placeholder="City, Country"
                  />
                </div>
              </div>

              {/* Save / Cancel actions */}
              <div className="flex items-center gap-4 pt-6">
                <button
                  type="submit"
                  className="bg-[#00a877] hover:bg-[#009669] text-white px-8 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer shadow-md shadow-[#00a877]/10"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="text-[#1B2A22]/50 hover:text-[#1B2A22] text-[10px] uppercase tracking-widest font-bold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
              </div>

            </form>
          )}

        </div>

      </main>
    </div>
  );
}
