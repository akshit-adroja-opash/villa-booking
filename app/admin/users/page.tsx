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
 ChevronDown,
 Pencil,
 Eye,
 EyeOff
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
  const [sortColumn, setSortColumn] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
 const [currentPage, setCurrentPage] = useState(1);
 const itemsPerPage = 8;

  const [sortFilter, setSortFilter] = useState('newest');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, sortFilter]);

 // Add user modal states
 const [showModal, setShowModal] = useState(false);
 const [editingUserId, setEditingUserId] = useState<string | null>(null);
 const [newUserName, setNewUserName] = useState('');
 const [newUserEmail, setNewUserEmail] = useState('');
 const [newUserPassword, setNewUserPassword] = useState('');
 const [newUserRole, setNewUserRole] = useState('customer');
 const [isNewUserRoleDropdownOpen, setIsNewUserRoleDropdownOpen] = useState(false);
 const [showPassword, setShowPassword] = useState(false);
 const [errors, setErrors] = useState<{name?: string; email?: string; password?: string;}>({});

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

 const handleEditClick = (user: Member) => {
   setEditingUserId(user._id);
   setNewUserName(user.name);
   setNewUserEmail(user.email);
   setNewUserRole(user.role === 'user' ? 'customer' : user.role);
   setNewUserPassword(''); // clear password field
   setErrors({});
   setShowModal(true);
 };

 const handleOpenAddModal = () => {
   setEditingUserId(null);
   setNewUserName('');
   setNewUserEmail('');
   setNewUserPassword('');
   setNewUserRole('customer');
   setErrors({});
   setShowModal(true);
 };

 const handleAddUser = async (e: React.FormEvent) => {
  e.preventDefault();
  const newErrors: {name?: string; email?: string; password?: string;} = {};
  
  if (!newUserName.trim()) {
    newErrors.name = 'Full name is required';
  }
  if (!newUserEmail.trim()) {
    newErrors.email = 'Email address is required';
  }
  if (!editingUserId && !newUserPassword.trim()) {
    newErrors.password = 'Temporary password is required';
  }

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }
  
  setErrors({});

  try {
  if (editingUserId) {
   const res = await fetch('/api/users', {
     method: 'PATCH',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       id: editingUserId,
       name: newUserName,
       email: newUserEmail,
       role: newUserRole
     })
   });
   if (res.ok) {
     toast.success('User updated successfully!');
     setShowModal(false);
     fetchUsers();
   } else {
     const errData = await res.json();
     toast.error(errData.error || 'Failed to update user.');
   }
 } else {
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
 }
 } catch (err) {
 console.error('Error saving user:', err);
 toast.error('Could not save user.');
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
  toast.error('Could not delete user.');
  }
  };

  const handleDeleteUser = (id: string) => {
  const userToDelete = users.find(u => u._id === id);
  if (userToDelete && userToDelete.role === 'admin') {
  toast.error('Administrator accounts cannot be deleted.');
  return;
  }

  toast.custom((t) => (
      <div 
        className={`bg-white border border-gray-100 shadow-[0_10px_40px_rgb(0,0,0,0.12)] rounded-xl p-5 flex flex-col gap-3 max-w-sm w-full mb-4 transition-all duration-500 transform ${
          t.visible ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'
        }`}
      >
        <p className="text-[14px] font-bold text-[#1B2A22]">Delete User?</p>
        <p className="text-[13px] text-gray-500 font-medium -mt-1">Are you sure you want to delete this user? This cannot be undone.</p>
        <div className="flex gap-2 justify-end mt-2">
          <button 
            onClick={() => toast.dismiss(t.id)}
            className="px-4 py-2 text-[12px] font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              toast.dismiss(t.id);
              executeDeleteUser(id);
            }}
            className="px-4 py-2 text-[12px] font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors shadow-sm"
          >
            Delete
          </button>
        </div>
      </div>
    ), { duration: Infinity, id: 'delete-confirm', position: 'bottom-center' });
  };

 // Filtered members list
 const filteredUsers = users.filter(user => {
 const matchesSearch = 
 user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
 user.email.toLowerCase().includes(searchTerm.toLowerCase());
 
 const matchesRole = roleFilter === 'all' || user.role === roleFilter || (roleFilter === 'customer' && user.role === 'user');

 return matchesSearch && matchesRole;
 }).sort((a, b) => {
    if (sortFilter === 'newest') {
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    } else if (sortFilter === 'oldest') {
      return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
    } else if (sortFilter === 'name-asc') {
      return a.name.localeCompare(b.name);
    } else if (sortFilter === 'name-desc') {
      return b.name.localeCompare(a.name);
    }
    return 0;
  });

 const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
 const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
 Manage roles, details, and permissions for Enjoy Farm members.
 </p>
 </div>
 <button
 onClick={handleOpenAddModal}
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
 <div className="w-full md:flex-1 relative flex items-center bg-[#f9fafb] rounded-xl border border-transparent focus-within:border-[#00a877] focus-within:bg-white transition-all">
 <Search className="absolute left-4 h-4 w-4 text-gray-400"/>
 <input 
 type="text"
 placeholder="Search by name or email..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className="w-full h-11 pl-11 pr-4 bg-transparent text-[13px] font-semibold text-[#1B2A22] outline-none border-none placeholder:text-gray-400 placeholder:font-medium"
 />
 </div>

  <div className="flex w-full md:w-auto items-center gap-4">
    {/* Role selector dropdown */}
    <div className="w-full md:w-auto min-w-[160px] relative">
    <div className="relative">
    <button 
    onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
    className="flex items-center justify-between gap-2 text-[13px] font-bold text-[#1B2A22] bg-[#f9fafb] border border-transparent rounded-xl px-4 h-11 hover:bg-gray-100 hover:border-[#00a877]/30 focus:outline-none focus:border-[#00a877] transition-all w-full"
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

    {/* Sort selector dropdown */}
    <div className="w-full md:w-auto min-w-[160px] relative">
    <div className="relative">
    <button 
    onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
    className="flex items-center justify-between gap-2 text-[13px] font-bold text-[#1B2A22] bg-[#f9fafb] border border-transparent rounded-xl px-4 h-11 hover:bg-gray-100 hover:border-[#00a877]/30 focus:outline-none focus:border-[#00a877] transition-all w-full"
    >
    <span>
    {sortFilter === 'newest' && 'Newest First'}
    {sortFilter === 'oldest' && 'Oldest First'}
    {sortFilter === 'name-asc' && 'Name (A-Z)'}
    {sortFilter === 'name-desc' && 'Name (Z-A)'}
    </span>
    <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${isSortDropdownOpen ? 'bg-[#e6f4ea] text-[#00a877]' : 'bg-transparent text-gray-500'}`}>
    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isSortDropdownOpen ? 'rotate-180' : ''}`} />
    </div>
    </button>
   
    {isSortDropdownOpen && (
    <>
    <div 
    className="fixed inset-0 z-40"
    onClick={() => setIsSortDropdownOpen(false)}
    ></div>
    <div className="absolute top-full right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] py-2 z-50 overflow-hidden w-full min-w-[160px]">
    {[
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'name-asc', label: 'Name (A-Z)' },
    { value: 'name-desc', label: 'Name (Z-A)' }
    ].map((opt) => (
    <button
    key={opt.value}
    onClick={() => {
    setSortFilter(opt.value);
    setIsSortDropdownOpen(false);
    }}
    className={`w-full text-left px-5 py-2.5 text-[13px] font-semibold transition-colors ${
    sortFilter === opt.value
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
 paginatedUsers.map((user) => (
 <tr key={user._id} className="hover:bg-[#fafafa] transition-colors">
 <td className="px-8 py-4">
 <div className="flex items-center gap-4">
 <div className="h-10 w-10 rounded-full bg-[#e6f4ea] text-[#00a877] flex items-center justify-center font-sans font-bold text-sm">
 {user.name.charAt(0).toUpperCase()}
 </div>
 <div>
 <p className="font-bold text-[#1B2A22] text-[14px]">{user.name}</p>
 </div>
 </div>
 </td>
 <td className="px-6 py-4">
 {user.email}
 </td>
 <td className="px-6 py-4">
 <span className={`inline-block px-3 py-1 text-[10px] font-bold rounded-full tracking-wide ${getRoleBadgeStyle(user.role)}`}>
 {user.role === 'customer' || user.role === 'user' ? 'Customer' : user.role === 'admin' ? 'Admin' : user.role}
 </span>
 </td>
 <td className="px-6 py-4 text-gray-500 font-medium">
 {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
 </td>
  <td className="px-8 py-4 text-right flex justify-end gap-2">
  <button
  onClick={() => handleEditClick(user)}
  className="p-2 text-gray-400 hover:text-[#00a877] transition-colors"
  title="Edit user"
  >
  <Pencil className="h-4 w-4"/>
  </button>
  {user.role !== 'admin' && (
  <button
  onClick={() => handleDeleteUser(user._id)}
  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
  title="Delete user"
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
 {totalPages > 0 && (
    <div className="flex items-center justify-between border-t border-gray-100 bg-white px-6 py-4">
      <p className="text-[13px] font-medium text-gray-500 hidden sm:block">
        Showing <span className="font-bold text-[#1B2A22]">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
        <span className="font-bold text-[#1B2A22]">{Math.min(currentPage * itemsPerPage, filteredUsers.length)}</span> of{' '}
        <span className="font-bold text-[#1B2A22]">{filteredUsers.length}</span> results
      </p>
      <div className="flex items-center gap-1.5 w-full sm:w-auto justify-center sm:justify-end">
        <button 
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1.5 text-[12px] font-bold text-gray-500 hover:text-[#002E1E] disabled:opacity-50 transition-colors bg-gray-50 hover:bg-gray-100 rounded-md"
        >
          Previous
        </button>
        <div className="flex items-center gap-1 mx-1">
          <span className="text-[12px] font-bold text-gray-500 sm:hidden mx-2">
            Page {currentPage} of {totalPages}
          </span>
          <div className="hidden sm:flex items-center gap-1">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx + 1)}
                className={`w-8 h-8 flex items-center justify-center text-[12px] font-bold rounded-md transition-colors ${
                  currentPage === idx + 1
                    ? 'bg-[#00a877] text-white shadow-sm'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-[#1B2A22]'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
        <button 
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 text-[12px] font-bold text-gray-500 hover:text-[#002E1E] disabled:opacity-50 transition-colors bg-gray-50 hover:bg-gray-100 rounded-md"
        >
          Next
        </button>
      </div>
    </div>
  )}
 </div>

 </div>

 {/* Add User Modal */}
 {showModal && (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm sm:p-4">
 <div className="bg-white w-full h-full sm:h-auto sm:max-w-[480px] sm:rounded-2xl shadow-xl p-6 sm:p-8 relative animate-fade-in flex flex-col justify-center">
 
 <button 
 onClick={() => setShowModal(false)}
 className="absolute top-4 right-4 p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-400"
 >
 <X className="h-5 w-5"/>
 </button>

 <div className="mb-8 text-center">
 <h3 className="font-serif text-2xl font-bold text-[#1B2A22]">
   {editingUserId ? 'Edit User' : 'New User'}
 </h3>
 <p className="text-[13px] font-medium text-gray-400 mt-1">
   {editingUserId ? 'Update user details and permissions.' : 'Add a new member to the platform.'}
 </p>
 </div>

 <form onSubmit={handleAddUser} className="space-y-5" autoComplete="off" noValidate>
 
 {/* Full Name */}
 <div className="space-y-2">
 <label className="block text-[11px] font-bold uppercase tracking-wide text-gray-500">Full Name <span className="text-red-500">*</span></label>
 <div className={`relative flex items-center bg-[#f9fafb] rounded-xl border ${errors.name ? 'border-red-500' : 'border-transparent'} focus-within:border-[#00a877] focus-within:bg-white transition-all`}>
 <User className={`absolute left-4 h-4 w-4 ${errors.name ? 'text-red-500' : 'text-gray-400'}`}/>
 <input 
 type="text"
 required
 value={newUserName}
 onChange={(e) => {
    setNewUserName(e.target.value);
    if (errors.name) setErrors({...errors, name: undefined});
  }}
 placeholder="Julianne Smith"
 className="w-full h-12 pl-11 pr-4 bg-transparent text-[13px] font-bold text-[#1B2A22] outline-none border-none placeholder:text-gray-400"
 />
 </div>
 {errors.name && <p className="text-red-500 text-[11px] font-bold mt-1">{errors.name}</p>}
 </div>

 {/* Email */}
 <div className="space-y-2">
 <label className="block text-[11px] font-bold uppercase tracking-wide text-gray-500">Email Address <span className="text-red-500">*</span></label>
 <div className={`relative flex items-center bg-[#f9fafb] rounded-xl border ${errors.email ? 'border-red-500' : 'border-transparent'} focus-within:border-[#00a877] focus-within:bg-white transition-all`}>
 <Mail className={`absolute left-4 h-4 w-4 ${errors.email ? 'text-red-500' : 'text-gray-400'}`}/>
 <input 
 type="email"
 required
 autoComplete="off"
 value={newUserEmail}
 onChange={(e) => {
    setNewUserEmail(e.target.value);
    if (errors.email) setErrors({...errors, email: undefined});
  }}
 placeholder="julianne@theestate.com"
 className="w-full h-12 pl-11 pr-4 bg-transparent text-[13px] font-bold text-[#1B2A22] outline-none border-none placeholder:text-gray-400"
 />
 </div>
 {errors.email && <p className="text-red-500 text-[11px] font-bold mt-1">{errors.email}</p>}
 </div>

 {/* Password */}
  {!editingUserId && (
  <div className="space-y-2">
  <label className="block text-[11px] font-bold uppercase tracking-wide text-gray-500">Temporary Password <span className="text-red-500">*</span></label>
  <div className={`relative flex items-center bg-[#f9fafb] rounded-xl border ${errors.password ? 'border-red-500' : 'border-transparent'} focus-within:border-[#00a877] focus-within:bg-white transition-all overflow-hidden`}>
  <div className="absolute left-4 text-gray-400 pointer-events-none">
  <Shield className={`h-4 w-4 ${errors.password ? 'text-red-500' : 'text-gray-400'}`} />
  </div>
  <input
  type={showPassword ? "text" : "password"}
  required
  autoComplete="new-password"
  value={newUserPassword}
  onChange={(e) => {
     setNewUserPassword(e.target.value);
     if (errors.password) setErrors({...errors, password: undefined});
   }}
  placeholder="••••••••"
  className="w-full h-12 pl-11 pr-12 bg-transparent text-[13px] font-bold text-[#1B2A22] outline-none border-none placeholder:text-gray-400"
  />
  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-4 text-gray-400 hover:text-[#00a877] transition-colors focus:outline-none"
  >
    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
  </button>
  </div>
  {errors.password && <p className="text-red-500 text-[11px] font-bold mt-1">{errors.password}</p>}
  </div>
  )}

 {/* Role Selection */}
 <div className="space-y-2">
 <label className="block text-[11px] font-bold uppercase tracking-wide text-gray-500">Access Level</label>
 <div className="relative">
 <button
 type="button"
 onClick={() => setIsNewUserRoleDropdownOpen(!isNewUserRoleDropdownOpen)}
 className="w-full h-12 px-4 pr-10 flex items-center justify-between bg-[#f9fafb] rounded-xl border border-transparent text-[13px] font-bold text-[#1B2A22] outline-none cursor-pointer hover:bg-gray-100 focus:border-[#00a877] focus:bg-white transition-all"
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
 className="w-full h-12 bg-[#00a877] hover:bg-[#009669] rounded-xl text-white text-[13px] font-bold transition-all active:scale-[0.99] mt-6 shadow-sm flex items-center justify-center gap-2"
 >
 {editingUserId ? 'Save Changes' : (
   <>
     <UserPlus className="h-4 w-4"/>
     <span>Grant Access</span>
   </>
 )}
 </button>

 </form>
 </div>
 </div>
 )}

 </main>
 );
}
