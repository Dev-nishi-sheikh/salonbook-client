'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authClient, signIn, signUp, signOut, getSession } from '@/lib/auth-client';
import { User, AuthState } from '@/types';
import toast from 'react-hot-toast';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: { name: string; email: string; password: string; image?: string }) => Promise<boolean>;
  googleLogin: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: { name?: string; image?: string; phone?: string }) => Promise<boolean>;
  refreshUser: () => Promise<void>;
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
          role: (session.user as any).role || 'customer',
          isBlocked: (session.user as any).isBlocked || false,
          emailVerified: session.user.emailVerified || false,
          createdAt: session.user.createdAt?.toString() || new Date().toISOString(),
          updatedAt: session.user.updatedAt?.toString() || new Date().toISOString(),
        };
        setState({
          user,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
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
      const { error } = await signIn.email({ email, password });
      if (error) {
        toast.error(error.message || 'Login failed');
        return false;
      }
      await refreshUser();
      toast.success('Welcome back!');
      return true;
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
      return false;
    }
  };

  const register = async (data: { name: string; email: string; password: string; image?: string }): Promise<boolean> => {
    try {
      const { error } = await signUp.email({ name: data.name, email: data.email, password: data.password, image: data.image });
      if (error) {
        toast.error(error.message || 'Registration failed');
        return false;
      }
      await refreshUser();
      toast.success('Account created successfully!');
      return true;
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
      return false;
    }
  };

  const googleLogin = async (): Promise<void> => {
    try {
      await signIn.social({ provider: 'google', callbackURL: '/auth/callback' });
    } catch (error: any) {
      toast.error(error.message || 'Google login failed');
    }
  };

  const logout = async () => {
    try {
      await signOut();
    } catch {
      // Ignore logout errors
    }
    setState({ user: null, isLoading: false, isAuthenticated: false });
    toast.success('Logged out successfully');
  };

  const updateProfile = async (data: { name?: string; image?: string; phone?: string }): Promise<boolean> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (result.success && result.data) {
        setState(prev => ({ ...prev, user: result.data }));
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