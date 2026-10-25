import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Users, Search, Shield, UserCheck, GraduationCap, CheckCircle2, UserX } from 'lucide-react';

export function AdminUserManageView() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await api.getAdminUsers({ search, role: roleFilter, status: statusFilter });
      setUsers(res.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter, statusFilter]);

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await api.updateUserStatus(userId, newStatus);
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.updateUserRole(userId, newRole);
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="flex-1 bg-slate-100 min-h-screen p-4 pb-16 animate-fade-in space-y-4">
      <div className="flex items-center space-x-2">
        <Users size={22} className="text-emerald-700" />
        <h2 className="font-serif-title text-xl font-bold text-slate-900">User Management</h2>
      </div>

      {/* Search & Filters */}
      <div className="space-y-2">
        <div className="relative">
          <input
            type="text"
            placeholder="Search users by name, email, department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-300 text-xs text-slate-900 rounded-xl p-2.5 pl-9 outline-none focus:border-emerald-600 shadow-sm"
          />
          <Search size={15} className="absolute left-3 top-3 text-slate-400" />
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-white border border-slate-300 rounded-xl p-2 font-semibold text-slate-700 outline-none"
          >
            <option value="ALL">All Roles</option>
            <option value="STUDENT">Students</option>
            <option value="FACULTY">Faculty</option>
            <option value="ADMIN">Admins</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-300 rounded-xl p-2 font-semibold text-slate-700 outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
      </div>

      {/* Users List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-500">Querying platform users database...</div>
        ) : users.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-slate-500 text-xs">
            No user records found matching criteria.
          </div>
        ) : (
          users.map((u) => (
            <div key={u.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center space-x-3">
                <img src={u.profileImage} alt={u.name} className="w-10 h-10 rounded-full object-cover border" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1">
                    <span className="font-bold text-sm text-slate-900 truncate">{u.name}</span>
                    {u.isVerified && <CheckCircle2 size={15} className="text-emerald-600 fill-emerald-100" />}
                  </div>
                  <p className="text-xs text-slate-500 truncate">{u.email}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 block">Role</span>
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-lg p-1 outline-none"
                  >
                    <option value="STUDENT">STUDENT</option>
                    <option value="FACULTY">FACULTY</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block">Account Status</span>
                  <select
                    value={u.status}
                    onChange={(e) => handleStatusChange(u.id, e.target.value)}
                    className={`text-xs font-bold rounded-lg p-1 outline-none border ${
                      u.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-rose-50 text-rose-800 border-rose-300'
                    }`}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                  </select>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
