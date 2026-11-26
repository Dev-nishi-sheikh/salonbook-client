'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authClient, signOut, getSession } from '@/lib/auth-client';
import { api } from '@/lib/api';
import { User, AuthState } from '@/types';
import toast from 'react-hot-toast';
import { tokenStorage } from '@/lib/auth-tokens';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: { name: string; email: string; password: string; image?: string }) => Promise<boolean>;
  googleLogin: () => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (data: { name?: string; image?: string; phone?: string }) => Promise<boolean>;
  refreshUser: () => Promise<void>;
  fetchTokenAfterGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const refreshUser = useCallback(async () => {
    try {
      const { data: session } = await getSession();
      if (session?.user) {
        const user: User = {
          _id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          image: session.user.image || undefined,
          phone: (session.user as any).phone || undefined,
          role: (session.user as any).role || 'customer',
          isBlocked: (session.user as any).isBlocked || false,
          emailVerified: session.user.emailVerified || false,
          createdAt: session.user.createdAt?.toString() || new Date().toISOString(),
          updatedAt: session.user.updatedAt?.toString() || new Date().toISOString(),
        };
        setState({ user, isLoading: false, isAuthenticated: true });
      } else {
        // Fallback to JWT token if Better Auth session cookie is not present (e.g. email/password login)
        const token = tokenStorage.get();
        if (token) {
          const meRes = await api.client.get('/auth/me');
          if (meRes.data?.success && meRes.data?.data) {
            setState({ user: meRes.data.data, isLoading: false, isAuthenticated: true });
            return;
          }
        }
        setState({ user: null, isLoading: false, isAuthenticated: false });
      }
    } catch {
      setState({ user: null, isLoading: false, isAuthenticated: false });
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await api.client.post('/auth/login', { email, password });
      const { data, success } = response.data;
      if (!success || !data?.token) {
        toast.error(data?.message || 'Login failed');
        return false;
      }
      tokenStorage.set(data.token);
      await refreshUser();
      toast.success('Welcome back!');
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Login failed');
      return false;
    }
  };

  const register = async (data: { name: string; email: string; password: string; image?: string }): Promise<boolean> => {
    try {
      const response = await api.client.post('/auth/register', data);
      const { data: resData, success } = response.data;
      if (!success || !resData?.token) {
        toast.error(resData?.message || 'Registration failed');
        return false;
      }
      tokenStorage.set(resData.token);
      await refreshUser();
      toast.success('Account created successfully!');
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Registration failed');
      return false;
    }
  };

  const googleLogin = async (): Promise<boolean> => {
    try {
      const callbackURL = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : '/auth/callback';
      const { data, error } = await authClient.signIn.social({
        provider: 'google',
        callbackURL,
        disableRedirect: true,
      });

      if (error) {
        toast.error(error.message || 'Google sign-in failed');
        return false;
      }

      if (!data?.url) {
        toast.error('Google sign-in is not available right now. Please use email and password.');
        return false;
      }

      window.location.href = data.url;
      return true;
    } catch (error: any) {
      toast.error(error?.message || 'Google sign-in failed. Please try again.');
      return false;
    }
  };

  const fetchTokenAfterGoogle = async (): Promise<void> => {
    try {
      const response = await api.client.post('/auth/token');
      const { data, success } = response.data;
      if (success && data?.token) {
        tokenStorage.set(data.token);
      }
    } catch {
      // Silent fail - cookie auth may still work for same-domain
    }
  };

  const logout = async () => {
    try {
      await signOut();
    } catch { }
    tokenStorage.clear();
    setState({ user: null, isLoading: false, isAuthenticated: false });
    toast.success('Logged out successfully');
  };

  const updateProfile = async (data: { name?: string; image?: string; phone?: string }): Promise<boolean> => {
    try {
      const response = await api.client.put('/auth/profile', data);
      const result = response.data;
      if (result.success && result.data) {
        setState((prev) => ({ ...prev, user: result.data }));
        toast.success('Profile updated successfully');
        return true;
      }
      toast.error(result.message || 'Failed to update profile');
      return false;
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, googleLogin, logout, updateProfile, refreshUser, fetchTokenAfterGoogle }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}