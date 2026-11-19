'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Camera, Loader2, Save, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, updateProfile, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    image: '',
    phone: '',
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        image: user.image || '',
        phone: '',
      });
      setPreviewImage(user.image || null);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    setIsLoading(true);
    const success = await updateProfile({
      name: formData.name.trim(),
      image: formData.image || undefined,
      phone: formData.phone || undefined,
    });
    setIsLoading(false);

    if (success) {
      await refreshUser();
      toast.success('Profile updated successfully');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData(prev => ({ ...prev, image: url }));
    setPreviewImage(url || null);
  };

  if (authLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-salon-600" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-gray-600">Access denied. Admin privileges required.</p>
            <Button onClick={() => router.push('/')} className="mt-4">Go Home</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Profile</h1>
            <p className="text-gray-600 mt-1">Manage your administrator account</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="relative inline-block mb-4">
                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt={user?.name || 'Profile'}
                        className="w-24 h-24 rounded-full object-cover border-4 border-salon-100"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-salon-100 flex items-center justify-center mx-auto border-4 border-salon-100">
                        <Shield className="h-12 w-12 text-salon-600" />
                      </div>
                    )}
                    <label className="absolute bottom-0 right-0 bg-salon-600 text-white p-2 rounded-full cursor-pointer hover:bg-salon-700 transition-colors">
                      <Camera className="h-4 w-4" />
                      <input
                        type="url"
                        value={formData.image}
                        onChange={handleImageChange}
                        className="sr-only"
                        placeholder="Image URL"
                      />
                    </label>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{user?.name}</h3>
                  <p className="text-gray-500 mt-1">{user?.email}</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-3 bg-purple-100 text-purple-800">
                    Administrator
                  </span>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Account Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Member since</span>
                    <span className="font-medium">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Email verified</span>
                    <span className="font-medium">{user?.emailVerified ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Role</span>
                    <span className="font-medium text-purple-600">Admin</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
                    <Input
                      label="Full Name"
                      value={formData.name}
                      onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="John Admin"
                      required
                    />

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Profile Image URL</label>
                      <div className="relative">
                        <Input
                          value={formData.image}
                          onChange={handleImageChange}
                          placeholder="https://example.com/image.jpg"
                          leftIcon={<Camera className="h-5 w-5" />}
                        />
                        {formData.image && (
                          <div className="mt-2">
                            <img src={formData.image} alt="Preview" className="w-20 h-20 rounded-lg object-cover border border-gray-200" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">Enter a direct image URL (ImgBB, Imgur, etc.)</p>
                    </div>

                    <Input
                      label="Phone Number (Optional)"
                      type="tel"
                      value={formData.phone}
                      onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+1 (555) 123-4567"
                    />

                    <div className="flex justify-end pt-4 border-t border-gray-100">
                      <Button type="submit" isLoading={isLoading}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}