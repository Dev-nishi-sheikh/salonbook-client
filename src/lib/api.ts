import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { ApiResponse, User, Service, Appointment, Transaction, PaginationParams } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_URL}/api`,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/signin';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Services
  async getServices(params?: PaginationParams) {
    const response = await this.client.get<ApiResponse<Service[]>>('/services', { params });
    return response.data;
  }

  async getFeaturedServices() {
    const response = await this.client.get<ApiResponse<Service[]>>('/services/featured');
    return response.data;
  }

  async getServiceCategories() {
    const response = await this.client.get<ApiResponse<string[]>>('/services/categories');
    return response.data;
  }

  async getServiceById(id: string) {
    const response = await this.client.get<ApiResponse<Service>>(`/services/${id}`);
    return response.data;
  }

  async createService(data: FormData) {
    const response = await this.client.post<ApiResponse<Service>>('/services', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async updateService(id: string, data: FormData) {
    const response = await this.client.put<ApiResponse<Service>>(`/services/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async deleteService(id: string) {
    const response = await this.client.delete<ApiResponse<void>>(`/services/${id}`);
    return response.data;
  }

  async toggleServiceStatus(id: string) {
    const response = await this.client.patch<ApiResponse<Service>>(`/services/${id}/toggle`);
    return response.data;
  }

  // Appointments
  async getTimeSlots() {
    const response = await this.client.get<ApiResponse<string[]>>('/appointments/time-slots');
    return response.data;
  }

  async getAppointmentStats() {
    const response = await this.client.get<ApiResponse<{ total: number; pending: number; confirmed: number; cancelled: number }>>('/appointments/stats');
    return response.data;
  }

  async getMyAppointments(params?: PaginationParams) {
    const response = await this.client.get<ApiResponse<Appointment[]>>('/appointments/my', { params });
    return response.data;
  }

  async getAppointmentById(id: string) {
    const response = await this.client.get<ApiResponse<Appointment>>(`/appointments/${id}`);
    return response.data;
  }

  async createAppointment(data: { serviceId: string; appointmentDate: string; timeSlot: string; message?: string }) {
    const response = await this.client.post<ApiResponse<Appointment>>('/appointments', data);
    return response.data;
  }

  async cancelAppointment(id: string) {
    const response = await this.client.delete<ApiResponse<void>>(`/appointments/${id}`);
    return response.data;
  }

  async getAllAppointments(params?: PaginationParams) {
    const response = await this.client.get<ApiResponse<Appointment[]>>('/appointments', { params });
    return response.data;
  }

  async updateAppointmentStatus(id: string, status: string) {
    const response = await this.client.patch<ApiResponse<Appointment>>(`/appointments/${id}/status`, { status });
    return response.data;
  }

  // Transactions
  async initiatePayment(appointmentId: string) {
    const response = await this.client.post<ApiResponse<{ sessionId: string; url: string }>>('/transactions/initiate', { appointmentId });
    return response.data;
  }

  async paymentSuccess(sessionId: string) {
    const response = await this.client.get<ApiResponse<any>>('/transactions/success', { params: { session_id: sessionId } });
    return response.data;
  }

  async getTransactions(params?: PaginationParams) {
    const response = await this.client.get<ApiResponse<Transaction[]>>('/transactions', { params });
    return response.data;
  }

  async getTransactionStats() {
    const response = await this.client.get<ApiResponse<{ total: number; paid: number; failed: number; totalAmount: number }>>('/transactions/stats');
    return response.data;
  }

  async getTransactionById(id: string) {
    const response = await this.client.get<ApiResponse<Transaction>>(`/transactions/${id}`);
    return response.data;
  }

  // Users (Admin)
  async getDashboardStats() {
    const response = await this.client.get<ApiResponse<any>>('/users/stats');
    return response.data;
  }

  async getUsers(params?: PaginationParams & { role?: string; isBlocked?: string }) {
    const response = await this.client.get<ApiResponse<User[]>>('/users', { params });
    return response.data;
  }

  async getUserById(id: string) {
    const response = await this.client.get<ApiResponse<User>>(`/users/${id}`);
    return response.data;
  }

  async blockUnblockUser(id: string, isBlocked: boolean) {
    const response = await this.client.patch<ApiResponse<User>>(`/users/${id}/block`, { isBlocked });
    return response.data;
  }

  async updateUserRole(id: string, role: string) {
    const response = await this.client.patch<ApiResponse<User>>(`/users/${id}/role`, { role });
    return response.data;
  }

  async deleteUser(id: string) {
    const response = await this.client.delete<ApiResponse<void>>(`/users/${id}`);
    return response.data;
  }
}

export const api = new ApiClient();