'use client';
import toast from 'react-hot-toast';

import React, { useState, useEffect } from 'react';
import { 
 Search, 
 UserPlus, 
 Trash2, 
 X,
 User,
 Mail,
 Shield,
 ChevronDown
} from 'lucide-react';

interface Member {
 _id: string;
 name: string;
 email: string;
 role: string;
 createdAt?: string;
}

export default function UserManagementPage() {
 const [users, setUsers] = useState<Member[]>([]);
 const [loading, setLoading] = useState(true);
 const [searchTerm, setSearchTerm] = useState('');
 const [roleFilter, setRoleFilter] = useState('all');
 const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

 // Add user modal states
 const [showModal, setShowModal] = useState(false);
 const [newUserName, setNewUserName] = useState('');
 const [newUserEmail, setNewUserEmail] = useState('');
 const [newUserPassword, setNewUserPassword] = useState('');
 const [newUserRole, setNewUserRole] = useState('customer');
 const [isNewUserRoleDropdownOpen, setIsNewUserRoleDropdownOpen] = useState(false);

 const fetchUsers = async () => {
 try {
 const res = await fetch('/api/users');
 if (res.ok) {
 const data = await res.json();
 setUsers(data || []);
 } else {
 setUsers([]);
 }
 } catch (err) {
 console.error('Error fetching users:', err);
 setUsers([]);
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 fetchUsers();
 }, []);

 const handleAddUser = async (e: React.FormEvent) => {
 e.preventDefault();
 try {
 const registerRes = await fetch('/api/auth/register', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 name: newUserName,
 email: newUserEmail,
 password: newUserPassword,
 role: newUserRole === 'customer' ? 'user' : newUserRole
 })
 });

 if (registerRes.ok) {
 toast.success('User created successfully!');
 setShowModal(false);
 setNewUserName('');
 setNewUserEmail('');
 setNewUserPassword('');
 setNewUserRole('customer');
 fetchUsers();
 } else {
 const errData = await registerRes.json();
 toast.error(errData.error || 'Failed to register user.');
 }
 } catch (err) {
 console.error('Error creating user:', err);
 toast.error('Error connecting to registration API.');
 }
 };

  const executeDeleteUser = async (id: string) => {
  try {
  const res = await fetch('/api/users', {
  method: 'DELETE',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ id })
  });

  if (res.ok) {
  toast.success('User deleted successfully!');
  fetchUsers();
  } else {
  toast.error('Failed to delete user.');
  }
  } catch (err) {
  console.error('Error deleting user:', err);
  toast.error('Error deleting user.');
  }
  };

  const handleDeleteUser = (id: string) => {
  const userToDelete = users.find(u => u._id === id);
  if (userToDelete && userToDelete.role === 'admin') {
  toast.error('Administrator accounts cannot be deleted.');
  return;
  }

  toast((t) => (
  <div className="flex flex-col gap-3">
  <p className="text-[13px] font-semibold text-[#1B2A22]">Are you sure you want to delete this user?</p>
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
  executeDeleteUser(id);
  }}
  className="px-4 py-2 text-[11px] font-bold uppercase tracking-wide text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
  >
  Delete
  </button>
  </div>
  </div>
  ), { duration: Infinity, id: 'delete-confirm' });
  };

 // Filtered members list
 const filteredUsers = users.filter(user => {
 const matchesSearch = 
 user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
 user.email.toLowerCase().includes(searchTerm.toLowerCase());
 
 const matchesRole = roleFilter === 'all' || user.role === roleFilter || (roleFilter === 'customer' && user.role === 'user');

 return matchesSearch && matchesRole;
 });

 const getRoleBadgeStyle = (role: string) => {
 const r = role.toLowerCase();
 if (r === 'admin') return 'bg-purple-50 text-purple-600';
 if (r === 'owner' || r === 'host') return 'bg-orange-50 text-orange-500';
 return 'bg-[#e6f4ea] text-[#00a877]';
 };

 const totalAdmins = users.filter(u => u.role === 'admin').length;
 const totalCustomers = users.filter(u => u.role === 'customer' || u.role === 'user').length;

 return (
 <main className="p-6 md:p-10 bg-[#FAF9F6]">
 <div className="mx-auto max-w-[1280px] space-y-8">
 
 {/* Header Block */}
 <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
 <div>
 <h1 className="font-serif text-[32px] font-bold text-[#1B2A22]">
 User Management
 </h1>
 <p className="text-[13px] font-semibold text-gray-400 mt-1">
 Manage roles, details, and permissions for AgriStay members.
 </p>
 </div>
 <button
 onClick={() => setShowModal(true)}
 className="flex items-center justify-center gap-2 bg-[#00a877] hover:bg-[#009669] text-white px-5 py-2.5 rounded-lg text-[13px] font-bold transition-all shadow-sm self-end sm:self-auto"
 >
 <UserPlus className="h-4 w-4"/>
 <span>Add New User</span>
 </button>
 </div>

 {/* User Summary Stats Widgets */}
 <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
 <div className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 p-6 flex flex-col justify-center min-h-[110px]">
 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Total Registered</p>
 <h4 className="font-sans tracking-tight text-[28px] font-bold text-[#1B2A22]">{users.length}</h4>
 </div>
 <div className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 p-6 flex flex-col justify-center min-h-[110px]">
 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Administrators</p>
 <h4 className="font-sans tracking-tight text-[28px] font-bold text-purple-600">{totalAdmins}</h4>
 </div>
 <div className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 p-6 flex flex-col justify-center min-h-[110px]">
 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Customers / Guests</p>
 <h4 className="font-sans tracking-tight text-[28px] font-bold text-[#00a877]">{totalCustomers}</h4>
 </div>
 </div>

 {/* Filter and Search Bar Row */}
 <div className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
 {/* Search bar */}
 <div className="w-full md:flex-1 relative flex items-center bg-[#f9fafb] rounded-xl border border-transparent focus-within:border-gray-200 focus-within:bg-white transition-all">
 <Search className="absolute left-4 h-4 w-4 text-gray-400"/>
 <input 
 type="text"
 placeholder="Search by name or email..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className="w-full h-11 pl-11 pr-4 bg-transparent text-[13px] font-semibold text-[#1B2A22] outline-none border-none placeholder:text-gray-400 placeholder:font-medium"
 />
 </div>

  {/* Role selector dropdown */}
  <div className="w-full md:w-auto min-w-[180px] relative">
  <div className="relative">
  <button 
  onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
  className="flex items-center justify-between gap-2 text-[13px] font-bold text-[#1B2A22] bg-[#f9fafb] border border-transparent rounded-xl px-4 h-11 hover:bg-gray-100 hover:border-[#00a877]/30 focus:outline-none focus:border-[#00a877] focus:ring-1 focus:ring-[#00a877] transition-all w-full"
  >
  <span>
  {roleFilter === 'all' && 'All Roles'}
  {roleFilter === 'admin' && 'Administrators'}
  {roleFilter === 'customer' && 'Customers'}
  </span>
  <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${isRoleDropdownOpen ? 'bg-[#e6f4ea] text-[#00a877]' : 'bg-transparent text-gray-500'}`}>
  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isRoleDropdownOpen ? 'rotate-180' : ''}`} />
  </div>
  </button>
 
  {isRoleDropdownOpen && (
  <>
  <div 
  className="fixed inset-0 z-40"
  onClick={() => setIsRoleDropdownOpen(false)}
  ></div>
  <div className="absolute top-full right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] py-2 z-50 overflow-hidden w-full min-w-[160px]">
  {[
  { value: 'all', label: 'All Roles' },
  { value: 'admin', label: 'Administrators' },
      { value: 'customer', label: 'Customers' }
  ].map((opt) => (
  <button
  key={opt.value}
  onClick={() => {
  setRoleFilter(opt.value);
  setIsRoleDropdownOpen(false);
  }}
  className={`w-full text-left px-5 py-2.5 text-[13px] font-semibold transition-colors ${
  roleFilter === opt.value
  ? 'bg-[#e6f4ea] text-[#00a877]'
  : 'text-gray-600 hover:bg-gray-50'
  }`}
  >
  {opt.label}
  </button>
  ))}
  </div>
  </>
  )}
  </div>
  </div>
 </div>

 {/* Table View Layout */}
 <div className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse min-w-[900px]">
 <thead>
 <tr className="border-b border-gray-100 bg-[#fafafa] text-[10px] font-bold text-gray-500 tracking-wider uppercase">
 <th className="px-8 py-5">User Details</th>
 <th className="px-6 py-5">Email Address</th>
 <th className="px-6 py-5">Role Permission</th>
 <th className="px-6 py-5">Date Joined</th>
 <th className="px-8 py-5 text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-50 text-[13px] text-gray-600 font-semibold">
 {loading ? (
 <tr>
 <td colSpan={5} className="text-center py-12 text-gray-400 font-medium">
 Loading directory...
 </td>
 </tr>
 ) : filteredUsers.length === 0 ? (
 <tr>
 <td colSpan={5} className="text-center py-12 text-gray-400 font-medium">
 No members matched your search criteria.
 </td>
 </tr>
 ) : (
 filteredUsers.map((user) => (
 <tr key={user._id} className="hover:bg-[#fafafa] transition-colors">
 <td className="px-8 py-4">
 <div className="flex items-center gap-4">
 <div className="h-10 w-10 rounded-full bg-[#e6f4ea] text-[#00a877] flex items-center justify-center font-sans font-bold text-sm">
 {user.name.charAt(0).toUpperCase()}
 </div>
 <div>
 <p className="font-bold text-[#1B2A22] text-[14px]">{user.name}</p>
 <p className="text-[10px] font-bold text-gray-400 mt-0.5">ID: {user._id.slice(-6).toUpperCase()}</p>
 </div>
 </div>
 </td>
 <td className="px-6 py-4">
 {user.email}
 </td>
 <td className="px-6 py-4">
 <span className={`inline-block px-3 py-1 text-[10px] font-bold rounded-full tracking-wide ${getRoleBadgeStyle(user.role)}`}>
 {user.role === 'customer' ? 'user' : user.role.toLowerCase()}
 </span>
 </td>
 <td className="px-6 py-4 text-gray-500 font-medium">
 {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '7/6/2026'}
 </td>
 <td className="px-8 py-4 text-right">
 {user.role !== 'admin' && (
 <button
 onClick={() => handleDeleteUser(user._id)}
 className="p-2 text-gray-500 hover:text-red-500 transition-colors"
 >
 <Trash2 className="h-4 w-4"/>
 </button>
 )}
 </td>
 </tr>
 ))
 )}
 </tbody>
 </table>
 </div>
 </div>

 </div>

 {/* Add User Modal */}
 {showModal && (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm sm:p-4">
 <div className="bg-white w-full h-full sm:h-auto sm:max-w-[480px] sm:rounded-2xl shadow-xl p-6 sm:p-8 relative animate-fade-in flex flex-col justify-center overflow-y-auto">
 
 <button 
 onClick={() => setShowModal(false)}
 className="absolute top-4 right-4 p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-400"
 >
 <X className="h-5 w-5"/>
 </button>

 <div className="mb-8 text-center">
 <h3 className="font-serif text-2xl font-bold text-[#1B2A22]">New User</h3>
 <p className="text-[13px] font-semibold text-gray-400 mt-2">Create a new user account</p>
 </div>

 <form onSubmit={handleAddUser} className="space-y-5" autoComplete="off">
 
 {/* Full Name */}
 <div className="space-y-2">
 <label className="block text-[11px] font-bold uppercase tracking-wide text-gray-500">Full Name</label>
 <div className="relative flex items-center bg-[#f9fafb] rounded-xl border border-transparent focus-within:border-gray-200 focus-within:bg-white transition-all">
 <User className="absolute left-4 h-4 w-4 text-gray-400"/>
 <input 
 type="text"
 required
 value={newUserName}
 onChange={(e) => setNewUserName(e.target.value)}
 placeholder="Julianne Smith"
 className="w-full h-12 pl-11 pr-4 bg-transparent text-[13px] font-bold text-[#1B2A22] outline-none border-none placeholder:text-gray-400"
 />
 </div>
 </div>

 {/* Email */}
 <div className="space-y-2">
 <label className="block text-[11px] font-bold uppercase tracking-wide text-gray-500">Email Address</label>
 <div className="relative flex items-center bg-[#f9fafb] rounded-xl border border-transparent focus-within:border-gray-200 focus-within:bg-white transition-all">
 <Mail className="absolute left-4 h-4 w-4 text-gray-400"/>
 <input 
 type="email"
 required
 autoComplete="off"
 value={newUserEmail}
 onChange={(e) => setNewUserEmail(e.target.value)}
 placeholder="julianne@theestate.com"
 className="w-full h-12 pl-11 pr-4 bg-transparent text-[13px] font-bold text-[#1B2A22] outline-none border-none placeholder:text-gray-400"
 />
 </div>
 </div>

 {/* Password */}
 <div className="space-y-2">
 <label className="block text-[11px] font-bold uppercase tracking-wide text-gray-500">Temporary Password</label>
 <div className="relative flex items-center bg-[#f9fafb] rounded-xl border border-transparent focus-within:border-gray-200 focus-within:bg-white transition-all">
 <Shield className="absolute left-4 h-4 w-4 text-gray-400"/>
 <input 
 type="password"
 required
 autoComplete="new-password"
 value={newUserPassword}
 onChange={(e) => setNewUserPassword(e.target.value)}
 placeholder="••••••••"
 className="w-full h-12 pl-11 pr-4 bg-transparent text-[13px] font-bold text-[#1B2A22] outline-none border-none placeholder:text-gray-400"
 />
 </div>
 </div>

 {/* Role Selection */}
 <div className="space-y-2">
 <label className="block text-[11px] font-bold uppercase tracking-wide text-gray-500">Access Level</label>
 <div className="relative">
 <button
 type="button"
 onClick={() => setIsNewUserRoleDropdownOpen(!isNewUserRoleDropdownOpen)}
 className="w-full h-12 px-4 pr-10 flex items-center justify-between bg-[#f9fafb] rounded-xl border border-transparent text-[13px] font-bold text-[#1B2A22] outline-none cursor-pointer hover:bg-gray-100 transition-colors"
 >
 <span>{newUserRole === 'admin' ? 'Administrator' : 'Customer / Guest'}</span>
 <ChevronDown className={`absolute right-4 h-4 w-4 text-gray-400 transition-transform ${isNewUserRoleDropdownOpen ? 'rotate-180' : ''}`} />
 </button>

 {isNewUserRoleDropdownOpen && (
 <>
 <div 
 className="fixed inset-0 z-40" 
 onClick={() => setIsNewUserRoleDropdownOpen(false)}
 ></div>
 <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] py-2 z-50 overflow-hidden">
 <button
 type="button"
 onClick={() => { setNewUserRole('customer'); setIsNewUserRoleDropdownOpen(false); }}
 className={`w-full text-left px-5 py-2.5 text-[13px] font-semibold transition-colors ${newUserRole === 'customer' ? 'bg-[#e6f4ea] text-[#00a877]' : 'text-gray-600 hover:bg-gray-50'}`}
 >
 Customer / Guest
 </button>
 <button
 type="button"
 onClick={() => { setNewUserRole('admin'); setIsNewUserRoleDropdownOpen(false); }}
 className={`w-full text-left px-5 py-2.5 text-[13px] font-semibold transition-colors ${newUserRole === 'admin' ? 'bg-[#e6f4ea] text-[#00a877]' : 'text-gray-600 hover:bg-gray-50'}`}
 >
 Administrator
 </button>
 </div>
 </>
 )}
 </div>
 </div>

 {/* Submit */}
 <button 
 type="submit"
 className="w-full h-12 bg-[#00a877] hover:bg-[#009669] rounded-xl text-white text-[13px] font-bold transition-all active:scale-[0.99] mt-6 shadow-sm"
 >
 Grant Access
 </button>

 </form>
 </div>
 </div>
 )}

 </main>
 );
}
