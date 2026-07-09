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
 <Loader2 className="h-10 w-10 animate-spin border-t-2 border-[#1B2A22] rounded-full text-transparent"/>
 </div>
 );
 }

 return (
 <div className="min-h-screen bg-[#FAF9F6] text-[#1B2A22] font-sans antialiased mt-20">
 <main className="max-w-[760px] mx-auto px-6 pt-16 pb-24">
 
 {/* Title */}
 <div className="mb-8">
 <h1 className="font-serif text-[32px] font-bold text-[#004d40]">
 My Profile
 </h1>
 </div>

 {/* Profile Card */}
 <div className="bg-white rounded-2xl border border-gray-100 p-8 md:p-10 relative shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
 {saving && (
 <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-2xl">
 <Loader2 className="h-8 w-8 animate-spin border-t-2 border-[#1B2A22] rounded-full text-transparent"/>
 </div>
 )}
 
 {/* Avatar Header info */}
 <div className="flex items-center gap-6 mb-10">
 <div className="relative shrink-0">
 {image ? (
 <div className="h-24 w-24 rounded-full overflow-hidden bg-[#FAF9F6]">
 <img src={image} alt={name} className="h-full w-full object-cover"/>
 </div>
 ) : (
 <div className="h-24 w-24 rounded-full bg-[#00a877] text-white flex items-center justify-center font-sans text-4xl font-bold">
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
 className="absolute bottom-0 right-0 h-8 w-8 bg-white rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-gray-500 transition-colors cursor-pointer shadow-sm"
 >
 <Camera className="h-3.5 w-3.5"/>
 </button>
 </div>

 <div className="space-y-2">
 <h2 className="font-bold text-xl text-[#1B2A22]">{name || 'Guest User'}</h2>
 <div className="flex flex-col items-start gap-1">
 <span className={`inline-block px-3 py-0.5 text-[10px] font-bold rounded-full tracking-wide ${
 role === 'admin' 
 ? 'bg-[#e6f4ea] text-[#00a877]'
 : role === 'owner'
 ? 'bg-orange-50 text-orange-500'
 : 'bg-[#e6f4ea] text-[#00a877]'
 }`}>
 {role}
 </span>
 <span className="text-[11px] font-bold text-gray-400 mt-1">
 Member Profile Settings
 </span>
 </div>
 </div>
 </div>

 {/* View Mode or Edit Mode */}
 {!isEditing ? (
 <div className="space-y-8">
 
 {/* Info Items */}
 <div className="grid gap-4">
 <div className="flex items-center gap-4 bg-[#f9fafb] rounded-xl px-5 py-3">
 <Mail className="h-4 w-4 text-gray-400 shrink-0"/>
 <p className="text-[13px] font-bold text-[#1B2A22]">{email || 'Not provided'}</p>
 </div>

 <div className="flex items-center gap-4 bg-[#f9fafb] rounded-xl px-5 py-3">
 <Phone className="h-4 w-4 text-gray-400 shrink-0"/>
 <p className="text-[13px] font-bold text-[#1B2A22]">{phone || 'No phone number provided'}</p>
 </div>

 <div className="flex items-center gap-4 bg-[#f9fafb] rounded-xl px-5 py-3">
 <MapPin className="h-4 w-4 text-gray-400 shrink-0"/>
 <p className="text-[13px] font-bold text-[#1B2A22]">{location || 'No location provided'}</p>
 </div>
 </div>

 <div className="pt-2">
 <button
 onClick={handleEditClick}
 className="inline-block border border-[#00a877] text-[#00a877] bg-transparent hover:bg-[#00a877] hover:text-white rounded-lg px-6 py-2.5 text-[13px] font-bold transition-colors"
 >
 Edit Profile
 </button>
 </div>

 </div>
 ) : (
 <form onSubmit={handleSave} className="space-y-6 pt-4 border-t border-gray-100">
 
 {/* Full Name */}
 <div className="space-y-2">
 <label className="block text-[11px] font-bold uppercase tracking-wide text-gray-500">
 Full Name
 </label>
 <div className="relative flex items-center bg-[#f9fafb] rounded-xl border border-transparent focus-within:border-gray-200 focus-within:bg-white transition-all">
 <User className="absolute left-4 h-4 w-4 text-gray-400"/>
 <input
 type="text"
 required
 value={editName}
 onChange={(e) => setEditName(e.target.value)}
 className="w-full h-11 pl-11 pr-4 bg-transparent text-[13px] font-bold text-[#1B2A22] outline-none border-none placeholder:text-gray-400"
 />
 </div>
 </div>

 {/* Email */}
 <div className="space-y-2">
 <label className="block text-[11px] font-bold uppercase tracking-wide text-gray-500">
 Email Address
 </label>
 <div className="relative flex items-center bg-[#f9fafb] rounded-xl border border-transparent focus-within:border-gray-200 focus-within:bg-white transition-all">
 <Mail className="absolute left-4 h-4 w-4 text-gray-400"/>
 <input
 type="email"
 required
 value={editEmail}
 onChange={(e) => setEditEmail(e.target.value)}
 className="w-full h-11 pl-11 pr-4 bg-transparent text-[13px] font-bold text-[#1B2A22] outline-none border-none placeholder:text-gray-400"
 />
 </div>
 </div>

 {/* Phone */}
 <div className="space-y-2">
 <label className="block text-[11px] font-bold uppercase tracking-wide text-gray-500">
 Phone Number
 </label>
 <div className="relative flex items-center bg-[#f9fafb] rounded-xl border border-transparent focus-within:border-gray-200 focus-within:bg-white transition-all">
 <Phone className="absolute left-4 h-4 w-4 text-gray-400"/>
 <input
 type="text"
 value={editPhone}
 onChange={(e) => setEditPhone(e.target.value)}
 className="w-full h-11 pl-11 pr-4 bg-transparent text-[13px] font-bold text-[#1B2A22] outline-none border-none placeholder:text-gray-400"
 placeholder="+91"
 />
 </div>
 </div>

 {/* Location */}
 <div className="space-y-2">
 <label className="block text-[11px] font-bold uppercase tracking-wide text-gray-500">
 Location
 </label>
 <div className="relative flex items-center bg-[#f9fafb] rounded-xl border border-transparent focus-within:border-gray-200 focus-within:bg-white transition-all">
 <MapPin className="absolute left-4 h-4 w-4 text-gray-400"/>
 <input
 type="text"
 value={editLocation}
 onChange={(e) => setEditLocation(e.target.value)}
 className="w-full h-11 pl-11 pr-4 bg-transparent text-[13px] font-bold text-[#1B2A22] outline-none border-none placeholder:text-gray-400"
 placeholder="City, Country"
 />
 </div>
 </div>

 {/* Save / Cancel actions */}
 <div className="flex items-center gap-4 pt-6">
 <button
 type="submit"
 className="bg-[#00a877] hover:bg-[#009669] text-white px-8 py-2.5 rounded-xl text-[13px] font-bold transition-colors cursor-pointer shadow-sm"
 >
 Save Changes
 </button>
 <button
 type="button"
 onClick={handleCancel}
 className="text-gray-400 hover:text-gray-600 text-[13px] font-bold cursor-pointer transition-colors"
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
