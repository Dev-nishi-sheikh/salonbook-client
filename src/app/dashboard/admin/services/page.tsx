'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Search, Filter, Edit, Trash2, Eye, Loader2, ChevronLeft, ChevronRight, Image as ImageIcon, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api';
import { Service, ServiceStatus, type ServiceStatus as ServiceStatusType } from '@/types';
import { formatCurrency, getStatusBadgeClass, getStatusLabel, classNames } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AdminServicesPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ServiceStatusType | ''>('');
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<{
    serviceName: string;
    category: string;
    description: string;
    price: number;
    duration: number;
    image: string;
    status: ServiceStatusType;
    imageFile: File | null;
  }>({
    serviceName: '',
    category: '',
    description: '',
    price: 0,
    duration: 30,
    image: '',
    status: ServiceStatus.ACTIVE,
    imageFile: null,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      setIsLoading(true);
      try {
        const response = await api.getServices({
          page: pagination.page,
          limit: pagination.limit,
          search: search || undefined,
          status: statusFilter || undefined,
        });
        if (response.success && response.data) {
          setServices(response.data);
          if (response.pagination) {
            setPagination(prev => ({ ...prev, ...response.pagination }));
          }
        }
      } catch (error) {
        console.error('Failed to fetch services:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, [pagination.page, search, statusFilter]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.serviceName.trim()) errors.serviceName = 'Service name is required';
    if (!formData.category.trim()) errors.category = 'Category is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    else if (formData.description.length < 10) errors.description = 'Description must be at least 10 characters';
    if (formData.price <= 0) errors.price = 'Price must be positive';
    if (formData.duration <= 0) errors.duration = 'Duration must be positive';
    if (!formData.imageFile && !formData.image.trim()) errors.image = 'Image is required (upload file or provide URL)';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      serviceName: '',
      category: '',
      description: '',
      price: 0,
      duration: 30,
      image: '',
      status: ServiceStatus.ACTIVE,
      imageFile: null,
    });
    setFormErrors({});
    setPreviewImage(null);
    setEditingService(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      serviceName: service.serviceName,
      category: service.category,
      description: service.description,
      price: service.price,
      duration: service.duration,
      image: service.image,
      status: service.status,
      imageFile: null,
    });
    setPreviewImage(service.image);
    setFormErrors({});
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const formDataObj = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'imageFile' && value !== null && value !== undefined) {
          formDataObj.append(key, value.toString());
        }
      });
      // Append image file if selected
      if (formData.imageFile) {
        formDataObj.append('image', formData.imageFile);
      }

      let response;
      if (editingService) {
        response = await api.updateService(editingService._id, formDataObj);
      } else {
        response = await api.createService(formDataObj);
      }

      if (response.success) {
        toast.success(editingService ? 'Service updated successfully' : 'Service created successfully');
        setShowModal(false);
        resetForm();
        // Refresh the list
        const fetchServices = async () => {
          const res = await api.getServices({
            page: pagination.page,
            limit: pagination.limit,
            search: search || undefined,
            status: statusFilter || undefined,
          });
          if (res.success && res.data) {
            setServices(res.data);
            if (res.pagination) {
              setPagination(prev => ({ ...prev, ...res.pagination }));
            }
          }
        };
        await fetchServices();
      } else {
        toast.error(response.message || 'Operation failed');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (service: Service) => {
    if (!confirm(`Are you sure you want to delete "${service.serviceName}"?`)) return;

    try {
      const response = await api.deleteService(service._id);
      if (response.success) {
        toast.success('Service deleted successfully');
        setServices(prev => prev.filter(s => s._id !== service._id));
      } else {
        toast.error(response.message || 'Failed to delete service');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete service');
    }
  };

  const handleToggleStatus = async (service: Service) => {
    try {
      const response = await api.toggleServiceStatus(service._id);
      if (response.success && response.data) {
        setServices(prev => prev.map(s => s._id === service._id ? response.data! : s));
        toast.success(`Service ${response.data.status}`);
      } else {
        toast.error(response.message || 'Failed to update status');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update status');
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-charcoal-900 font-display">Manage Services</h1>
              <p className="text-warm-gray-600 mt-1">Add, edit, and manage salon services</p>
            </div>
            <Button onClick={handleOpenCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Button>
          </div>

          <div className="flex flex-wrap gap-4 mb-6">
            <div className="relative flex-1 min-w-[250px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-warm-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => { setSearch(e.target.value); setPagination(prev => ({ ...prev, page: 1 })); }}
                placeholder="Search services..."
                className="input pl-10"
              />
            </div>
            <Select
              options={[
                { value: '', label: 'All Status' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ]}
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value as any); setPagination(prev => ({ ...prev, page: 1 })); }}
              placeholder="Filter by status"
              className="w-48"
            />
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <ServiceRowSkeleton key={i} />
              ))}
            </div>
          ) : services.length > 0 ? (
            <>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Service</th>
                      <th className="hidden md:table-cell">Category</th>
                      <th className="hidden lg:table-cell">Price</th>
                      <th className="hidden lg:table-cell">Duration</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-warm-gray-100">
                    {services.map(service => (
                      <ServiceRow
                        key={service._id}
                        service={service}
                        onEdit={handleOpenEdit}
                        onDelete={handleDelete}
                        onToggle={handleToggleStatus}
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
                <Search className="h-16 w-16 text-warm-gray-300 mx-auto mb-4" />
                <h3 className="text-heading-md font-medium text-charcoal-900 mb-2">No services found</h3>
                <p className="text-warm-gray-500 mb-6">Try adjusting your search or add a new service</p>
                <Button onClick={handleOpenCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Service
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />

      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); resetForm(); }}
        title={editingService ? 'Edit Service' : 'Add New Service'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-5 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Service Name"
              value={formData.serviceName}
              onChange={e => setFormData(prev => ({ ...prev, serviceName: e.target.value }))}
              error={formErrors.serviceName}
              placeholder="e.g., Premium Haircut"
              required
            />
            <Select
              label="Category"
              options={[
                { value: 'Haircut & Styling', label: 'Haircut & Styling' },
                { value: 'Hair Coloring', label: 'Hair Coloring' },
                { value: 'Hair Treatment', label: 'Hair Treatment' },
                { value: 'Facial & Skincare', label: 'Facial & Skincare' },
                { value: 'Makeup', label: 'Makeup' },
                { value: 'Manicure & Pedicure', label: 'Manicure & Pedicure' },
                { value: 'Spa & Massage', label: 'Spa & Massage' },
              ]}
              value={formData.category}
              onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
              error={formErrors.category}
              required
            />
            <Input
              label="Price ($)"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={e => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
              error={formErrors.price}
              placeholder="0.00"
              required
            />
            <Input
              label="Duration (minutes)"
              type="number"
              min="1"
              value={formData.duration}
              onChange={e => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 30 }))}
              error={formErrors.duration}
              placeholder="30"
              required
            />
          </div>

          <Textarea
            label="Description"
            value={formData.description}
            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
            error={formErrors.description}
            placeholder="Describe the service..."
            rows={4}
            required
          />

          <div className="space-y-2">
            <label className="label">Image</label>
            <div className="space-y-3">
              <div>
                <label className="label">Upload Image</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setFormData(prev => ({ ...prev, imageFile: file, image: '' }));
                        setPreviewImage(URL.createObjectURL(file));
                      }
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-warm-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100"
                  />
                </div>
              </div>
              <div>
                <label className="label">Or Enter Image URL</label>
                <div className="relative">
                  <input
                    type="url"
                    value={formData.image}
                    onChange={e => { setFormData(prev => ({ ...prev, image: e.target.value, imageFile: null })); setPreviewImage(e.target.value || null); }}
                    placeholder="https://example.com/image.jpg"
                    className="input pl-10"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-gray-400">https://</span>
                </div>
              </div>
              {formErrors.image && <p className="error-text">{formErrors.image}</p>}
              {(previewImage || formData.imageFile) && (
                <div className="mt-2 flex items-center gap-2">
                  {previewImage && (
                    <img src={previewImage} alt="Preview" className="w-32 h-32 object-cover rounded-lg border border-warm-gray-200" />
                  )}
                  {formData.imageFile && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, imageFile: null, image: '' }));
                        setPreviewImage(null);
                      }}
                      className="text-body-sm text-red-600 hover:text-red-800 flex items-center gap-1"
                    >
                      <X className="h-4 w-4" />
                      Remove
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <Select
            label="Status"
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
            value={formData.status}
            onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as ServiceStatusType }))}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-warm-gray-100">
            <Button type="button" variant="outline" onClick={() => { setShowModal(false); resetForm(); }}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {isSubmitting ? 'Saving...' : editingService ? 'Update Service' : 'Create Service'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function ServiceRow({ service, onEdit, onDelete, onToggle }: { service: Service; onEdit: (s: Service) => void; onDelete: (s: Service) => void; onToggle: (s: Service) => void }) {
  return (
    <tr className="hover:bg-warm-gray-50">
      <td className="py-4">
        <div className="flex items-center gap-3">
          <img src={service.image} alt={service.serviceName} className="w-12 h-12 object-cover rounded-lg" />
          <div>
            <p className="font-medium text-charcoal-900">{service.serviceName}</p>
            <p className="text-body-sm text-warm-gray-500 truncate max-w-xs">{service.description}</p>
          </div>
        </div>
      </td>
      <td className="py-4 hidden md:table-cell text-warm-gray-600">{service.category}</td>
      <td className="py-4 hidden lg:table-cell font-medium text-charcoal-900">{formatCurrency(service.price)}</td>
      <td className="py-4 hidden lg:table-cell text-warm-gray-600">{service.duration} min</td>
      <td className="py-4">
        <Badge variant={getStatusBadgeClass(service.status)}>{getStatusLabel(service.status)}</Badge>
      </td>
      <td className="py-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit(service)}><Edit className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => onToggle(service)}>
            {service.status === 'active' ? <Eye className="h-4 w-4 text-warm-gray-600" /> : <Eye className="h-4 w-4 text-green-600" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(service)} className="text-red-600 hover:bg-red-50">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

function ServiceRowSkeleton() {
  return (
    <tr className="animate-pulse">
      <td className="py-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-warm-gray-200 rounded-lg" />
          <div className="space-y-2">
            <div className="h-5 bg-warm-gray-200 rounded w-3/4" />
            <div className="h-4 bg-warm-gray-200 rounded w-1/2" />
          </div>
        </div>
      </td>
      <td className="py-4 hidden md:table-cell"><div className="h-4 bg-warm-gray-200 rounded w-24" /></td>
      <td className="py-4 hidden lg:table-cell"><div className="h-4 bg-warm-gray-200 rounded w-20" /></td>
      <td className="py-4 hidden lg:table-cell"><div className="h-4 bg-warm-gray-200 rounded w-16" /></td>
      <td className="py-4"><div className="h-5 bg-warm-gray-200 rounded w-20" /></td>
      <td className="py-4"><div className="h-8 bg-warm-gray-200 rounded w-24" /></td>
    </tr>
  );
}