'use client';

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
        alert('Profile changes saved successfully!');
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to save changes.');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to database to save profile.');
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
        alert('Profile picture updated successfully!');
      } else {
        alert('Failed to update profile picture URL in database.');
      }
    } catch (err) {
      console.error(err);
      alert('Error uploading image.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#00a877]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-[#1a1b22] font-sans antialiased">
      <main className="max-w-[760px] mx-auto px-6 pt-32 pb-24">
        
        {/* Title */}
        <h1 className="font-serif text-3xl font-semibold text-[#003527] mb-8">
          My Profile
        </h1>

        {/* Profile Card */}
        <div className="bg-white border border-[#bfc9c3]/20 rounded-2xl p-8 shadow-sm shadow-[#064e3b]/3 mb-6 relative">
          {saving && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] rounded-2xl z-10 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#00a877]" />
            </div>
          )}
          
          {/* Avatar Header info */}
          <div className="flex items-center gap-5 mb-8">
            <div className="relative">
              {image ? (
                <div className="h-20 w-20 rounded-full border border-gray-200 overflow-hidden shadow-sm">
                  <img src={image} alt={name} className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="h-20 w-20 rounded-full bg-[#00a877] text-white flex items-center justify-center font-bold text-3xl">
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
                className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:bg-gray-50 text-gray-500 cursor-pointer"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-[#1a1b22]">{name || 'Guest User'}</h2>
              <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold bg-[#e6f4ea] text-[#0f766e] border border-[#a7f3d0]/30 rounded-full lowercase">
                {role}
              </span>
              <p className="text-xs text-gray-400 font-semibold mt-1">
                Member Profile Settings
              </p>
            </div>
          </div>

          {/* View Mode or Edit Mode */}
          {!isEditing ? (
            <div className="space-y-6">
              
              {/* Email display */}
              <div className="flex items-center gap-4 bg-[#f4f6f8] rounded-xl px-5 py-3.5 border border-transparent">
                <Mail className="h-5 w-5 text-gray-400" />
                <span className="text-sm font-semibold text-[#1a1b22]">{email || 'No email provided'}</span>
              </div>

              {/* Phone display */}
              <div className="flex items-center gap-4 bg-[#f4f6f8] rounded-xl px-5 py-3.5 border border-transparent">
                <Phone className="h-5 w-5 text-gray-400" />
                <span className="text-sm font-semibold text-[#1a1b22]">{phone || 'No phone number provided'}</span>
              </div>

              {/* Location display */}
              <div className="flex items-center gap-4 bg-[#f4f6f8] rounded-xl px-5 py-3.5 border border-transparent">
                <MapPin className="h-5 w-5 text-gray-400" />
                <span className="text-sm font-semibold text-[#1a1b22]">{location || 'No location provided'}</span>
              </div>

              <button
                onClick={handleEditClick}
                className="mt-2 px-6 py-2.5 rounded-xl border border-[#00a877] text-[#00a877] text-sm font-bold hover:bg-[#e6f4ea]/30 transition-colors cursor-pointer"
              >
                Edit Profile
              </button>

            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-5">
              
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative flex items-center bg-white rounded-xl border border-[#bfc9c3]/50 focus-within:border-[#00a877] transition-all">
                  <User className="absolute left-4 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full h-12 pl-12 pr-4 bg-transparent text-sm font-semibold outline-none border-none"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Email
                </label>
                <div className="relative flex items-center bg-white rounded-xl border border-[#bfc9c3]/50 focus-within:border-[#00a877] transition-all">
                  <Mail className="absolute left-4 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full h-12 pl-12 pr-4 bg-transparent text-sm font-semibold outline-none border-none"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Phone
                </label>
                <div className="relative flex items-center bg-white rounded-xl border border-[#bfc9c3]/50 focus-within:border-[#00a877] transition-all">
                  <Phone className="absolute left-4 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full h-12 pl-12 pr-4 bg-transparent text-sm font-semibold outline-none border-none"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Location
                </label>
                <div className="relative flex items-center bg-white rounded-xl border border-[#bfc9c3]/50 focus-within:border-[#00a877] transition-all">
                  <MapPin className="absolute left-4 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="w-full h-12 pl-12 pr-4 bg-transparent text-sm font-semibold outline-none border-none"
                    placeholder="India"
                  />
                </div>
              </div>

              {/* Save / Cancel actions */}
              <div className="flex items-center gap-4 pt-3">
                <button
                  type="submit"
                  className="bg-[#00a877] hover:bg-[#009669] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-[#00a877]/10 active:scale-[0.98] transition-all cursor-pointer"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="text-gray-400 hover:text-gray-600 text-sm font-semibold cursor-pointer"
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
