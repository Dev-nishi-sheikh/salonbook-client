'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { api } from '@/lib/api';
import { User, AuthState } from '@/types';
import toast from 'react-hot-toast';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: { name: string; email: string; password: string; image?: string }) => Promise<boolean>;
  googleLogin: (idToken: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (data: { name?: string; image?: string; phone?: string }) => Promise<boolean>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const refreshUser = useCallback(async () => {
    try {
      const response = await api.getMe();
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          user: response.data!,
          isAuthenticated: true,
          isLoading: false,
        }));
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(response.data));
        }
      } else {
        throw new Error('Failed to fetch user');
      }
    } catch {
      setState(prev => ({ ...prev, user: null, token: null, isAuthenticated: false, isLoading: false }));
      api.clearToken();
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const token = api.getToken();
      const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      
      if (token && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setState({
            user: parsedUser,
            token,
            isLoading: false,
            isAuthenticated: true,
          });
          await refreshUser();
        } catch {
          api.clearToken();
          setState({ user: null, token: null, isLoading: false, isAuthenticated: false });
        }
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initAuth();
  }, [refreshUser]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await api.login({ email, password });
      if (response.success && response.data) {
        setState({
          user: response.data.user,
          token: response.data.token,
          isLoading: false,
          isAuthenticated: true,
        });
        toast.success('Welcome back!');
        return true;
      }
      toast.error(response.message || 'Login failed');
      return false;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
      return false;
    }
  };

  const register = async (data: { name: string; email: string; password: string; image?: string }): Promise<boolean> => {
    try {
      const response = await api.register(data);
      if (response.success && response.data) {
        setState({
          user: response.data.user,
          token: response.data.token,
          isLoading: false,
          isAuthenticated: true,
        });
        toast.success('Account created successfully!');
        return true;
      }
      toast.error(response.message || 'Registration failed');
      return false;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
      return false;
    }
  };

  const googleLogin = async (idToken: string): Promise<boolean> => {
    try {
      const response = await api.googleAuth(idToken);
      if (response.success && response.data) {
        setState({
          user: response.data.user,
          token: response.data.token,
          isLoading: false,
          isAuthenticated: true,
        });
        toast.success('Welcome!');
        return true;
      }
      toast.error(response.message || 'Google login failed');
      return false;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Google login failed');
      return false;
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // Ignore logout errors
    }
    setState({ user: null, token: null, isLoading: false, isAuthenticated: false });
    toast.success('Logged out successfully');
  };

  const updateProfile = async (data: { name?: string; image?: string; phone?: string }): Promise<boolean> => {
    try {
      const response = await api.updateProfile(data);
      if (response.success && response.data) {
        setState(prev => ({ ...prev, user: response.data! }));
        toast.success('Profile updated successfully');
        return true;
      }
      toast.error(response.message || 'Failed to update profile');
      return false;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, googleLogin, logout, updateProfile, refreshUser }}>
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