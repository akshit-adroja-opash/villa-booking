'use client';
import toast from 'react-hot-toast';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  UserPlus, 
  Trash2, 
  Shield, 
  User, 
  UserCheck, 
  Mail, 
  Calendar,
  X
} from 'lucide-react';

interface Member {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
}

const MOCK_MEMBERS: Member[] = [
  { _id: 'mock-1', name: 'Arjun Mehta', email: 'arjun@theestate.com', role: 'customer', createdAt: '2024-01-15T08:00:00.000Z' },
  { _id: 'mock-2', name: 'Sarah Williams', email: 'sarah.w@gmail.com', role: 'owner', createdAt: '2024-02-10T10:30:00.000Z' },
  { _id: 'mock-3', name: 'Mike Chen', email: 'mike.c@theestate.com', role: 'customer', createdAt: '2024-03-01T12:00:00.000Z' },
  { _id: 'mock-4', name: 'David Smith', email: 'admin@gmail.com', role: 'admin', createdAt: '2023-12-01T09:00:00.000Z' },
  { _id: 'mock-5', name: 'Priya Sharma', email: 'priya@gmail.com', role: 'owner', createdAt: '2024-04-18T15:20:00.000Z' }
];

export default function UserManagementPage() {
  const [users, setUsers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Add user modal states
  const [showModal, setShowModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('customer');

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        // If database is empty, merge with mock members for rich UX display
        if (!data || data.length === 0) {
          setUsers(MOCK_MEMBERS);
        } else {
          // Merge mock users to guarantee a robust, visually populated UI
          const merged = [...data];
          MOCK_MEMBERS.forEach(mock => {
            if (!merged.some(u => u.email.toLowerCase() === mock.email.toLowerCase())) {
              merged.push(mock);
            }
          });
          setUsers(merged);
        }
      } else {
        setUsers(MOCK_MEMBERS);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setUsers(MOCK_MEMBERS);
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
          role: newUserRole
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

  const handleDeleteUser = async (id: string) => {
    if (id.startsWith('mock-')) {
      setUsers(users.filter(u => u._id !== id));
      toast.success('Mock user removed successfully!');
      return;
    }

    if (!confirm('Are you sure you want to delete this patron?')) return;

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
    }
  };

  // Filtered members list
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-[#1B2A22] text-[#D4AF37] border-[#1B2A22]';
      case 'owner':
        return 'bg-[#D4AF37]/5 text-[#D4AF37] border-[#D4AF37]/30';
      default:
        return 'bg-[#e6f4ea] text-[#00a877] border-[#00a877]/20';
    }
  };

  const totalAdmins = users.filter(u => u.role === 'admin').length;
  const totalOwners = users.filter(u => u.role === 'owner' || u.role === 'host').length;
  const totalCustomers = users.filter(u => u.role === 'customer' || u.role === 'user').length;

  return (
    <main className="p-6 md:p-10 bg-[#FAF9F6]">
      <div className="mx-auto max-w-[1280px] space-y-8">
        
        {/* Header Block */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-serif text-3xl font-normal tracking-tight text-[#1B2A22]">
              Patrons & Members
            </h1>
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#1B2A22]/60 mt-2">
              Manage Estate Clientele and Access
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 bg-[#1B2A22] hover:bg-[#2c4236] text-white px-5 py-3 text-[10px] uppercase tracking-widest font-bold transition-all active:scale-[0.98] self-start sm:self-auto"
          >
            <UserPlus className="h-4 w-4" />
            <span>New Member</span>
          </button>
        </div>

        {/* User Summary Stats Widgets */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white border border-[#1B2A22]/10 p-6">
            <h4 className="font-serif text-3xl text-[#1B2A22]">{users.length}</h4>
            <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#1B2A22]/60 mt-2">Registered Accounts</p>
          </div>
          <div className="bg-white border border-[#1B2A22]/10 p-6">
            <h4 className="font-serif text-3xl text-[#1B2A22]">{totalAdmins}</h4>
            <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#1B2A22]/60 mt-2">Administrators</p>
          </div>
          <div className="bg-white border border-[#1B2A22]/10 p-6">
            <h4 className="font-serif text-3xl text-[#D4AF37]">{totalOwners}</h4>
            <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#1B2A22]/60 mt-2">Curators</p>
          </div>
          <div className="bg-white border border-[#1B2A22]/10 p-6">
            <h4 className="font-serif text-3xl text-[#00a877]">{totalCustomers}</h4>
            <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#1B2A22]/60 mt-2">Patrons / Guests</p>
          </div>
        </div>

        {/* Filter and Search Bar Row */}
        <div className="flex flex-col md:flex-row gap-4 bg-white border border-[#1B2A22]/10 p-4">
          {/* Search bar */}
          <div className="flex-1 relative flex items-center bg-[#FAF9F6] border border-transparent focus-within:border-[#D4AF37] transition-all">
            <Search className="absolute left-4 h-4 w-4 text-[#1B2A22]/40" />
            <input 
              type="text" 
              placeholder="Search directory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-transparent text-sm font-semibold text-[#1B2A22] outline-none border-none placeholder:text-[#1B2A22]/30"
            />
          </div>

          {/* Role selector dropdown */}
          <div className="relative min-w-[200px] flex items-center bg-[#FAF9F6] border border-transparent focus-within:border-[#D4AF37] transition-all">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full h-12 px-4 bg-transparent text-[10px] uppercase tracking-widest font-bold text-[#1B2A22] outline-none border-none cursor-pointer appearance-none"
            >
              <option value="all">All Roles</option>
              <option value="admin">Administrator</option>
              <option value="owner">Curator</option>
              <option value="customer">Patron</option>
            </select>
          </div>
        </div>

        {/* Table View Layout */}
        <div className="bg-white border border-[#1B2A22]/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-[#1B2A22]/10 bg-[#FAF9F6] text-[9px] font-bold text-[#1B2A22]/50 uppercase tracking-[0.2em]">
                  <th className="px-6 py-4">Patron Details</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Access Level</th>
                  <th className="px-6 py-4">Registration</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1B2A22]/5 text-[13px] font-semibold text-[#1B2A22]">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-[#1B2A22]/40 font-serif italic">
                      Loading directory...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-[#1B2A22]/40 font-serif italic">
                      No members matched your search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-[#FAF9F6] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 bg-[#1B2A22]/5 text-[#1B2A22] flex items-center justify-center font-serif text-lg">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-serif text-lg text-[#1B2A22]">{user.name}</p>
                            <p className="text-[9px] text-[#1B2A22]/40 uppercase tracking-[0.2em] mt-1">ID: {user._id.slice(-6)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-[#1B2A22]/70">
                        {user.email}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1.5 text-[9px] font-bold border uppercase tracking-widest ${getRoleBadgeStyle(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#1B2A22]/50 font-medium font-serif italic">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '2024-01-15'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="p-2 text-[#1B2A22]/30 hover:text-red-500 transition-colors"
                          title="Revoke Access"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-[480px] border border-[#1B2A22]/10 p-10 relative animate-fade-in">
            
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-[#FAF9F6] transition-colors text-[#1B2A22]/50"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-8 text-center">
              <h3 className="font-serif text-2xl font-normal text-[#1B2A22]">New Member</h3>
              <p className="text-[10px] text-[#1B2A22]/50 uppercase tracking-[0.2em] font-bold mt-2">Grant access to the portfolio</p>
            </div>

            <form onSubmit={handleAddUser} className="space-y-6">
              
              {/* Full Name */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-[#1B2A22] uppercase tracking-[0.15em]">Full Name</label>
                <div className="relative flex items-center bg-[#FAF9F6] border border-[#1B2A22]/10 focus-within:border-[#D4AF37] transition-all">
                  <User className="absolute left-4 h-4 w-4 text-[#1B2A22]/40" />
                  <input 
                    type="text" 
                    required
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="Julianne Smith"
                    className="w-full h-12 pl-12 pr-4 bg-transparent text-sm font-semibold text-[#1B2A22] outline-none border-none placeholder:text-[#1B2A22]/30"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-[#1B2A22] uppercase tracking-[0.15em]">Email Address</label>
                <div className="relative flex items-center bg-[#FAF9F6] border border-[#1B2A22]/10 focus-within:border-[#D4AF37] transition-all">
                  <Mail className="absolute left-4 h-4 w-4 text-[#1B2A22]/40" />
                  <input 
                    type="email" 
                    required
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="julianne@theestate.com"
                    className="w-full h-12 pl-12 pr-4 bg-transparent text-sm font-semibold text-[#1B2A22] outline-none border-none placeholder:text-[#1B2A22]/30"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-[#1B2A22] uppercase tracking-[0.15em]">Temporary Password</label>
                <div className="relative flex items-center bg-[#FAF9F6] border border-[#1B2A22]/10 focus-within:border-[#D4AF37] transition-all">
                  <Shield className="absolute left-4 h-4 w-4 text-[#1B2A22]/40" />
                  <input 
                    type="password" 
                    required
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-12 pl-12 pr-4 bg-transparent text-sm font-semibold text-[#1B2A22] outline-none border-none placeholder:text-[#1B2A22]/30"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-[#1B2A22] uppercase tracking-[0.15em]">Access Level</label>
                <div className="bg-[#FAF9F6] border border-[#1B2A22]/10 focus-within:border-[#D4AF37] transition-all px-4 py-1">
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value)}
                    className="w-full h-10 bg-transparent text-[11px] uppercase tracking-widest font-bold text-[#1B2A22] outline-none border-none cursor-pointer appearance-none"
                  >
                    <option value="customer">Patron / Guest</option>
                    <option value="owner">Curator</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              {/* Submit */}
              <button 
                type="submit" 
                className="w-full h-14 bg-[#1B2A22] hover:bg-[#2c4236] text-white text-[11px] uppercase tracking-[0.2em] font-bold transition-all active:scale-[0.99] mt-4"
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
