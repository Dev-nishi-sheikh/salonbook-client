'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, User, UserCheck, UserX, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api';
import { User as UserType, UserRole } from '@/types';
import { classNames } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
  const [blockedFilter, setBlockedFilter] = useState<'true' | 'false' | ''>('');
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [actionType, setActionType] = useState<'block' | 'role'>('block');

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const response = await api.getUsers({
          page: pagination.page,
          limit: pagination.limit,
          search: search || undefined,
          role: roleFilter || undefined,
          isBlocked: blockedFilter || undefined,
        });
        if (response.success && response.data) {
          setUsers(response.data);
          if (response.pagination) {
            setPagination(prev => ({ ...prev, ...response.pagination }));
          }
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [pagination.page, search, roleFilter, blockedFilter]);

  const handleBlock = async (userToBlock: UserType) => {
    setSelectedUser(userToBlock);
    setActionType('block');
    setShowModal(true);
  };

  const handleRole = async (userToChange: UserType) => {
    setSelectedUser(userToChange);
    setActionType('role');
    setShowModal(true);
  };

  const handleConfirm = async () => {
    if (!selectedUser) return;

    setIsUpdating(true);
    try {
      let response;
      if (actionType === 'block') {
        response = await api.blockUnblockUser(selectedUser._id, !selectedUser.isBlocked);
      } else {
        const newRole = selectedUser.role === 'customer' ? 'admin' : 'customer';
        response = await api.updateUserRole(selectedUser._id, newRole);
      }

      if (response.success) {
        toast.success(actionType === 'block' 
          ? `User ${selectedUser.isBlocked ? 'unblocked' : 'blocked'} successfully`
          : 'User role updated successfully');
        
        setUsers(prev => prev.map(u => 
          u._id === selectedUser._id 
            ? actionType === 'block' 
              ? { ...u, isBlocked: !u.isBlocked }
              : { ...u, role: u.role === 'customer' ? 'admin' : 'customer' }
            : u
        ));
        setShowModal(false);
        setSelectedUser(null);
      } else {
        toast.error(response.message || 'Operation failed');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setIsUpdating(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-warm-gray-600">Access denied. Admin privileges required.</p>
            <Button onClick={() => router.push('/')} className="mt-4">Go Home</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      
      <main className="flex-1 py-8">
        <div className="container-main">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-charcoal-900 font-display">Manage Users</h1>
            <p className="text-warm-gray-600 mt-1">View and manage registered customers</p>
          </div>

          <div className="flex flex-wrap gap-4 mb-6">
            <div className="relative flex-1 min-w-[250px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-warm-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => { setSearch(e.target.value); setPagination(prev => ({ ...prev, page: 1 })); }}
                placeholder="Search by name or email..."
                className="input pl-10"
              />
            </div>
            <Select
              options={[
                { value: '', label: 'All Roles' },
                { value: 'customer', label: 'Customer' },
                { value: 'admin', label: 'Admin' },
              ]}
              value={roleFilter}
              onChange={e => { setRoleFilter(e.target.value as any); setPagination(prev => ({ ...prev, page: 1 })); }}
              className="w-40"
            />
            <Select
              options={[
                { value: '', label: 'All Status' },
                { value: 'false', label: 'Active' },
                { value: 'true', label: 'Blocked' },
              ]}
              value={blockedFilter}
              onChange={e => { setBlockedFilter(e.target.value as any); setPagination(prev => ({ ...prev, page: 1 })); }}
              className="w-40"
            />
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <UserRowSkeleton key={i} />
              ))}
            </div>
          ) : users.length > 0 ? (
            <>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th className="hidden md:table-cell">Email</th>
                      <th className="hidden lg:table-cell">Role</th>
                      <th>Status</th>
                      <th className="hidden lg:table-cell">Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-warm-gray-100">
                    {users.map(userItem => (
                      <UserRow
                        key={userItem._id}
                        user={userItem}
                        onBlock={handleBlock}
                        onRole={handleRole}
                        currentUserId={user._id}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button variant="outline" size="sm" onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))} disabled={pagination.page === 1}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="px-4 text-body-sm text-warm-gray-600">Page {pagination.page} of {pagination.pages}</span>
                  <Button variant="outline" size="sm" onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))} disabled={pagination.page === pagination.pages}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <User className="h-16 w-16 text-warm-gray-300 mx-auto mb-4" />
                <h3 className="text-heading-md font-medium text-charcoal-900 mb-2">No users found</h3>
                <p className="text-warm-gray-500 mb-6">Try adjusting your search or filters</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />

      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setSelectedUser(null); }}
        title={actionType === 'block' ? 'Block/Unblock User' : 'Change User Role'}
        description={actionType === 'block' 
          ? `Are you sure you want to ${selectedUser?.isBlocked ? 'unblock' : 'block'} this user?`
          : `Change role from ${selectedUser?.role} to ${selectedUser?.role === 'customer' ? 'admin' : 'customer'}?`}
      >
        <div className="space-y-4">
          {selectedUser && (
            <div className="p-4 bg-warm-gray-50 rounded-xl">
              <p className="font-medium text-charcoal-900">{selectedUser.name}</p>
              <p className="text-body-sm text-warm-gray-500">{selectedUser.email}</p>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4 border-t border-warm-gray-100">
            <Button variant="outline" onClick={() => { setShowModal(false); setSelectedUser(null); }}>
              Cancel
            </Button>
            <Button 
              variant={actionType === 'block' && selectedUser?.isBlocked ? 'primary' : actionType === 'block' ? 'danger' : 'primary'} 
              onClick={handleConfirm} 
              isLoading={isUpdating}
            >
              {isUpdating ? 'Processing...' : actionType === 'block' ? (selectedUser?.isBlocked ? 'Unblock' : 'Block') : 'Change Role'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function UserRow({ user, onBlock, onRole, currentUserId }: { user: UserType; onBlock: (u: UserType) => void; onRole: (u: UserType) => void; currentUserId: string }) {
  const isCurrentUser = user._id === currentUserId;

  return (
    <tr className="hover:bg-warm-gray-50">
      <td className="py-4">
        <div className="flex items-center gap-3">
          {user.image ? (
            <img src={user.image} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center">
              <span className="text-body-sm font-medium text-rose-600">{user.name?.charAt(0).toUpperCase()}</span>
            </div>
          )}
          <div>
            <p className="font-medium text-charcoal-900">{user.name}</p>
            {isCurrentUser && <span className="text-xs text-rose-600">(You)</span>}
          </div>
        </div>
      </td>
      <td className="py-4 hidden md:table-cell text-warm-gray-600">{user.email}</td>
      <td className="py-4 hidden lg:table-cell">
        <Badge variant={user.role === 'admin' ? 'admin' : 'customer'}>
          {user.role}
        </Badge>
      </td>
      <td className="py-4">
        <Badge variant={user.isBlocked ? 'cancelled' : 'active'}>
          {user.isBlocked ? 'Blocked' : 'Active'}
        </Badge>
      </td>
      <td className="py-4 hidden lg:table-cell text-warm-gray-500 text-body-sm">
        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
      </td>
      <td className="py-4">
        <div className="flex items-center gap-2">
          {!isCurrentUser && (
            <>
              <Button variant="ghost" size="sm" onClick={() => onBlock(user)}>
                {user.isBlocked ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onRole(user)}>
                {user.role === 'admin' ? 'User' : 'Admin'}
              </Button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

function UserRowSkeleton() {
  return (
    <tr className="animate-pulse">
      <td className="py-4"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-warm-gray-200 rounded-full" /><div className="space-y-2"><div className="h-5 bg-warm-gray-200 rounded w-3/4" /><div className="h-4 bg-warm-gray-200 rounded w-1/2" /></div></div></td>
      <td className="py-4 hidden md:table-cell"><div className="h-4 bg-warm-gray-200 rounded w-32" /></td>
      <td className="py-4 hidden lg:table-cell"><div className="h-5 bg-warm-gray-200 rounded w-20" /></td>
      <td className="py-4"><div className="h-5 bg-warm-gray-200 rounded w-20" /></td>
      <td className="py-4 hidden lg:table-cell"><div className="h-4 bg-warm-gray-200 rounded w-24" /></td>
      <td className="py-4"><div className="h-8 bg-warm-gray-200 rounded w-24" /></td>
    </tr>
  );
}